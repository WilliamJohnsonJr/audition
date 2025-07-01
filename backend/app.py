from datetime import date, datetime
import os
import re
import json
import hashlib
from typing import Optional
from sqlalchemy.exc import IntegrityError
from flask import Flask, abort, make_response, request, jsonify
from models import Gender, Genre, setup_db, Movie, Actor
from flask_cors import CORS

origins = os.environ.get("ORIGINS", "localhost")

MOVIES_PER_PAGE = 10
ACTORS_PER_PAGE = 10


def _camel_to_snake(camel_case_str: str):
    # Use regex to replace camelCase with snake_case
    snake_case_str = re.sub(r"(?<!^)(?=[A-Z])", "_", camel_case_str).lower()
    return snake_case_str


def _snake_to_camel(snake_case_str: str):
    camel_case_str = re.sub(
        r"_(.)", lambda match: match.group(1).upper(), snake_case_str
    )
    return camel_case_str


def _camel_case_dict(item: dict):
    new_item = {}
    for key in item:
        if isinstance(item[key], list):
            new_list = [_camel_case_dict(list_item) for list_item in item[key]]
            new_item[_snake_to_camel(key)] = new_list
        elif isinstance(item[key], dict):
            new_item[_snake_to_camel(key)] = _camel_case_dict(item[key])
        else:
            new_item[_snake_to_camel(key)] = item[key]
    return new_item


def _convert_json_patch_request_to_dict(body: list[dict], model: type[Movie | Actor]):
    new_dict = {}
    for item in body:
        if not isinstance(item, dict):
            raise TypeError("invalid JSON patch schema")
        if item["op"] is None or item["op"] not in ["add", "remove"] or (item["op"] == "remove" and "value" in item.keys()):
            raise ValueError("invalid JSON patch operation")
        if item["path"] is None or _camel_to_snake(item["path"][1:]) not in [column.name for column in model.__table__.columns]:  # type: ignore
            raise ValueError("invalid JSON patch path")
        new_dict[_camel_to_snake(item["path"][1:])] = item["value"] if item["op"] != "remove" else None

    return new_dict


def _create_etag(record: Movie | Actor):
    # Convert the dictionary to a JSON string
    orig_dict_string = json.dumps(
        record.format(), sort_keys=True
    )  # sort_keys to ensure consistent ordering
    # Create a SHA-256 hash of the string to use for comparison and as an ETag
    return hashlib.sha256(orig_dict_string.encode()).hexdigest()

def _abort_if_falsy_and_not_none(value):
    return not value and value != None

