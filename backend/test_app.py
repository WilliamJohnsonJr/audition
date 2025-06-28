import os
import unittest

import json

from sqlalchemy import text, create_engine

from app import create_app
from models import db, Actor
from hydrate_test_db import make_movies, make_actors

import json


class AuditionTestCase(unittest.TestCase):
    def setUp(self):
        self.database_name = "casting_test"
        database_path = os.environ["DATABASE_URL"]
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
            connection.close()
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_get_actors(self):
        res = self.client.get("/actors")
        data = json.loads(res.data)
        actors = data["actors"]

        self.assertEqual(res.status_code, 200)
        self.assertEqual(
            list(data.keys()),
            [
                "actors",
                "offset",
                "success",
                "totalActors",
            ],
        )
        self.assertDictEqual(
            data["actors"][0],
            {
                "id": 6,
                "name": "Andy Serkis",
                "age": 61,
                "gender": "MALE",
                "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Andy_Serkis_at_MEGACON_Orlando_2025.png/640px-Andy_Serkis_at_MEGACON_Orlando_2025.png",
            },
        )
        self.assertEqual(len(actors), 10)

    def test_get_actors_pagination(self):
        res = self.client.get("/actors?page=2")
        data = json.loads(res.data)
        actors = data["actors"]

        self.assertEqual(res.status_code, 200)
        self.assertLessEqual(len(data["actors"]), 9)
        self.assertGreaterEqual(data["totalActors"], 19)
        self.assertEqual(
            [actor["id"] for actor in actors],
            [8, 15, 17, 13, 18, 2, 4, 7, 1],
        )

    def test_get_actors_bad_query_param_type_200(self):
        # ignore improper query params and return a default of 1 for page
        res = self.client.get("/actors?page=sizzle")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertLessEqual(len(data["actors"]), 10)

    def test_delete_actor(self):
        res = self.client.delete("/actors/2")
        data = json.loads(res.data)
        with self.app.app_context():
            actor_or_none = Actor.query.filter(Actor.id == 2).one_or_none()
            self.assertEqual(res.status_code, 200)
            self.assertEqual(data["success"], True)
            self.assertEqual(data["id"], 2)
            self.assertEqual(actor_or_none, None)

    def test_delete_actor_error(self):
        res = self.client.delete("/actors/200")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertEqual(data["success"], False)
        self.assertEqual(data["error"], "Not Found")

    def test_create_actor(self):
        new_actor = {
            "age": 4,
            "gender": "MALE",
            "name": "Dana Carvey",
            "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Dana_Carvey%2C_USO.JPG",
        }
        res = self.client.post("/actors", json=new_actor)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 201)
        self.assertTrue(isinstance(data["id"], int))

    def test_create_actor_without_photo_or_gender(self):
        new_actor = {"age": 4, "name": "Dana Carvey"}
        res = self.client.post("/actors", json=new_actor)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 201)
        self.assertTrue(isinstance(data["id"], int))

    def test_create_actor_400(self):
        # Fails, since age must be an int
        new_actor = {
            "age": "firetruck",
            "gender": "MALE",
            "name": "Dana Carvey",
            "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Dana_Carvey%2C_USO.JPG",
        }

        res = self.client.post("/actors", json=new_actor)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertEqual(data, {"success": False, "error": "Bad Request"})

    def test_create_actor_non_json_400(self):
        payload = 0b10101010
        res = self.client.post(
            "/actors", data=bytes(payload), content_type="application/json"
        )
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data["success"])
        self.assertEqual(data["error"], "Bad Request")

    def test_create_actor_405(self):
        # Fails, since PATCH is not allowed on the actors endpoint
        new_actor = {
            "age": 4,
            "gender": "MALE",
            "name": "Dana Carvey",
            "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Dana_Carvey%2C_USO.JPG",
        }

        res = self.client.patch("/actors", json=new_actor)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 405)
        self.assertEqual(data, {"success": False, "error": "Method Not Allowed"})

    def test_create_actor_415(self):
        new_actor = 0b10101010
        res = self.client.post(
            "/actors", data=bytes(new_actor), content_type="application/octet-stream"
        )
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 415)
        self.assertFalse(data["success"])
        self.assertEqual(data["error"], "Unsupported Media Type")

    def test_lookup_actors(self):
        res = self.client.get("/actors?search=tOm")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data["success"])
        self.assertEqual(
            data["actors"],
            [
                {
                    "id": 7,
                    "name": "Tom Cruise",
                    "age": 62,
                    "gender": "MALE",
                    "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Tom_Cruise_pose_with_a_stunt_member.jpg/640px-Tom_Cruise_pose_with_a_stunt_member.jpg",
                },
                {
                    "id": 1,
                    "name": "Tom Hanks",
                    "age": 68,
                    "gender": "MALE",
                    "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/TomHanksJan2009_crop.jpg/640px-TomHanksJan2009_crop.jpg",
                },
            ],
        )
        self.assertEqual(data["totalActors"], 2)
        self.assertEqual(data["offset"], 0)

    def test_lookup_actors_no_results(self):
        res = self.client.get("/actors?search=rUtAbAgA")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data["success"])
        self.assertEqual(
            data["actors"],
            [],
        )
        self.assertEqual(data["totalActors"], 0)
        self.assertEqual(data["offset"], 0)


# Make the tests conveniently executable
if __name__ == "__main__":
    unittest.main()
