import os
import unittest

import json

from sqlalchemy import text, create_engine

from app import create_app
from models import db, Actor, Movie
from tests.hydrate_test_db import make_movies, make_actors

import json


class ActorTestCase(unittest.TestCase):
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
                "age": 61,
                "gender": "MALE",
                "id": 6,
                "movies": [],
                "name": "Andy Serkis",
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

    def test_search_actors(self):
        res = self.client.get("/actors?search=tOm")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data["success"])
        self.assertEqual(
            data["actors"],
            [
                {
                    "age": 62,
                    "gender": "MALE",
                    "id": 7,
                    "movies": [],
                    "name": "Tom Cruise",
                    "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Tom_Cruise_pose_with_a_stunt_member.jpg/640px-Tom_Cruise_pose_with_a_stunt_member.jpg",
                },
                {
                    "age": 68,
                    "gender": "MALE",
                    "id": 1,
                    "movies": [],
                    "name": "Tom Hanks",
                    "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/TomHanksJan2009_crop.jpg/640px-TomHanksJan2009_crop.jpg",
                },
            ],
        )
        self.assertEqual(data["totalActors"], 2)
        self.assertEqual(data["offset"], 0)

    def test_search_actors_no_results(self):
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

    def test_create_actor_400_bad_age_type(self):
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

    def test_create_actor_400_bad_age_value(self):
        # Fails, since age must be greater than 0
        new_actor = {
            "age": 0,
            "gender": "MALE",
            "name": "Dana Carvey",
            "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Dana_Carvey%2C_USO.JPG",
        }

        res = self.client.post("/actors", json=new_actor)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertEqual(data, {"success": False, "error": "Bad Request"})

    def test_create_actor_400_missing_name(self):
        # Fails, since name must be a string with length >= 1
        new_actor = {
            "age": "firetruck",
            "gender": "MALE",
            "name": "",
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

    def test_create_actor_415(self):
        new_actor = 0b10101010
        res = self.client.post(
            "/actors", data=bytes(new_actor), content_type="application/octet-stream"
        )
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 415)
        self.assertFalse(data["success"])
        self.assertEqual(data["error"], "Unsupported Media Type")

    def test_patch_actors_405(self):
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

    def test_get_actor(self):
        res = self.client.get("/actors/1")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data["success"])
        self.assertDictEqual(
            data["actor"],
            {
                "age": 68,
                "gender": "MALE",
                "id": 1,
                "movies": [],
                "name": "Tom Hanks",
                "photoUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/TomHanksJan2009_crop.jpg/640px-TomHanksJan2009_crop.jpg",
            },
        )

    def test_get_actor_404(self):
        res = self.client.get("/actors/99")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data["success"])
        self.assertEqual(data["error"], "Not Found")

    def test_patch_actor(self):
        patch_request = [
            {"op": "add", "path": "/age", "value": 4},
            {"op": "remove", "path": "/photoUrl"},
        ]

        res = self.client.patch(
            "/actors/1", json=patch_request, content_type="application/json-patch+json"
        )
        data = json.loads(res.data)

        etag = res.get_etag()[0]

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data["success"])
        self.assertIsNotNone(etag)
        self.assertEqual(data["id"], 1)

        res2 = self.client.get("/actors/1")
        data2 = json.loads(res2.data)

        self.assertDictEqual(
            data2["actor"],
            {
                "age": 4,
                "gender": "MALE",
                "id": 1,
                "movies": [],
                "name": "Tom Hanks",
                "photoUrl": None,
            },
        )
        self.assertEqual(res2.get_etag()[0], etag)

        res3 = self.client.patch(
            "/actors/1",
            json=[
                {
                    "op": "add",
                    "path": "/photoUrl",
                    "value": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/TomHanksJan2009_crop.jpg/640px-TomHanksJan2009_crop.jpg",
                }
            ],
            content_type="application/json-patch+json",
        )
        data3 = json.loads(res3.data)
        etag2 = res3.get_etag()[0]

        self.assertEqual(res.status_code, 200)
        self.assertNotEqual(etag, etag2)
        self.assertTrue(data3["success"])

    def test_patch_actor_400_falsy_value_instead_of_remove_op(self):
        patch_request = [
            {"op": "add", "path": "/age", "value": 4},
            {"op": "add", "path": "/photoUrl", "value": ""},
        ]

        res = self.client.patch(
            "/actors/1", json=patch_request, content_type="application/json-patch+json"
        )
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data["success"])
        self.assertEqual(data["error"], "Bad Request")

    def test_patch_actor_400_remove_name(self):
        patch_request = [
            {"op": "remove", "path": "/name"},
        ]

        res = self.client.patch(
            "/actors/1", json=patch_request, content_type="application/json-patch+json"
        )
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data["success"])
        self.assertEqual(data["error"], "Bad Request")

    def test_patch_actor_400_empty_string_name(self):
        patch_request = [
            {"op": "add", "path": "/name", "value": ""},
        ]

        res = self.client.patch(
            "/actors/1", json=patch_request, content_type="application/json-patch+json"
        )
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data["success"])
        self.assertEqual(data["error"], "Bad Request")

    def test_patch_actor_400_move_op_not_allowed(self):
        patch_request = [
            {"op": "move", "from": "/name", "path": "/surname"},
        ]

        res = self.client.patch(
            "/actors/1", json=patch_request, content_type="application/json-patch+json"
        )
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data["success"])
        self.assertEqual(data["error"], "Bad Request")

    def test_patch_actor_400_replace_op_not_allowed(self):
        patch_request = [
            {"op": "replace", "path": "/name", "value": "Tim Burton"},
        ]

        res = self.client.patch(
            "/actors/1", json=patch_request, content_type="application/json-patch+json"
        )
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data["success"])
        self.assertEqual(data["error"], "Bad Request")

    def test_patch_actor_400_copy_op_not_allowed(self):
        patch_request = [
            {"op": "copy", "from": "/name", "path": "/surname"},
        ]

        res = self.client.patch(
            "/actors/1", json=patch_request, content_type="application/json-patch+json"
        )
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data["success"])
        self.assertEqual(data["error"], "Bad Request")

    def test_patch_actor_400_test_op_not_allowed(self):
        patch_request = [
            {"op": "test", "path": "/name", "value": "Tom Hanks"},
        ]

        res = self.client.patch(
            "/actors/1", json=patch_request, content_type="application/json-patch+json"
        )
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 400)
        self.assertFalse(data["success"])
        self.assertEqual(data["error"], "Bad Request")

    def test_patch_actor_415_non_json_request_correct_content_type(self):
        payload = 0b10101010
        res = self.client.patch(
            "/actors/1", data=bytes(payload), content_type="application/json"
        )
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 415)
        self.assertFalse(data["success"])
        self.assertEqual(data["error"], "Unsupported Media Type")

    def test_patch_actor_415_bad_data_and_bad_content_type(self):
        payload = 0b10101010
        res = self.client.patch(
            "/actors/1", data=bytes(payload), content_type="application/octet-stream"
        )
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 415)
        self.assertFalse(data["success"])
        self.assertEqual(data["error"], "Unsupported Media Type")

    def test_delete_actor(self):
        res = self.client.delete("/actors/2")
        data = json.loads(res.data)
        with self.app.app_context():
            self.assertEqual(res.status_code, 200)
            self.assertTrue(data["success"])
            self.assertEqual(data["id"], 2)

            actor_or_none = Actor.query.filter(Actor.id == 2).one_or_none()
            self.assertEqual(actor_or_none, None)

    def test_delete_actor_error(self):
        res = self.client.delete("/actors/200")
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertFalse(data["success"])
        self.assertEqual(data["error"], "Not Found")


if __name__ == "__main__":
    unittest.main()
