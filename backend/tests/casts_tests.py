import os
import unittest

import json

from sqlalchemy import text, create_engine

from app import create_app
from models import Cast, db
from utilities.hydrate_db import make_movies, make_actors
from dotenv import load_dotenv
import json

load_dotenv()


class CastTestCase(unittest.TestCase):
    def setUp(self):
        self.database_name = "casting_test"
        database_path = os.environ["TEST_DATABASE_URL"]
        if database_path.startswith("postgres://"):
            database_path = database_path.replace("postgres://", "postgresql://", 1)
        self.engine = create_engine(database_path)

        self.app = create_app(
            {
                "SQLALCHEMY_DATABASE_URI": database_path,
                "SQLALCHEMY_TRACK_MODIFICATIONS": False,
                "TESTING": True,
            }
        )
        self.client = self.app.test_client()

        # Clean out the db for a fresh test setup
        with self.engine.connect() as connection:
            connection.execute(text("DROP TABLE IF EXISTS actors CASCADE;"))
            connection.execute(text("DROP TABLE IF EXISTS movies CASCADE;"))
            connection.execute(text("DROP TABLE IF EXISTS casts CASCADE;"))
            connection.close()

        # Bind the app to the current context and create all tables
        with self.app.app_context():
            db.create_all()
            db.session.add_all(make_movies(self.app))
            db.session.add_all(make_actors(self.app))
            db.session.commit()

    def tearDown(self):
        with self.engine.connect() as connection:
            connection.execute(text("DROP TABLE actors CASCADE;"))
            connection.execute(text("DROP TABLE movies CASCADE;"))
            connection.execute(text("DROP TABLE casts CASCADE;"))
            connection.close()
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_create_cast(self):
        new_cast = {"movieId": 1, "actorId": 1}

        res = self.client.post("/casts", json=new_cast, content_type="application/json")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 201)
        self.assertTrue(data["success"])
        self.assertEqual(data["id"], "movie-1-actor-1")

    def test_create_cast_400_bad_data(self):
        new_cast = {"movieId": "quack", "actorId": "moo"}

        res = self.client.post("/casts", json=new_cast, content_type="application/json")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data["success"])

    def test_create_cast_400_cast_already_exists(self):
        new_cast = {"movieId": 1, "actorId": 1}

        res = self.client.post("/casts", json=new_cast, content_type="application/json")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 201)
        self.assertTrue(data["success"])
        self.assertEqual(data["id"], "movie-1-actor-1")

        duplicate_cast = {"movieId": 1, "actorId": 1}

        res = self.client.post(
            "/casts", json=duplicate_cast, content_type="application/json"
        )
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data["success"])

    def test_create_cast_415(self):
        payload = 0b10101010

        res = self.client.post(
            "/casts", data=bytes(payload), content_type="application/octet-stream"
        )
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 415)
        self.assertFalse(data["success"])
        self.assertEqual(data["error"], "Unsupported Media Type")

    def test_delete_cast(self):
        with self.app.app_context():
            cast = Cast(movie_id=1, actor_id=1)
            cast.add()

        res = self.client.delete("/casts/movies/1/actors/1")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data["success"])
        self.assertEqual(data["id"], "movie-1-actor-1")

    def test_delete_cast_404_bad_movie_id(self):
        # Flask automatically validates the route params, and 404s if they are bad
        with self.app.app_context():
            cast = Cast(movie_id=1, actor_id=1)
            cast.add()

        res = self.client.delete("/casts/movies/boom/actors/1")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data["success"])
        self.assertEqual(data["error"], "Not Found")

    def test_delete_cast_404_bad_actor_id(self):
        # Flask automatically validates the route params, and 404s if they are bad
        with self.app.app_context():
            cast = Cast(movie_id=1, actor_id=1)
            cast.add()

        res = self.client.delete("/casts/movies/1/actors/boom")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data["success"])
        self.assertEqual(data["error"], "Not Found")


# Make the tests conveniently executable
if __name__ == "__main__":
    unittest.main()
