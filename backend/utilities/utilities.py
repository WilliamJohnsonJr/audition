import hashlib
import json
import re

from models import Actor, Movie


def _camel_to_snake(camel_case_str: str):
    # Use regex to replace camelCase with snake_case
    snake_case_str = re.sub(r"(?<!^)(?=[A-Z])", "_", camel_case_str).lower()
    return snake_case_str


def _snake_to_camel(snake_case_str: str):
    camel_case_str = re.sub(
        r"_(.)", lambda match: match.group(1).upper(), snake_case_str
    )
    return camel_case_str


def _camel_case_dict(item: dict):
    new_item = {}
    for key in item:
        if isinstance(item[key], list):
            new_list = [_camel_case_dict(list_item) for list_item in item[key]]
            new_item[_snake_to_camel(key)] = new_list
        elif isinstance(item[key], dict):
            new_item[_snake_to_camel(key)] = _camel_case_dict(item[key])
        else:
            new_item[_snake_to_camel(key)] = item[key]
    return new_item


def _convert_json_patch_request_to_dict(body: list[dict], model: type[Movie | Actor]):
    new_dict = {}
    for item in body:
        if not isinstance(item, dict):
            raise TypeError("invalid JSON patch schema")
        if (
            item["op"] is None
            or item["op"] not in ["add", "remove"]
            or (item["op"] == "remove" and "value" in item.keys())
        ):
            raise ValueError("invalid JSON patch operation")
        if item["path"] is None or _camel_to_snake(item["path"][1:]) not in [column.name for column in model.__table__.columns]:  # type: ignore
            raise ValueError("invalid JSON patch path")
        new_dict[_camel_to_snake(item["path"][1:])] = (
            item["value"] if item["op"] != "remove" else None
        )

    return new_dict


def _create_etag(record: Movie | Actor):
    # Convert the dictionary to a JSON string
    orig_dict_string = json.dumps(
        record.format(), sort_keys=True
    )  # sort_keys to ensure consistent ordering
    # Create a SHA-256 hash of the string to use for comparison and as an ETag
    return hashlib.sha256(orig_dict_string.encode()).hexdigest()


def _abort_if_falsy_and_not_none(value):
    return not value and value != None
