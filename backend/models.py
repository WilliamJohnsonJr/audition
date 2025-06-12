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


class Movie(db.Model):
    __tablename__ = "movie"

    id = Column(db.Integer, primary_key=True)
    title = Column(String)
    release_date = Column(Date)

    def __init__(self, title: str, release_date: date):
        if len(title) < 1:
            raise ValueError("Invalid title")

        self.title = title
        self.release_date = release_date

    def format(self):
        return {"id": self.id, "title": self.title, "release_date": self.release_date}


class Actor(db.Model):
    __tablename__ = "actor"

    id = Column(db.Integer, primary_key=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(Enum(Gender))
