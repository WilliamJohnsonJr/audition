# Python Backend - Udacity Full Stack Developer Nanodegree

This directory contains the backend for the Capstone project.

## Caveats
Marshmallow Schemas would be a better choice for a larger project, but I made my own validation logic to reduce dependencies.

# To set up a db
- `createdb casting`

## To run production locally in a container
- `docker build -t capstone . --platform linux/amd64`
- `docker run -e DATABASE_URL=postgresql://postgres@host.docker.internal:5432/casting -t -i -p 8000:8000 capstone`

## Setup for local development
- `python3 -m .venv venv`
- `source .venv/bin/activate`
- `pip install -r requirements.txt`
- `DATABASE_URL=postgresql://postgres@localhost:5432/casting python app.py`

## Tests
- `createdb casting_test`
- `DATABASE_URL=postgresql://postgres@localhost:5432/casting_test python test_app.py`
