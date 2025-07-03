# Python Backend - Udacity Full Stack Developer Nanodegree

This directory contains the backend for the Capstone project.

## Caveats
Marshmallow Schemas would be a better choice for a larger project, but I made my own validation logic to reduce dependencies.

# To set up a db
- `export DATABASE_URL=postgresql://postgres@localhost:5432/casting`
- `createdb casting`
- `flask db upgrade`

## Setup for local development
- `python3 -m .venv venv`
- `source .venv/bin/activate`
- `pip install -r requirements.txt`
- `DATABASE_URL=postgresql://postgres@localhost:5432/casting python app.py`

## To run production locally in a container
- `docker build -t capstone . --platform linux/amd64`
- `docker run -e DATABASE_URL=postgresql://postgres@host.docker.internal:5432/casting -t -i -p 8000:8000 capstone`

## Tests
- `createdb casting_test`
- `DATABASE_URL=postgresql://postgres@localhost:5432/casting_test python -m tests.test_app`

To run an individual test case, use the following command:
`python -m tests.casts_tests`

To create a line-by-line coverage report, run:
`coverage erase && coverage run -m unittest discover && coverage html`