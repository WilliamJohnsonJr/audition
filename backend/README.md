# Python Backend - Udacity Full Stack Developer Nanodegree

This directory contains the backend for the Capstone project.

## To run production locally in a container
- `docker build -t capstone . --platform linux/amd64`
- `docker run -e DATABASE_URL=postgresql://postgres@host.docker.internal:5432/postgres -e EXCITED=true -t -i -p 8000:8000 capstone`

## Setup for local development
- `python3 -m .venv venv`
- `source .venv/bin/activate`
- `pip install -r requirements.txt`
- `DATABASE_URL=postgresql://postgres@localhost:5432/postgres EXCITED=true python app.py`

## Tests
TODO
