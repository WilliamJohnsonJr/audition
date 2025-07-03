from flask import Flask, abort, jsonify, request
from models import Cast


def casts_controller(app: Flask):
    @app.route("/casts", methods=["POST"])
    def post_cast():
        body = request.get_json()

        if (
            not body.get("movie_id")
            or not body.get("actor_id")
            or not isinstance(body.get("movie_id"), int)
            or not isinstance(body.get("actor_id"), int)
        ):
            abort(400)

        movie_id = body.get("movie_id")
        actor_id = body.get("actor_id")

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
    def delete_cast(movie_id: int, actor_id: int):
        cast = Cast.query.filter(
            Cast.movie_id == movie_id and Cast.actor_id == actor_id
        ).one_or_404()
        cast.delete()
        return (
            jsonify(
                {"success": True, "id": f"movie-{cast.movie_id}-actor-{cast.actor_id}"}
            ),
            200,
        )
