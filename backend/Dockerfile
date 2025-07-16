FROM public.ecr.aws/sam/build-python3.13:1.140.0-20250605234711

COPY actors/ /app/actors/
COPY alembic/ /app/alembic/
COPY auth/ /app/auth/
COPY casts/ /app/casts/
COPY migrations/ /app/migrations/
COPY movies/ /app/movies/
COPY utilities/ /app/utilities/
COPY alembic.ini  /app
COPY app.py /app
COPY Dockerfile /app
COPY models.py /app
COPY requirements.txt /app

WORKDIR /app

RUN pip install --upgrade pip
RUN pip install -r requirements.txt


ENTRYPOINT ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
