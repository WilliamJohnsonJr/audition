import os
from flask import Flask, jsonify
from actors.actors_controller import actors_controller
from casts.casts_controller import casts_controller
from models import setup_db
from flask_cors import CORS
from movies.movies_controller import movies_controller

origins = os.environ.get("ORIGINS", "localhost")


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

    movies_controller(app)

    actors_controller(app)

    casts_controller(app)

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
