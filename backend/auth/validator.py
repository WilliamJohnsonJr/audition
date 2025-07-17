import json
import os
import threading
import time
from flask import abort, request
from functools import wraps
from jose import jwt
import requests
from dotenv import load_dotenv

load_dotenv()
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
ALGORITHMS = [os.getenv("ALGORITHMS", "")]
API_AUDIENCE = os.getenv("API_AUDIENCE")
jwks = None


# Note: I would find a better way to do this in production. For some reason,
# all calls to the API hang in AWS if I fetch JWKS in the verify_decode_jwt method below.
# So one approach is to simply run a thread that refreshes the JWKS every hour.
def fetch_jwks():
    global jwks
    while True:
        try:
            response = requests.get(
                f"https://{AUTH0_DOMAIN}/.well-known/jwks.json", timeout=20
            )
            if response.status_code < 300:
                jwks = response.json()
        except Exception as e:
            print(f"EXCEPTION: {e}")

        time.sleep(3600)


jwks_thread = threading.Thread(target=fetch_jwks, daemon=True)
jwks_thread.start()


class AuthError(Exception):
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code


def get_token_auth_header():
    # Partially taken from lesson 2.15 Practice - Applying Skills in Flask from the IAM course
    if "Authorization" not in request.headers:
        # We do not include descriptive error information for security's sake
        raise AuthError({"code": "unauthorized", "description": "Unauthorized"}, 401)
    auth_header = request.headers["Authorization"]
    pieces = auth_header.split(" ")
    if len(pieces) != 2:
        # We do not include descriptive error information for security's sake
        raise AuthError({"code": "unauthorized", "description": "Unauthorized"}, 401)
    elif pieces[0].lower() != "bearer":
        # We do not include descriptive error information for security's sake
        raise AuthError({"code": "unauthorized", "description": "Unauthorized"}, 401)
    return pieces[1]


def check_permissions(permission, payload):
    if "permissions" not in payload:
        # We do not include descriptive error information for security's sake
        raise AuthError({"code": "forbidden", "description": "Forbidden"}, 403)
    if permission not in payload["permissions"]:
        # We do not include descriptive error information for security's sake
        raise AuthError({"code": "forbidden", "description": "Forbidden"}, 403)
    return True


def verify_decode_jwt(token):
    if not jwks:
        raise AuthError({"code": "jwks_failure", "description": "jwks failure"}, 500)

    unverified_header = jwt.get_unverified_header(token)

    rsa_key = {}
    if "kid" not in unverified_header:
        raise AuthError(
            {"code": "invalid_header", "description": "Authorization malformed."}, 401
        )

    for key in jwks["keys"]:
        if key["kid"] == unverified_header["kid"]:
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"],
            }

    if rsa_key:
        try:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=ALGORITHMS,
                audience=API_AUDIENCE,
                issuer=f"https://{AUTH0_DOMAIN}/",
            )

            return payload

        except jwt.ExpiredSignatureError:  # type: ignore
            raise AuthError(
                {"code": "token_expired", "description": "Token expired."}, 401
            )

        except jwt.JWTClaimsError:  # type: ignore
            raise AuthError(
                {
                    "code": "invalid_claims",
                    "description": "Incorrect claims. Please, check the audience and issuer.",
                },
                403,
            )
        except Exception:
            raise AuthError(
                {
                    "code": "invalid_header",
                    "description": "Unable to parse authentication token.",
                },
                403,
            )
    raise AuthError(
        {
            "code": "invalid_header",
            "description": "Unable to find the appropriate key.",
        },
        403,
    )


def requires_auth(permission=""):
    def requires_auth_decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            try:
                token = get_token_auth_header()
                payload = verify_decode_jwt(token)
                check_permissions(permission, payload)
                return f(*args, **kwargs)
            except AuthError as e:
                abort(e.status_code, e)

        return wrapper

    return requires_auth_decorator
