"""copyright (c) 2014 - 2024 Beeflow Ltd.

Author Rafal Przetakowski <rafal.p@beeflow.co.uk>"""
from beeflow_ajax.lib.html_models.base_html_model import BaseHTMLModel


class AjaxPaginatorUrl(BaseHTMLModel):
    element_name: str = "a"
    class_name: str = "page-link ajax-link"
    href: str
