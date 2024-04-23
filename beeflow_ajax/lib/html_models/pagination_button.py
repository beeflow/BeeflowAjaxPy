"""copyright (c) 2014 - 2024 Beeflow Ltd.

Author Rafal Przetakowski <rafal.p@beeflow.co.uk>"""

from pydantic import Field

from beeflow_ajax.lib.html_models.base_html_model import BaseHTMLModel


class PaginationButton(BaseHTMLModel):
    element_name: str = "li"
    class_name: str = "page-item"

    disabled: bool = Field(exclude=True)

    def __init__(self, **data):
        super().__init__(**data)

        if self.disabled:
            self.class_name += " disabled"
