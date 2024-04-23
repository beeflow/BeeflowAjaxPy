"""copyright (c) 2014 - 2024 Beeflow Ltd.

Author Rafal Przetakowski <rafal.p@beeflow.co.uk>"""

from beeflow_ajax.lib.html_models.base_html_model import BaseHTMLModel


class Img(BaseHTMLModel):
    element_name: str = "img"
    alt: str
    src: str
