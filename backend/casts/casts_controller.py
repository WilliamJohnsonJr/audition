from flask import Flask, abort, jsonify, request
from models import Cast
from auth.validator import requires_auth


def casts_controller(app: Flask):
    @app.route("/casts", methods=["POST"])
    @requires_auth("create:casts")
    def post_cast():
        body = request.get_json()

        if (
            not body.get("movieId")
            or not body.get("actorId")
            or not isinstance(body.get("movieId"), int)
            or not isinstance(body.get("actorId"), int)
        ):
            abort(400)

        movie_id = body.get("movieId")
        actor_id = body.get("actorId")

        try:
            cast = Cast(movie_id=movie_id, actor_id=actor_id)
            cast.add()
            return (
                jsonify(
                    {
                        "success": True,
                        "id": f"movie-{cast.movie_id}-actor-{cast.actor_id}",
                    }
                ),
                201,
            )
        except:
            abort(400)

    @app.route("/casts/movies/<int:movie_id>/actors/<int:actor_id>", methods=["DELETE"])
    @requires_auth("delete:casts")
    def delete_cast(movie_id: int, actor_id: int):
        cast = Cast.query.filter(
            (Cast.movie_id == movie_id) & (Cast.actor_id == actor_id)
        ).one_or_404()
        cast.delete()
        return (
            jsonify(
                {"success": True, "id": f"movie-{cast.movie_id}-actor-{cast.actor_id}"}
            ),
            200,
        )
