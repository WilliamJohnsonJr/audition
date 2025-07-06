from datetime import date, datetime
from typing import Optional
from flask import Flask, abort, make_response, request, jsonify
from models import Genre, Movie
from utilities.utilities import (
    _abort_if_falsy_and_not_none,
    _camel_case_dict,
    _convert_json_patch_request_to_dict,
    _create_etag,
)

MOVIES_PER_PAGE = 10


def movies_controller(app: Flask):
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
            isinstance(body.get("title"), str)
            and body.get("title")
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

        title: str = body.get("title")
        title = title.strip()
        genre: str = body.get("genre")
        genre = genre.strip()
        release_date: str | None = body.get("releaseDate", None)
        if release_date:
            release_date = release_date.strip()
        parsed_date: Optional[date] = None
        if release_date:
            try:
                parsed_date = datetime.strptime(release_date, "%Y-%m-%d").date()
            except Exception:
                abort(400)

        movie = Movie(
            title=title,
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
                    movie.title = data["title"].strip()
            if key == "genre":
                if not data["genre"]:
                    abort(400)
                try:
                    movie.genre = Genre[data["genre"].strip()]
                except Exception:
                    abort(400)
            if key == "release_date":
                if (
                    data["release_date"] and not isinstance(data["release_date"], str)
                ) or _abort_if_falsy_and_not_none(data["release_date"]):
                    abort(400)
                try:
                    movie.release_date = (
                        datetime.strptime(
                            data["release_date"].strip(), "%Y-%m-%d"
                        ).date()
                        if data["release_date"]
                        else None
                    )
                except Exception:
                    abort(400)
            if key == "poster_url":
                if (
                    data["poster_url"] and not isinstance(data["poster_url"], str)
                ) or _abort_if_falsy_and_not_none(data["poster_url"]):
                    abort(400)
                movie.poster_url = (
                    data["poster_url"].strip() if data["poster_url"] else None
                )

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
