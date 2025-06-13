import os
from flask import Flask, abort, request, jsonify
from models import setup_db, Movie, Actor
from flask_cors import CORS

origins = os.environ.get("ORIGINS", "localhost")

def create_app(test_config=None):

    app = Flask(__name__)
    setup_db(app)
    CORS(app, origins=origins)

    @app.route("/movies", methods=["GET"])
    def get_movies():
        filter_by = request.args.get("search", "", type=str)
        search_term = f"%{filter_by}%"
        movies = Movie.query.filter(Movie.title.ilike(search_term)).order_by(Movie.title).all()

        return (
            jsonify({"success": True, "movies": [movie.format() for movie in movies]}),
            200,
        )

    @app.route("/actors", methods=["GET"])
    def get_actors():
        filter_by = request.args.get("search", "", type=str)
        search_term = f"%{filter_by}%"
        actors = Actor.query.filter(Actor.name.ilike(search_term)).order_by(Actor.name).all()
        return (
            jsonify({"success": True, "actors": [actor.format() for actor in actors]}),
            200,
        )

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
    def unsupported_media_type(error):
        return jsonify({"success": False, "error": "Unprocessable Content"}), 422

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({"success": False, "error": "Internal Server Error"}), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run()