def create_app(test_config=None):

    app = Flask(__name__)
    if test_config is None:
        setup_db(app)
    else:
        database_path = test_config.get("SQLALCHEMY_DATABASE_URI")
        setup_db(app, database_path=database_path)
    CORS(app, origins=origins)

    @app.after_request
    def after_request(response):
        response.headers.add(
            "Access-Control-Allow-Headers", "Content-Type, Authorization"
        )
        response.headers.add(
            "Access-Control-Allow-Headers", "OPTIONS, GET, POST, PATCH, DELETE"
        )
        return response

    @app.route("/movies", methods=["GET"])
    def get_movies():
        page = request.args.get("page", 1, type=int)
        filter_by = request.args.get("search", "", type=str)
        search_term = f"%{filter_by}%"
        start = (page - 1) * MOVIES_PER_PAGE
        end = start + MOVIES_PER_PAGE
        count = Movie.query.filter(Movie.title.ilike(search_term)).count()
        movies = (
            Movie.query.filter(Movie.title.ilike(search_term))
            .order_by(Movie.title)
            .slice(start, end)
            .all()
        )

        payload = _camel_case_dict(
            {
                "success": True,
                "movies": [movie.format() for movie in movies],
                "total_movies": count,
                "offset": start,
            }
        )

        return (
            jsonify(payload),
            200,
        )

    @app.route("/movies", methods=["POST"])
    def post_movie():
        body = request.get_json()
        if not (
            isinstance(body.get("title"), str) and body.get("title")
            and body.get("genre") in (genre.value for genre in Genre)
            and (
                body.get("releaseDate") is None
                or isinstance(body.get("releaseDate"), str)
            )
            and (
                body.get("posterUrl") is None or isinstance(body.get("posterUrl"), str)
            )
        ):
            abort(400)

        genre = body.get("genre")
        release_date = body.get("releaseDate", None)
        parsed_date: Optional[date] = None
        if release_date:
            try:
                parsed_date = datetime.strptime(release_date, "%Y-%m-%d").date()
            except Exception:
                abort(400)

        movie = Movie(
            title=body.get("title"),
            genre=(Genre[genre]),
            release_date=(parsed_date if parsed_date else None),
            poster_url=body.get("posterUrl", None),
        )

        movie.add()

        return jsonify({"success": True, "id": movie.id}), 201

    @app.route("/movies/<int:movie_id>", methods=["GET"])
    def get_movie(movie_id: int):
        if not isinstance(movie_id, int):
            abort(400)
        movie = Movie.query.get_or_404(movie_id)
        etag = _create_etag(movie)

        payload = _camel_case_dict({"success": True, "movie": movie.format()})

        response = make_response(jsonify(payload), 200)
        response.headers["ETag"] = etag
        return response

    # JSON Patch https://datatracker.ietf.org/doc/html/rfc6902
    # No operations are allowed besides add and remove. Use add instead of replace.
    #     [
    #      { "op": "remove", "path": "/a/b/c" },
    #      { "op": "add", "path": "/a/b/c", "value": [ "foo", "bar" ] }
    #    ]
    @app.route("/movies/<int:movie_id>", methods=["PATCH"])
    def update_movie(movie_id: int):
        if not isinstance(movie_id, int):
            abort(400)
        if request.headers.get("Content-Type") != "application/json-patch+json":
            abort(415)

        body = request.get_json()

        if body is None or not isinstance(body, list):
            abort(400)

        try:
            data = _convert_json_patch_request_to_dict(body, Movie)
        except TypeError:
            abort(400)
        except ValueError:
            abort(400)

        movie = Movie.query.get_or_404(movie_id)

        orig_hash = _create_etag(movie)

        for key in data:
            if key == "title":
                if not data["title"] or not isinstance(data["title"], str):
                    abort(400)
                else:
                    movie.title = data["title"]
            if key == "genre":
                if not data["genre"]:
                    abort(400)
                try:
                    movie.genre = Genre[data["genre"]]
                except Exception:
                    abort(400)
            if key == "release_date":
                if (data["release_date"] and not isinstance(data["release_date"], str)) or _abort_if_falsy_and_not_none(data["release_date"]):
                    abort(400)
                try:
                    movie.release_date = (
                        datetime.strptime(data["release_date"], "%Y-%m-%d").date()
                        if data["release_date"]
                        else None
                    )
                except Exception:
                    abort(400)
            if key == "poster_url":
                if (data["poster_url"] and not isinstance(data["poster_url"], str)) or _abort_if_falsy_and_not_none(data["poster_url"]):
                    abort(400)
                movie.poster_url = data["poster_url"]

        new_hash = _create_etag(movie)

        if new_hash == orig_hash:
            response = make_response(jsonify(), 204)
            response.headers["ETag"] = orig_hash
            return response
        else:
            movie.update()  # Only update if content changed
            response = make_response(jsonify({"success": True, "id": movie.id}), 200)
            response.headers["ETag"] = new_hash
            return response

    @app.route("/movies/<int:movie_id>", methods=["DELETE"])
    def delete_movie(movie_id: int):
        if not isinstance(movie_id, int):
            abort(400)
        movie = Movie.query.get_or_404(movie_id)
        movie_id = movie.id
        movie.delete()

        payload = _camel_case_dict({"success": True, "id": movie_id})
        response = make_response(jsonify(payload), 200)
        return response

    @app.route("/actors", methods=["GET"])
    def get_actors():
        page = request.args.get("page", 1, type=int)
        filter_by = request.args.get("search", "", type=str)
        search_term = f"%{filter_by}%"
        start = (page - 1) * ACTORS_PER_PAGE
        end = start + ACTORS_PER_PAGE
        count = Actor.query.filter(Actor.name.ilike(search_term)).count()
        actors = (
            Actor.query.filter(Actor.name.ilike(search_term))
            .order_by(Actor.name)
            .slice(start, end)
            .all()
        )
        payload = _camel_case_dict(
            {
                "success": True,
                "actors": [actor.format() for actor in actors],
                "total_actors": count,
                "offset": start,
            }
        )
        return (
            jsonify(payload),
            200,
        )

    @app.route("/actors", methods=["POST"])
    def post_actor():
        body = request.get_json()
        if not (
            isinstance(body.get("name"), str)
            and (
                body.get("gender") is None
                or body.get("gender") in (gender.value for gender in Gender)
            )
            and isinstance(body.get("age"), int) and body.get("age") > 0
            and (body.get("photoUrl") is None or isinstance(body.get("photoUrl"), str))
        ):
            abort(400)

        gender = body.get("gender", None)

        actor = Actor(
            name=body.get("name"),
            gender=(Gender[gender] if gender else None),
            age=body.get("age"),
            photo_url=body.get("photoUrl", None),
        )

        actor.add()
        return jsonify({"success": True, "id": actor.id}), 201

    @app.route("/actors/<int:actor_id>", methods=["GET"])
    def get_actor(actor_id: int):
        if not isinstance(actor_id, int):
            abort(400)
        actor = Actor.query.get_or_404(actor_id)
        etag = _create_etag(actor)

        payload = _camel_case_dict({"success": True, "actor": actor.format()})
        response = make_response(jsonify(payload), 200)
        response.headers["ETag"] = etag
        return response

    # JSON Patch https://datatracker.ietf.org/doc/html/rfc6902
    # No operations are allowed besides add and remove. Use add instead of replace.
    #     [
    #      { "op": "remove", "path": "/a/b/c" },
    #      { "op": "add", "path": "/a/b/c", "value": [ "foo", "bar" ] }
    #    ]
    @app.route("/actors/<int:actor_id>", methods=["PATCH"])
    def update_actor(actor_id: int):
        if not isinstance(actor_id, int):
            abort(400)
        if request.headers.get("Content-Type") != "application/json-patch+json":
            abort(415)

        body = request.get_json()

        if body is None or not isinstance(body, list):
            abort(400)

        try:
            data = _convert_json_patch_request_to_dict(body, Actor)
        except TypeError:
            abort(400)
        except ValueError:
            abort(400)

        actor = Actor.query.get_or_404(actor_id)

        orig_hash = _create_etag(actor)

        for key in data:
            if key == "name":
                if not data["name"] or not isinstance(data["name"], str):
                    abort(400)
                else:
                    actor.name = data["name"]
            if key == "gender":
                try:
                    actor.gender = Gender[data["gender"]] if data["gender"] else None
                except Exception:
                    abort(400)
            if key == "age":
                if not data["age"] or not isinstance(data["age"], int):
                    abort(400)
                actor.age = data["age"]
            if key == "photo_url":
                if _abort_if_falsy_and_not_none(data["photo_url"]):
                    abort(400)
                if data["photo_url"] and not isinstance(data["photo_url"], str):
                    return abort(400)
                actor.photo_url = data["photo_url"]

        new_hash = _create_etag(actor)

        if new_hash == orig_hash:
            response = make_response(jsonify(), 204)
            response.headers["ETag"] = orig_hash
            return response
        else:
            actor.update()  # Only update if content changed
            response = make_response(jsonify({"success": True, "id": actor.id}), 200)
            response.headers["ETag"] = new_hash
            return response

    @app.route("/actors/<int:actor_id>", methods=["DELETE"])
    def delete_actor(actor_id: int):
        if not isinstance(actor_id, int):
            abort(400)
        actor = Actor.query.get_or_404(actor_id)
        actor_id = actor.id
        actor.delete()

        payload = _camel_case_dict({"success": True, "id": actor_id})
        response = make_response(jsonify(payload), 200)
        return response

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"success": False, "error": "Bad Request"}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "error": "Not Found"}), 404

    @app.errorhandler(405)
    def not_allowed(error):
        return jsonify({"success": False, "error": "Method Not Allowed"}), 405

    @app.errorhandler(415)
    def unsupported_media_type(error):
        return jsonify({"success": False, "error": "Unsupported Media Type"}), 415

    @app.errorhandler(422)
    def unprocessable_content(error):
        return jsonify({"success": False, "error": "Unprocessable Content"}), 422

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({"success": False, "error": "Internal Server Error"}), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run()
