import os
import re
import enum
from flask import Flask
from sqlalchemy.orm import DeclarativeBase
from datetime import date
from sqlalchemy import Column, Enum, Integer, String, Date
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import json


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
    gender = Column(Enum(Gender))
    movies = db.relationship("Movie", secondary="casts", back_populates="actors")

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

    def __init__(self, title: str, release_date: date):
        if len(title) < 1:
            raise ValueError("Invalid title")

        self.title = title
        self.release_date = release_date

    def format(self):
        return {"id": self.id, "title": self.title, "release_date": self.release_date}
