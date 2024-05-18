"""Beeflow Ajax helps communicate HTML service with backend.

@author Rafal Przetakowski <rafal.p@beeflow.co.uk>"""

import json
from typing import Any, Callable, Dict, List, Optional, TypeVar

from beeflow_ajax.lib.html_models.base_html_model import BaseHTMLModel

T = TypeVar('T', bound='AjaxResponse')


class AjaxCommandHandlerError(Exception):
    ...


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
    APPEND_ELEMENT = "appendElement"
    APPEND_ELEMENTS = "appendElements"
    ASSIGN_ELEMENT = "assignElement"
    ASSIGN_ELEMENTS = "assignElements"
    APPEND_LIST = "appendList"
    ASSIGN_LIST = "assignList"
    REDIRECT = "redirect"
    RELOAD_LOCATION = "reloadLocation"
    REMOVE = "remove"
    ADD_CLASS = "addClass"
    REMOVE_CLASS = "removeClass"
    RUN_SCRIPT = "runScript"
    SHOW = "show"
    HIDE = "hide"
    INSERT_BEFORE = "insertBefore"
    INSERT_AFTER = "insertAfter"
    INIT_AJAX_LINKS = "initAjaxLinks"
    INIT_AJAX_SELECT = "initAjaxSelect"
    INIT_AJAX_FORMS = "initAjaxForms"
    LOAD_SCRIPT = "loadScript"
    SET_INPUT_VALUE = "setInputValue"
    MODAL = "modal"
    URL = "setUrl"
    SET_FORM_ACTION = "setFormAction"
    SET_ATTRIBUTE = "setAttribute"
    ROW_UP = "rowUp"
    ROW_DOWN = "rowDown"
    FORM_FIELD_ERROR = "formFieldError"

    _instance = None
    _is_initialized = False

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(AjaxResponse, cls).__new__(cls)
        return cls._instance

    def __init__(self, response=None):
        """Initializes a singleton instance, only once."""
        if response:
            self.response_handler = response

        if not self._is_initialized:
            self.commands = []
            self.command_handlers = {}
            self._is_initialized = True

    def __str__(self):
        """Returns json string."""
        return self.get_json()

    def response(self, *args, **kwargs):
        """
        Method returns response as the:
            * response (ex. HTTPResponse)
            * dictionary if we didn't pass any response object to the AjaxResponse initializer
        """
        commands = self.commands or {}
        self.commands = []

        if not self.response_handler:
            return commands

        return self.response_handler(commands, *args, **kwargs)

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

    def alert(self, msg: str) -> T:
        """Prepares alert command."""
        self.add_command(self.ALERT, {}, str(msg))
        return self

    def alert_success(self, msg: str, title: str = "", callback: Optional[str] = None) -> T:
        """Prepares success message command."""
        self.add_command(
            self.ALERT_SUCCESS, {"title": title, "callback": callback}, str(msg)
        )
        return self

    def alert_error(self, msg: str, title: str = "", callback: Optional[str] = None) -> T:
        """Prepares error message command."""
        self.add_command(
            self.ALERT_ERROR, {"title": title, "callback": callback}, str(msg)
        )
        return self

    def alert_warning(self, msg: str, title: str = "", callback: Optional[str] = None) -> T:
        """Prepares warning message command."""
        self.add_command(
            self.ALERT_WARNING, {"title": title, "callback": callback}, str(msg)
        )
        return self

    def alert_info(self, msg: str, title: str = "", callback: Optional[str] = None) -> T:
        """Prepares info message command."""
        self.add_command(
            self.ALERT_INFO, {"title": title, "callback": callback}, str(msg)
        )
        return self

    def debug(self, data) -> T:
        """Prepares debug command."""
        self.add_command(self.DEBUG, {}, data)
        return self

    def append_element(self, element: str, element_data: dict[str:Any] | BaseHTMLModel) -> T:
        if isinstance(element_data, BaseHTMLModel):
            element_data = element_data.model_dump()

        self.add_command(self.APPEND_ELEMENT, {"id": element, "element": element_data})
        return self

    def append_elements(self, element: str, element_data: list[dict[str:Any] | BaseHTMLModel]) -> T:
        if isinstance(element_data[0], BaseHTMLModel):
            element_data = [edata.model_dump() for edata in element_data]

        self.add_command(self.APPEND_ELEMENTS, {"id": element, "elements": element_data})
        return self

    def assign_element(self, element: str, element_data: dict[str:Any] | BaseHTMLModel) -> T:
        if isinstance(element_data, BaseHTMLModel):
            element_data = element_data.model_dump()

        self.add_command(self.ASSIGN_ELEMENT, {"id": element, "element": element_data})
        return self

    def assign_elements(self, element: str, element_data: list[dict[str:Any] | BaseHTMLModel]) -> T:
        if isinstance(element_data[0], BaseHTMLModel):
            element_data = [edata.model_dump() for edata in element_data]

        self.add_command(self.ASSIGN_ELEMENTS, {"id": element, "elements": element_data})
        return self

    def append_list(self, element: str, element_data: list[dict[str:Any]], list_type: str) -> T:
        self.add_command(
            self.APPEND_LIST,
            {"id": element, "element": element_data, "list_type": list_type},
        )
        return self

    def assign_list(self, element: str, element_data: list[dict[str:Any]], list_type: str) -> T:
        self.add_command(
            self.ASSIGN_LIST,
            {"id": element, "element": element_data, "list_type": list_type},
        )
        return self

    def append(self, element: str, value: str) -> T:
        """Prepares append command which adds value to element.

        The element can be #id, .class or just tag ex. p
        """
        self.add_command(self.APPEND, {"id": element}, value)
        return self

    def assign(self, element: str, value: str) -> T:
        """Prepares assign command which adds value to element.

        The element can be #id, .class or HTML tag.
        """
        self.add_command(self.ASSIGN, {"id": element}, value)
        return self

    def redirect(self, url: str) -> T:
        """Redirect command for url redirection."""
        self.add_command(self.REDIRECT, {"url": url})
        return self

    def reload_location(self) -> T:
        """Reload location command."""
        self.add_command(self.RELOAD_LOCATION)
        return self

    def remove(self, element: str) -> T:
        """Removes element by #id, .class or HTML tag."""
        self.add_command(self.REMOVE, {"id": element})
        return self

    def add_class(self, element: str, class_name: str) -> T:
        """Adds class to element which can be #id, .class or HTML tag."""
        self.add_command(self.ADD_CLASS, {"id": element}, class_name)
        return self

    def remove_class(self, element: str, class_name: str = None) -> T:
        """Removes class from element which can be #id, .class or HTML tag."""
        self.add_command(self.REMOVE_CLASS, {"id": element}, class_name)
        return self

    def set_class(self, element: str, class_name: str) -> T:
        """Sets new class on element which can be #id, .class or HTML tag."""
        self.remove_class(element)
        self.add_class(element, class_name)
        return self

    def return_json(self, data: Dict) -> T:
        """Allows return json as a command."""
        try:
            self.commands = data["errors"]
        except KeyError:
            self.commands = data
        return self

    def script(self, javascript: str) -> T:
        """Allows send javascript script to frontend."""
        self.add_command(self.RUN_SCRIPT, {}, javascript)
        return self

    def show(self, element: str) -> T:
        """Shows element."""
        self.add_command(self.SHOW, {"id": element})
        return self

    def hide(self, element: str) -> T:
        """Hides element."""
        self.add_command(self.HIDE, {"id": element})
        return self

    def insert_before(self, element: str, value: str) -> T:
        """Inserts value before element."""
        self.add_command(self.INSERT_BEFORE, {"id": element}, value)
        return self

    def insert_after(self, element: str, value: str) -> T:
        """Inserts value after element."""
        self.add_command(self.INSERT_AFTER, {"id": element}, value)
        return self

    def init_ajax_links(self) -> T:
        """Initialize ajax links."""
        self.add_command(self.INIT_AJAX_LINKS)
        return self

    def init_ajax_select(
            self, callback: Optional[str] = None, callbackParams: Optional[dict] = None,
            callbackCommands: Optional[list] = None
    ) -> T:
        """Initialize ajax select."""

        self.add_command(
            self.INIT_AJAX_SELECT,
            {"callback": callback, "callbackParams": callbackParams, "callbackCommands": callbackCommands}
        )
        return self

    def init_ajax_forms(self) -> T:
        """Initialize ajax forms."""
        self.add_command(self.INIT_AJAX_FORMS)
        return self

    def load_script(self, name: str, callback: str) -> T:
        """Allows load javascript script from file."""
        self.add_command(self.LOAD_SCRIPT, {"script": name, "callback": callback})
        return self

    def set_input_value(self, element: str, value: str) -> T:
        self.add_command(self.SET_INPUT_VALUE, {"id": element}, value)
        return self

    def modal(self, element: str, action: str) -> T:
        self.add_command(self.MODAL, {"id": element}, action)
        return self

    def set_url(self, element: str, url: str) -> T:
        self.add_command(self.URL, {"id": element}, url)
        return self

    def set_form_action(self, element: str, action: str) -> T:
        self.add_command(self.SET_FORM_ACTION, {"id": element}, action)
        return self

    def set_attribute(self, element: str, attribute_name: str, value: Any) -> T:
        self.add_command(
            self.SET_ATTRIBUTE,
            {"id": element, "attribute": attribute_name, "value": value},
        )
        return self

    def row_up(self, element: str) -> T:
        """Move table row (or other element) up."""
        self.add_command(self.ROW_UP, {"id": element})
        return self

    def row_down(self, element: str) -> T:
        """Move table row (or other element) down."""
        self.add_command(self.ROW_DOWN, {"id": element})
        return self

    def form_field_error(self, element: str, error_message: str) -> T:
        self.add_command(self.FORM_FIELD_ERROR, {"id": element, "error_message": error_message})
        return self

    def register_command_handler(self, command: str, handler: Callable[[Dict[str, Any]], T]) -> None:
        """Registers a new command handler dynamically."""
        self.command_handlers[command] = handler

    def call_handler(self, command: str, details: Dict[str, Any]) -> T:
        """Adds a command to the command list and attempts to process it dynamically."""
        handler = self.command_handlers.get(command, None)
        if handler:
            return handler(details)

        raise AjaxCommandHandlerError(f"No handler registered for command: {command}")

    def add_command(self, command: str, attributes: Dict = None, m_data=None) -> T:
        """Adds command."""
        if attributes is None:
            attributes = {}

        attributes["cmd"] = command
        attributes["data"] = m_data
        self.commands.append(attributes)
        return self
