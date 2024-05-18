#include "beeflow_ajax.h"
#include <Python.h>

typedef struct {
    PyObject_HEAD
    PyObject *commands;
    int status_code;
    char *content_type;
} AjaxResponse;


static int AjaxResponse_init(AjaxResponse *self, PyObject *args, PyObject *kwds) {
    self->commands = PyList_New(0);
    self->status_code = 200;
    self->content_type = "application/json";
    if (self->commands == NULL) {
        return -1;
    }
    return 0;
}

static void AjaxResponse_dealloc(AjaxResponse *self) {
    Py_XDECREF(self->commands);
    Py_TYPE(self)->tp_free((PyObject *)self);
}

static PyObject *AjaxResponse_add_command(AjaxResponse *self, PyObject *args, PyObject *kwargs) {
    const char *command;
    PyObject *attributes = Py_None;
    PyObject *m_data = Py_None;

    static char *kwlist[] = {"command", "attributes", "m_data", NULL};

    if (!PyArg_ParseTupleAndKeywords(args, kwargs, "s|OO", kwlist, &command, &attributes, &m_data)) {
        return NULL;
    }

    if (attributes == Py_None) {
        attributes = PyDict_New();
    } else {
        Py_INCREF(attributes);
    }

    PyDict_SetItemString(attributes, "cmd", PyUnicode_FromString(command));
    PyDict_SetItemString(attributes, "data", m_data);

    if (PyList_Append(self->commands, attributes) == -1) {
        Py_DECREF(attributes);
        return NULL;
    }

    Py_DECREF(attributes);
    Py_INCREF(self);

    return (PyObject *)self;
}

PyDoc_STRVAR(AjaxResponse_alert_doc,
    "Add an alert command to the response.\n\n"
    "alert(self, msg: str) -> None\n"
    "\n"
    ":param msg: (str) The message to display.\n"
);


static PyObject *AjaxResponse_alert(AjaxResponse *self, PyObject *args) {
    const char *msg;

    if (!PyArg_ParseTuple(args, "s", &msg)) {
        return NULL;
    }

    PyObject *attributes = PyDict_New();
    PyObject *m_data = PyUnicode_FromString(msg);

    return AjaxResponse_add_command(self, Py_BuildValue("sOO", ALERT, attributes, m_data), NULL);
}

PyDoc_STRVAR(AjaxResponse_alert_success_doc,
    "Add a success alert command to the response.\n\n"
    "alert_success(self, msg: str, title: str = '', callback: str = None) -> None\n"
    "\n"
    ":param msg: (str) The success message to display.\n"
    ":param title: (str) The title of the success message. Defaults to empty string.\n"
    ":param callback: (Optional[str]) The callback function name. Defaults to None.\n"
);

static PyObject *AjaxResponse_alert_success(AjaxResponse *self, PyObject *args, PyObject *kwargs) {
    const char *msg;
    const char *title = "";
    const char *callback = NULL;

    static char *kwlist[] = {"msg", "title", "callback", NULL};

    if (!PyArg_ParseTupleAndKeywords(args, kwargs, "s|sO", kwlist, &msg, &title, &callback)) {
        return NULL;
    }

    PyObject *attributes = PyDict_New();
    PyObject *m_data = PyUnicode_FromString(msg);

    PyDict_SetItemString(attributes, "title", PyUnicode_FromString(title));
    PyDict_SetItemString(attributes, "callback", callback ? PyUnicode_FromString(callback) : Py_None);
    PyObject *result = AjaxResponse_add_command(self, Py_BuildValue("sOO", "alertSuccess", attributes, m_data), NULL);
    Py_DECREF(attributes);

    return result;
}

PyDoc_STRVAR(AjaxResponse_alert_error_doc,
    "Add an error alert command to the response.\n\n"
    "alert_error(self, msg: str, title: str = '', callback: str = None) -> None\n"
    "\n"
    ":param msg: (str) The error message to display.\n"
    ":param title: (str) The title of the error message. Defaults to empty string.\n"
    ":param callback: (Optional[str]) The callback function name. Defaults to None.\n"
);

static PyObject *AjaxResponse_alert_error(AjaxResponse *self, PyObject *args, PyObject *kwargs) {
    const char *msg;
    const char *title = "";
    const char *callback = NULL;

    static char *kwlist[] = {"msg", "title", "callback", NULL};

    if (!PyArg_ParseTupleAndKeywords(args, kwargs, "s|sO", kwlist, &msg, &title, &callback)) {
        return NULL;
    }

    PyObject *attributes = PyDict_New();
    PyObject *m_data = PyUnicode_FromString(msg);

    PyDict_SetItemString(attributes, "title", PyUnicode_FromString(title));
    PyDict_SetItemString(attributes, "callback", callback ? PyUnicode_FromString(callback) : Py_None);
    PyObject *result = AjaxResponse_add_command(self, Py_BuildValue("sOO", "alertError", attributes, m_data), NULL);
    Py_DECREF(attributes);

    return result;
}

PyDoc_STRVAR(AjaxResponse_alert_warning_doc,
    "Add a warning alert command to the response.\n\n"
    "alert_warning(self, msg: str, title: str = '', callback: str = None) -> None\n"
    "\n"
    ":param msg: (str) The warning message to display.\n"
    ":param title: (str) The title of the warning message. Defaults to empty string.\n"
    ":param callback: (Optional[str]) The callback function name. Defaults to None.\n"
);

