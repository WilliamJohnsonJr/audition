from flask import Flask, abort, make_response, request, jsonify
from models import Gender, Actor
from utilities.utilities import (
    _abort_if_falsy_and_not_none,
    _camel_case_dict,
    _convert_json_patch_request_to_dict,
    _create_etag,
)
from auth.validator import requires_auth

ACTORS_PER_PAGE = 10


def actors_controller(app: Flask):
    @app.route("/actors", methods=["GET"])
    @requires_auth("read:actors")
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
    @requires_auth("create:actors")
    def post_actor():
        body = request.get_json()
        if not (
            isinstance(body.get("name"), str)
            and (
                body.get("gender") is None
                or body.get("gender") in (gender.value for gender in Gender)
            )
            and isinstance(body.get("age"), int)
            and body.get("age") > 0
            and (body.get("photoUrl") is None or isinstance(body.get("photoUrl"), str))
        ):
            abort(400)

        gender = body.get("gender", None)
        name: str = body.get("name")
        photo_url: str | None = body.get("photoUrl", None)
        if photo_url:
            photo_url = photo_url.strip()

        actor = Actor(
            name=name.strip(),
            gender=(Gender[gender] if gender else None),
            age=body.get("age"),
            photo_url=photo_url,
        )

        actor.add()
        return jsonify({"success": True, "id": actor.id}), 201

    @app.route("/actors/<int:actor_id>", methods=["GET"])
    @requires_auth("read:actors")
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
    @requires_auth("modify:actors")
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
                    actor.name = data["name"].strip()
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
                actor.photo_url = (
                    data["photo_url"].strip() if data["photo_url"] else None
                )

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
    @requires_auth("delete:actors")
    def delete_actor(actor_id: int):
        if not isinstance(actor_id, int):
            abort(400)
        actor = Actor.query.get_or_404(actor_id)
        actor_id = actor.id
        actor.delete()

        payload = _camel_case_dict({"success": True, "id": actor_id})
        response = make_response(jsonify(payload), 200)
        return response
