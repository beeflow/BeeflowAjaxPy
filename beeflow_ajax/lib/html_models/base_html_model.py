"""copyright (c) 2014 - 2024 Beeflow Ltd.

Author Rafal Przetakowski <rafal.p@beeflow.co.uk>"""

import json
from typing import Any, Optional

from pydantic.v1 import BaseModel, Extra


def to_camel_case(snake_str):
    return "".join(x.capitalize() for x in snake_str.lower().split("_"))


def to_lower_camel_case(snake_str):
    # We capitalize the first letter of each component except the first one
    # with the 'capitalize' method and join them together.
    camel_string = to_camel_case(snake_str)
    return snake_str[0].lower() + camel_string[1:]


base_model_attributes_map: dict[str, str] = {"class_name": "class"}


class BaseHTMLModel(BaseModel, extra=Extra.allow):
    element_type: str = "element"
    element_name: str

    class_name: Optional[str] = None
    inner_text: Optional[str] = None
    inner_element: Optional["BaseHTMLModel"] = None
    inner_elements: Optional[list["BaseHTMLModel"]] = None

    append_text: Optional[str] = None

    def model_dump_json(self, **kwargs) -> str:
        return json.dumps(self.model_dump())

    def model_dump(self, **kwargs) -> dict[str, Any]:
        __all: dict = super().dict(by_alias=True, **kwargs)
        result: dict = self.dump_without_unset(__all.items())

        return result

    def dump_without_unset(self, items: dict) -> dict:
        result: dict = {}

        for key, value in items:
            if not value:
                continue

            if key in base_model_attributes_map.keys():
                key = base_model_attributes_map[key]

            if key.startswith("data_"):
                key = key.replace("_", "-")

            key = to_lower_camel_case(key)

            if isinstance(value, list):
                inner_elements: list = []

                for inner_value in value:
                    inner_elements.append(self.dump_without_unset(inner_value.items()))

                result.update({key: inner_elements})

                continue

            if isinstance(value, BaseModel):
                result.update({key: value.model_dump()})

            if isinstance(value, dict):
                result.update({key: self.dump_without_unset(value.items())})
                continue

            result.update({key: value})

        return result