static PyObject *AjaxResponse_alert_warning(AjaxResponse *self, PyObject *args, PyObject *kwargs) {
    const char *msg;
    const char *title = "";
    const char *callback = NULL;

    static char *kwlist[] = {"msg", "title", "callback", NULL};

    if (!PyArg_ParseTupleAndKeywords(args, kwargs, "s|sO", kwlist, &msg, &title, &callback)) {
        return NULL;
    }

    PyObject *attributes = PyDict_New();
    PyObject *m_data = PyUnicode_FromString(msg);

    PyDict_SetItemString(attributes, "title", PyUnicode_FromString(title));
    PyDict_SetItemString(attributes, "callback", callback ? PyUnicode_FromString(callback) : Py_None);
    PyObject *result = AjaxResponse_add_command(self, Py_BuildValue("sOO", "alertWarning", attributes, m_data), NULL);
    Py_DECREF(attributes);

    return result;
}


static PyObject *AjaxResponse_get_response(AjaxResponse *self, PyObject *Py_UNUSED(ignored)) {
    PyObject *json_module = PyImport_ImportModule("json");
    PyObject *dumps_func = PyObject_GetAttrString(json_module, "dumps");
    PyObject *args = PyTuple_Pack(1, self->commands);
    PyObject *json_response = PyObject_CallObject(dumps_func, args);
    Py_DECREF(args);
    Py_DECREF(dumps_func);
    Py_DECREF(json_module);
    return json_response;
}

static PyObject *AjaxResponse_get_status_code(AjaxResponse *self, void *closure) {
    return PyLong_FromLong(self->status_code);
}

static int AjaxResponse_set_status_code(AjaxResponse *self, PyObject *value, void *closure) {
    if (!PyLong_Check(value)) {
        PyErr_SetString(PyExc_TypeError, "The status_code attribute value must be an int");
        return -1;
    }
    self->status_code = PyLong_AsLong(value);
    return 0;
}

static PyObject *AjaxResponse_get_content_type(AjaxResponse *self, void *closure) {
    return PyUnicode_FromString(self->content_type);
}

static int AjaxResponse_set_content_type(AjaxResponse *self, PyObject *value, void *closure) {
    if (!PyUnicode_Check(value)) {
        PyErr_SetString(PyExc_TypeError, "The content_type attribute value must be a string");
        return -1;
    }
    self->content_type = PyUnicode_AsUTF8(value);
    return 0;
}

static PyObject *AjaxResponse_get_content(AjaxResponse *self, void *closure) {
    return AjaxResponse_get_response(self, NULL);
}



static PyMethodDef AjaxResponse_methods[] = {
    {"add_command", (PyCFunction)AjaxResponse_add_command, METH_VARARGS, "Add a command to the response"},
    {"alert", (PyCFunction)AjaxResponse_alert, METH_VARARGS, AjaxResponse_alert_doc},
    {"alert_success", (PyCFunction)AjaxResponse_alert_success, METH_VARARGS | METH_KEYWORDS, AjaxResponse_alert_success_doc},
    {"alert_error", (PyCFunction)AjaxResponse_alert_error, METH_VARARGS | METH_KEYWORDS, AjaxResponse_alert_error_doc},
    {"alert_warning", (PyCFunction)AjaxResponse_alert_warning, METH_VARARGS | METH_KEYWORDS, AjaxResponse_alert_warning_doc},
    {"get_response", (PyCFunction)AjaxResponse_get_response, METH_NOARGS, "Get the response as a JSON string"},
    {NULL, NULL, NULL, NULL}  /* Sentinel */
};

static PyGetSetDef AjaxResponse_getsetters[] = {
    {"status_code", (getter)AjaxResponse_get_status_code, (setter)AjaxResponse_set_status_code, "status_code", NULL},
    {"content_type", (getter)AjaxResponse_get_content_type, (setter)AjaxResponse_set_content_type, "content_type", NULL},
    {"content", (getter)AjaxResponse_get_content, NULL, "content", NULL},
    {NULL, NULL, NULL, NULL}  /* Sentinel */
};

static PyTypeObject AjaxResponseType = {
    PyVarObject_HEAD_INIT(NULL, 0)
    .tp_name = "beeflow_ajax.AjaxResponse",
    .tp_doc = "AjaxResponse objects",
    .tp_basicsize = sizeof(AjaxResponse),
    .tp_itemsize = 0,
    .tp_flags = Py_TPFLAGS_DEFAULT,
    .tp_new = PyType_GenericNew,
    .tp_init = (initproc)AjaxResponse_init,
    .tp_dealloc = (destructor)AjaxResponse_dealloc,
    .tp_methods = AjaxResponse_methods,
    .tp_getset = AjaxResponse_getsetters,
};

static PyModuleDef beeflowajaxmodule = {
    PyModuleDef_HEAD_INIT,
    "beeflow_ajax",
    "Module for creating Ajax responses",
    -1,
    AjaxResponse_methods
};

PyMODINIT_FUNC PyInit_beeflow_ajax(void) {
    PyObject *m;
    if (PyType_Ready(&AjaxResponseType) < 0)
        return NULL;

    m = PyModule_Create(&beeflowajaxmodule);
    if (m == NULL)
        return NULL;

    Py_INCREF(&AjaxResponseType);
    if (PyModule_AddObject(m, "AjaxResponse", (PyObject *) &AjaxResponseType) < 0) {
        Py_DECREF(&AjaxResponseType);
        Py_DECREF(m);
        return NULL;
    }

    return m;
}