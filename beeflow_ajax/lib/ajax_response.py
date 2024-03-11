"""Beeflow Ajax helps communicate HTML service with backend.

@author Rafal Przetakowski <rafal.p@beeflow.co.uk>"""

import json
from typing import Dict, List


class AjaxResponse:
    """Response object for AJAX."""

    ALERT = "alert"
    ALERT_SUCCESS = "alertSuccess"
    ALERT_ERROR = "alertError"
    ALERT_WARNING = "alertWarning"
    ALERT_INFO = "alertInfo"
    DEBUG = "debug"
    APPEND = "append"
    ASSIGN = "assign"
    REDIRECT = "redirect"
    RELOAD_LOCATION = "reloadLocation"
    REMOVE = "remove"
    ADD_CLASS = "addClass"
    REMOVE_CLASS = "removeClass"
    RUN_SCRIPT = "runScript"
    SHOW = "show"
    HIDE = "hide"
    INSERT_BEFORE = "insertBefore"
    INIT_AJAX_LINKS = "initAjaxLinks"
    INIT_AJAX_SELECT = "initAjaxSelect"
    INIT_AJAX_FORMS = "initAjaxForms"
    LOAD_SCRIPT = "loadScript"
    SET_INPUT_VALUE = "setInputValue"
    MODAL = "modal"
    URL = "setUrl"
    SET_FORM_ACTION = "setFormAction"

    def __init__(self, response):
        """Constructor prepares commands list."""
        self.commands = []
        self.response_ = response

    def __str__(self):
        """Returns json string."""
        return self.get_json()

    def response(self, *args, **kwargs):
        response = self.get_json()
        self.commands = []

        return self.response_(response, *args, **kwargs)

    def get_clean_json(self) -> str:
        response = self.get_json()
        self.commands = []

        return response

    def get_json(self) -> str:
        """Returns json string."""
        commands = self.commands or {}
        return json.dumps(commands)

    def print_output(self):
        """Prints json string."""
        print(self.get_json())

    def get_list(self) -> List:
        """Returns commands as a list."""
        return self.commands

    def alert(self, msg: str) -> "AjaxResponse":
        """Prepares alert command."""
        self.__add_command(self.ALERT, {}, str(msg))
        return self

    def alert_success(self, msg: str, title: str = "") -> "AjaxResponse":
        """Prepares success message command."""
        self.__add_command(self.ALERT_SUCCESS, {"title": title}, str(msg))
        return self

    def alert_error(self, msg: str, title: str = "") -> "AjaxResponse":
        """Prepares error message command."""
        self.__add_command(self.ALERT_ERROR, {"title": title}, str(msg))
        return self

    def alert_warning(self, msg: str, title: str = "") -> "AjaxResponse":
        """Prepares warning message command."""
        self.__add_command(self.ALERT_WARNING, {"title": title}, str(msg))
        return self

    def alert_info(self, msg: str, title: str = "") -> "AjaxResponse":
        """Prepares info message command."""
        self.__add_command(self.ALERT_INFO, {"title": title}, str(msg))
        return self

    def debug(self, data) -> "AjaxResponse":
        """Prepares debug command."""
        self.__add_command(self.DEBUG, {}, data)
        return self

    def append(self, element: str, value: str) -> "AjaxResponse":
        """Prepares append command which adds value to element.

        The element can be #id, .class or just tag ex. p
        """
        self.__add_command(self.APPEND, {"id": element}, value)
        return self

    def assign(self, element: str, value: str) -> "AjaxResponse":
        """Prepares assign command which adds value to element.

        The element can be #id, .class or HTML tag.
        """
        self.__add_command(self.ASSIGN, {"id": element}, value)
        return self

    def redirect(self, url: str) -> "AjaxResponse":
        """Redirect command for url redirection."""
        self.__add_command(self.REDIRECT, {"url": url})
        return self

    def reload_location(self) -> "AjaxResponse":
        """Reload location command."""
        self.__add_command(self.RELOAD_LOCATION)
        return self

    def remove(self, element: str) -> "AjaxResponse":
        """Removes element by #id, .class or HTML tag."""
        self.__add_command(self.REMOVE, {"id": element})
        return self

    def add_class(self, element: str, class_name: str) -> "AjaxResponse":
        """Adds class to element which can be #id, .class or HTML tag."""
        self.__add_command(self.ADD_CLASS, {"id": element}, class_name)
        return self

    def remove_class(self, element: str, class_name: str = None) -> "AjaxResponse":
        """Removes class from element which can be #id, .class or HTML tag."""
        self.__add_command(self.REMOVE_CLASS, {"id": element}, class_name)
        return self

    def set_class(self, element: str, class_name: str) -> "AjaxResponse":
        """Sets new class on element which can be #id, .class or HTML tag."""
        self.remove_class(element)
        self.add_class(element, class_name)
        return self

    def return_json(self, data: Dict) -> "AjaxResponse":
        """Allows return json as a command."""
        try:
            self.commands = data["errors"]
        except KeyError:
            self.commands = data
        return self

    def script(self, javascript: str) -> "AjaxResponse":
        """Allows send javascript script to frontend."""
        self.__add_command(self.RUN_SCRIPT, {}, javascript)
        return self

    def show(self, element: str) -> "AjaxResponse":
        """Shows element."""
        self.__add_command(self.SHOW, {"id": element})
        return self

    def hide(self, element: str) -> "AjaxResponse":
        """Hides element."""
        self.__add_command(self.HIDE, {"id": element})
        return self

    def insert_before(self, element: str, value: str) -> "AjaxResponse":
        """Inserts value before element."""
        self.__add_command(self.INSERT_BEFORE, {"id": element}, value)
        return self

    def init_ajax_links(self) -> "AjaxResponse":
        """Initialize ajax links."""
        self.__add_command(self.INIT_AJAX_LINKS)
        return self

    def init_ajax_select(self) -> "AjaxResponse":
        """Initialize ajax select."""
        self.__add_command(self.INIT_AJAX_SELECT)
        return self

    def init_ajax_forms(self) -> "AjaxResponse":
        """Initialize ajax forms."""
        self.__add_command(self.INIT_AJAX_FORMS)
        return self

    def load_script(self, name: str, callback: str) -> "AjaxResponse":
        """Allows load javascript script from file."""
        self.__add_command(self.LOAD_SCRIPT, {"script": name, "callback": callback})
        return self

    def set_input_value(self, element: str, value: str) -> "AjaxResponse":
        self.__add_command(self.SET_INPUT_VALUE, {"id": element}, value)
        return self

    def modal(self, element: str, action: str) -> "AjaxResponse":
        self.__add_command(self.MODAL, {"id": element}, action)
        return self

    def set_url(self, element: str, url: str) -> "AjaxResponse":
        self.__add_command(self.URL, {"id": element}, url)
        return self

    def set_form_action(self, element: str, action: str) -> "AjaxResponse":
        self.__add_command(self.SET_FORM_ACTION, {"id": element}, action)
        return self

    def __add_command(
        self, command: str, attributes: Dict = None, m_data=None
    ) -> "AjaxResponse":
        """Adds command."""
        if attributes is None:
            attributes = {}

        attributes["cmd"] = command
        attributes["data"] = m_data
        self.commands.append(attributes)
        return self