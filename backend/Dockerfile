FROM public.ecr.aws/sam/build-python3.13:1.140.0-20250605234711

COPY . /app
WORKDIR /app

RUN pip install --upgrade pip
RUN pip install -r requirements.txt


ENTRYPOINT ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
