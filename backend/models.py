import os
import enum
from flask import Flask
from sqlalchemy.orm import DeclarativeBase
from datetime import date
from sqlalchemy import Column, Enum, Integer, String, Date
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

class Base(DeclarativeBase):
    pass

database_path = os.environ["DATABASE_URL"]
if database_path.startswith("postgres://"):
    database_path = database_path.replace("postgres://", "postgresql://", 1)

db = SQLAlchemy(model_class=Base)
migrate = Migrate()
"""
setup_db(app)
    binds a flask application and a SQLAlchemy service
"""

def setup_db(app: Flask, database_path=database_path):
    app.config["SQLALCHEMY_DATABASE_URI"] = database_path
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)
    migrate.init_app(app, db)
    return app


class Gender(enum.Enum):
    MALE = "M"
    FEMALE = "F"

class Actor(db.Model):
    __tablename__ = "actors"

    id = Column(db.Integer, primary_key=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    photo_url = Column(String)
    gender = Column(Enum(Gender))
    movies = db.relationship("Movie", secondary="casts", back_populates="actors")

    def __init__(self, name: str, age: int, photo_url: str | None, gender: Gender | None):
        self.age = age
        self.gender = gender
        self.name = name
        self.photo_url = photo_url

    def __repr__(self):
        return f"<Actor {self.id}, {self.name}>"

    def format(self):
        return {
            "age": self.age,
            "gender": self.gender,
            "id": self.id,
            "name": self.name,
            "photo_url": self.photo_url,
        }

class Cast(db.Model):
    __tablename__ = 'casts'

    movie_id = db.Column(db.ForeignKey("movies.id"), nullable=False, primary_key=True)
    actor_id = db.Column(db.ForeignKey("actors.id"), nullable=False, primary_key=True)


class Genre(enum.Enum):
    ACTION_AND_ADVENTURE = "ACTION_AND_ADVENTURE"
    ANIMATION = "ANIMATION"
    COMEDY = "COMEDY"
    DOCUMENTARY = "DOCUMENTARY"
    DRAMA = "DRAMA"
    HISTORICAL = "HISTORICAL"
    HORROR = "HORROR"
    NOIR = "NOIR"
    SCI_FI = "SCI_FI"
    WESTERN = "WESTERN"

class Movie(db.Model):
    __tablename__ = "movies"

    id = Column(db.Integer, primary_key=True)
    title = Column(String, nullable=False)
    release_date = Column(Date)
    actors = db.relationship("Actor", secondary="casts", back_populates="movies")
    genre = Column(Enum(Genre), nullable=False)
    poster_url = Column(String)

    def __init__(self, genre: Genre, title: str, release_date: date | None, poster_url: str | None ):
        if len(title) < 1:
            raise ValueError("Invalid title")

        self.genre = genre
        self.poster_url = poster_url
        self.release_date = release_date
        self.title = title

    def __repr__(self):
        return f"<Movie {self.id}, {self.title}>"

    def format(self):
        return {
            "genre": self.genre,
            "id": self.id,
            "poster_url": self.poster_url,
            "release_date": self.release_date,
            "title": self.title,
        }
