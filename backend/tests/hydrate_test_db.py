from flask import Flask

from models import Actor, Gender, Genre, Movie


def make_movies(app: Flask):
    with app.app_context():
        movies = [
            {
                "id": 1,
                "genre": "ACTION_AND_ADVENTURE",
                "release_date": "1995-06-30",
                "title": "Apollo 13",
            },
            {
                "id": 2,
                "genre": "SCI_FI",
                "release_date": "1997-07-11",
                "title": "Contact",
            },
            {
                "id": 3,
                "genre": "SCI_FI",
                "release_date": "2018-02-16",
                "title": "Black Panther",
            },
            {
                "id": 4,
                "genre": "FANTASY",
                "release_date": "2001-12-19",
                "title": "The Lord of the Rings: The Fellowship of the Ring",
            },
            {
                "id": 5,
                "genre": "ACTION_AND_ADVENTURE",
                "release_date": "2021-11-12",
                "title": "Red Notice",
            },
            {
                "id": 6,
                "title": "Top Gun",
                "genre": "ACTION_AND_ADVENTURE",
                "release_date": "1986-05-16",
            },
            {
                "title": "Star Wars: Episode I - The Phantom Menace",
                "id": 7,
                "genre": "SCI_FI",
                "release_date": "1999-05-19",
            },
            {
                "title": "Once Upon a Time in Mexico",
                "id": 8,
                "genre": "ACTION_AND_ADVENTURE",
                "release_date": "2003-09-12",
            },
            {
                "title": "The Avengers",
                "id": 9,
                "genre": "SCI_FI",
                "release_date": "2012-05-04",
            },
            {
                "title": "Friday",
                "id": 10,
                "genre": "COMEDY",
                "release_date": "1995-04-26",
            },
            {
                "title": "Lilo & Stitch",
                "id": 11,
                "genre": "ANIMATION",
                "release_date": "2002-06-16",
            },
        ]
        objects = [
            Movie(
                genre=Genre[movie["genre"]],
                poster_url=None,
                release_date=movie["release_date"],
                title=movie["title"],
            )
            for movie in movies
        ]

        return objects


def make_actors(app: Flask):
    with app.app_context():
        actors = [
            {
                "id": 1,
                "name": "Tom Hanks",
                "age": 68,
                "gender": "MALE",
                "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/TomHanksJan2009_crop.jpg/640px-TomHanksJan2009_crop.jpg",
            },
            {
                "id": 2,
                "name": "Samuel L. Jackson",
                "age": 76,
                "gender": "MALE",
                "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Samuel_L._Jackson_and_Jeannie_Leavitt_at_Edwards_AFB.jpg/640px-Samuel_L._Jackson_and_Jeannie_Leavitt_at_Edwards_AFB.jpg",
            },
            {
                "id": 3,
                "name": "Antonio Banderas",
                "age": 64,
                "gender": "MALE",
                "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Antonio_Banderas_visits_MCAS_Miramar_151107-M-MX585-146_%28cropped%29.jpg/640px-Antonio_Banderas_visits_MCAS_Miramar_151107-M-MX585-146_%28cropped%29.jpg",
            },
            {
                "id": 4,
                "name": "Scarlett Johansson",
                "age": 40,
                "gender": "FEMALE",
                "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Scarlett_Johansson_Oscars_2020.jpg/640px-Scarlett_Johansson_Oscars_2020.jpg",
            },
            {
                "id": 5,
                "name": "Chadwick Boseman",
                "age": 43,
                "gender": "MALE",
                "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/P040213LJ-0289.jpg/640px-P040213LJ-0289.jpg",
            },
            {
                "id": 6,
                "name": "Andy Serkis",
                "age": 61,
                "gender": "MALE",
                "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Andy_Serkis_at_MEGACON_Orlando_2025.png/640px-Andy_Serkis_at_MEGACON_Orlando_2025.png",
            },
            {
                "id": 7,
                "name": "Tom Cruise",
                "age": 62,
                "gender": "MALE",
                "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Tom_Cruise_pose_with_a_stunt_member.jpg/640px-Tom_Cruise_pose_with_a_stunt_member.jpg",
            },
            {"id": 8, "name": "Martin Freeman", "age": 53, "gender": "MALE"},
            {
                "id": 9,
                "name": "Elijah Wood",
                "age": 44,
                "gender": "MALE",
                "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Elijah_Wood_stands_outside_a_fan_built_replica_of_the_Hobbit_Hole_from_The_Lord_of_the_Rings_at_Comic_Con_Northern_Ireland_2023.jpg/640px-Elijah_Wood_stands_outside_a_fan_built_replica_of_the_Hobbit_Hole_from_The_Lord_of_the_Rings_at_Comic_Con_Northern_Ireland_2023.jpg",
            },
            {
                "id": 10,
                "name": "Cate Blanchett",
                "age": 56,
                "gender": "FEMALE",
                "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Cate_Blanchett_4_%28cropped%29.jpg/640px-Cate_Blanchett_4_%28cropped%29.jpg",
            },
            {
                "id": 11,
                "name": "Gal Gadot",
                "age": 40,
                "gender": "FEMALE",
                "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Sam_Grundwerg_and_actress_Gal_Gadot.jpg/640px-Sam_Grundwerg_and_actress_Gal_Gadot.jpg",
            },
            {
                "id": 12,
                "name": "Dwayne Johnson",
                "age": 53,
                "gender": "MALE",
                "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Dwayne_Johnson_Daytona_500_2024_8246701_%28cropped%29.jpg/640px-Dwayne_Johnson_Daytona_500_2024_8246701_%28cropped%29.jpg",
            },
            {
                "id": 13,
                "name": "Ryan Reynolds",
                "age": 48,
                "gender": "MALE",
                "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/82nd_Academy_Awards%2C_Ryan_Reynolds_-_army_mil-66450-2010-03-09-180346b.jpg/640px-82nd_Academy_Awards%2C_Ryan_Reynolds_-_army_mil-66450-2010-03-09-180346b.jpg",
            },
            {"id": 14, "name": "Angela Bassett", "age": 66, "gender": "FEMALE"},
            {
                "id": 15,
                "name": "Matthew McConaughey",
                "age": 55,
                "gender": "MALE",
                "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Anne_Hathaway%2C_Matthew_McCounaughay%2C_Jessica_Chastain_Interstellar_premiere.jpg/640px-Anne_Hathaway%2C_Matthew_McCounaughay%2C_Jessica_Chastain_Interstellar_premiere.jpg",
            },
            {"id": 16, "name": "Jodie Foster", "age": 62, "gender": "FEMALE"},
            {"id": 17, "name": "Meg Ryan", "age": 63, "gender": "FEMALE"},
            {"id": 18, "name": "Salma Hayek", "age": 58, "gender": "FEMALE"},
            {
                "id": 19,
                "name": "Johnny Depp",
                "age": 62,
                "gender": "MALE",
                "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Johnny-depp-11282050886iSaKg.jpg/640px-Johnny-depp-11282050886iSaKg.jpg",
            },
        ]
        objects = [
            Actor(
                name=actor["name"],
                age=actor["age"],
                gender=Gender[actor["gender"]],
                photo_url=actor["photo_url"] if "photo_url" in actor.keys() else None,
            )
            for actor in actors
        ]

        return objects
