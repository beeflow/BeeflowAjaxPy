/**
 * @author Rafal Przetakowski <rafal.p@beeflow.co.uk>
 * @copyright (c) 2015 - 2017, Beeflow Ltd
 */

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

const jsonParser = (blob) => {
    let parsed = JSON.parse(blob);
    if (typeof parsed === 'string') parsed = jsonParser(parsed);
    return parsed;
}

const rowUp = (element_id) => {
    let row = document.querySelector(element_id)
    let sibling = row.previousElementSibling;

    if (sibling) {
        row.classList.add("move-up");
        sibling.classList.add("move-down")

        setTimeout(() => {
            row.parentNode.insertBefore(row, sibling);
            row.classList.remove("move-up");
            sibling.classList.remove("move-down");
        }, 200)
    }
}

const rowDown = (element_id) => {
    let row = document.querySelector(element_id)
    let sibling = row.nextElementSibling;

    if (sibling) {
        row.classList.add("move-down");
        sibling.classList.add("move-up")
        setTimeout(() => {
            row.parentNode.insertBefore(sibling, row);
            row.classList.remove("move-down");
            sibling.classList.remove("move-up");
        }, 200)
    }
}

var BeeflowAjax = BeeflowAjax || {};
var pingFunctions = [];

BeeflowAjax.ws = null

/**
 * You can easy use toastr or write your own methods to show messages
 */
var BeeflowMessageComponent = BeeflowMessageComponent || {};

BeeflowMessages = {
    'Internal Server Error': 'Internal Server Error',
    "The server encountered something unexpected that didn't allow it to complete the request. We apologize.": "The server encountered something unexpected that didn't allow it to complete the request. We apologize.",
    'This file is too large': 'This file is too large!'
};

BeeflowMessageComponent.success = function (msg, title, callback) {
    const showAlert = (message) => {
        return new Promise(function (resolve) {
            alert(message);
            resolve();
        });
    }

    if (callback) {
        showAlert(title + "\n\n" + msg).then(() => {
            callback()
        })
    } else {
        showAlert(title + "\n\n" + msg)
    }
};

BeeflowMessageComponent.error = function (msg, title, callback) {
    const showAlert = (message) => {
        return new Promise(function (resolve) {
            alert(message);
            resolve();
        });
    }

    if (callback) {
        showAlert(title + "\n\n" + msg).then(() => {
            eval(callback)
        })
    } else {
        showAlert(title + "\n\n" + msg)
    }
};

BeeflowMessageComponent.internalServerError = function () {
    var $alertElements = [
        BeeflowMessages['Internal Server Error'],
        BeeflowMessages["The server encountered something unexpected that didn't allow it to complete the request. We apologize."]
    ];

    alert($alertElements.join("\n\n"));
};

BeeflowMessageComponent.warning = function (msg, title, callback) {
    const showAlert = (message) => {
        return new Promise(function (resolve) {
            alert(message);
            resolve();
        });
    }

    if (callback) {
        showAlert(title + "\n\n" + msg).then(() => {
            eval(callback)
        })
    } else {
        showAlert(title + "\n\n" + msg)
    }
};

BeeflowMessageComponent.info = function (msg, title, callback) {
    const showAlert = (message) => {
        return new Promise(function (resolve) {
            alert(message);
            resolve();
        });
    }

    if (callback) {
        showAlert(title + "\n\n" + msg).then(() => {
            eval(callback)
        })
    } else {
        showAlert(title + "\n\n" + msg)
    }
};

BeeflowMessageComponent.confirm = function (element, event) {
    return confirm($(element).data('confirm'));
};

BeeflowAjax.websocket = {
    init: (url, params, callback) => {
        BeeflowAjax.ws = new WebSocket(url);

        BeeflowAjax.ws.onopen = () => {
            BeeflowAjax.websocket.send(params, callback)
        }
    },
    send: (params, callback) => {
        BeeflowAjax.ws.send(JSON.stringify(params))
        BeeflowAjax.ws.onmessage = (event) => {
            const eventMessage = jsonParser(event.data);

            BeeflowAjax.ajaxResponseCommands(eventMessage);

            if (callback && typeof (callback) === "function") {
                callback(eventMessage)
            }
        }
    }
}

BeeflowAjax.send = function (url, params, clicked_button, callback, callMethod) {
    $(clicked_button).addClass('disabled');
    var icon = $(clicked_button).children()[0];
    if (typeof icon !== 'undefined') {
        var icon_class = $(icon).attr('class');
        $(icon).removeClass(icon_class);
        $(icon).addClass('fa fa-spin fa-spinner');
    }

    if (typeof callMethod === 'undefined') {
        callMethod = "POST";
    }

    $.ajax({
        method: callMethod,
        url: url,
        data: {'data': params},
        beforeSend: function (xhr) {
            xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
        }
    }).done(function (responseMessage) {
        let msg = "string" === typeof responseMessage ? JSON.parse(responseMessage) : responseMessage;
        BeeflowAjax.ajaxResponseCommands(msg);

        if (callback && typeof (callback) === "function") {
            callback(msg);
        }
    }).fail(function (responseMessage) {
        if (!responseMessage.responseText) {
            BeeflowMessageComponent.internalServerError()
            return
        }

        let responseText = responseMessage.responseText
        let errmsg = "string" === typeof responseText ? JSON.parse(responseText) : responseText;
        BeeflowAjax.ajaxResponseCommands(errmsg);
    }).always(function () {
        if (typeof icon !== 'undefined') {
            $(icon).removeClass();
            $(icon).addClass(icon_class);
        }
        $(clicked_button).removeClass('disabled');
    });

};

BeeflowAjax.pingRegister = function (functionName, regFunction) {
    pingFunctions[functionName] = regFunction;
};

BeeflowAjax.pingUnregister = function (functionName) {
    delete pingFunctions[functionName];
};

BeeflowAjax.ping = function () {
    for (var key in pingFunctions) {
        pingFunctions[key]();
    }
};

BeeflowAjax.remove = function (elementId) {
    $(elementId).remove();
};

BeeflowAjax.loadScript = function ($scriptName, $callback) {
    $.ajax({
        url: $scriptName,
        dataType: 'script',
        async: true
    }).done(function () {
        try {
            eval($callback)();
        } catch (e) {
            eval($callback);
        }
    });
};

BeeflowAjax.ajaxResponseCommands = function (msg) {
    for (let index = 0, len = msg.length; index < len; ++index) {
        var command = msg[index]['cmd'];
        switch (command) {
            case "alert" :
                alert(msg[index]['data']);
                break;
            case "alertSuccess" :
                BeeflowMessageComponent.success(msg[index]['data'], msg[index]['title'], msg[index]['callback']);
                break;
            case "alertError" :
                BeeflowMessageComponent.error(msg[index]['data'], msg[index]['title'], msg[index]['callback']);
                break;
            case "alertWarning" :
                BeeflowMessageComponent.warning(msg[index]['data'], msg[index]['title'], msg[index]['callback']);
                break;
            case "alertInfo" :
                BeeflowMessageComponent.info(msg[index]['data'], msg[index]['title'], msg[index]['callback']);
                break;
            case "debug" :
                console.log(msg[index]['data']);
                break;
            case "remove" :
                BeeflowAjax.remove(msg[index]['id']);
                break;
            case "rowUp" :
                rowUp(msg[index]['id']);
                break;
            case "rowDown" :
                rowDown(msg[index]['id']);
                break;
            case "append" :
                $(msg[index]['id']).append(msg[index]['data']);
                break;
            case "appendElement":
                document.querySelector(msg[index]['id']).appendChild(
                    BeeflowAjax.build.element(msg[index]['element'])
                );
                break;
            case "appendElements":
                console.log(msg[index]['elements'])
                msg[index]['elements'].forEach((element) => {
                    document.querySelector(msg[index]['id']).appendChild(
                        BeeflowAjax.build.element(element)
                    );
                });
                break;
            case "assignElement":
                let elementContainer = document.querySelector(msg[index]['id']);
                elementContainer.innerHTML = "";
                elementContainer.appendChild(
                    BeeflowAjax.build.element(msg[index]['element'])
                );
                break;
            case "assignElements":
                let elementsContainer = document.querySelector(msg[index]['id']);
                elementsContainer.innerHTML = "";
                msg[index]['elements'].forEach((element) => {
                    elementsContainer.appendChild(
                        BeeflowAjax.build.element(element)
                    );
                });
                break;
            case "appendList":
                document.querySelector(msg[index]['id']).appendChild(
                    BeeflowAjax.build.list(msg[index]['list_type'], msg[index]['element'])
                );
                break;
            case "assignList":
                let listContainer = document.querySelector(msg[index]['id']);
                listContainer.innerHTML = "";
                listContainer.appendChild(
                    BeeflowAjax.build.list(msg[index]['list_type'], msg[index]['element'])
                );
                break;
            case "assign" :
                $(msg[index]['id']).html(msg[index]['data']);
                break;
            case "addClass" :
                $(msg[index]['id']).addClass(msg[index]['data']);
                break;
            case "removeClass" :
                if (msg[index]['data'] == null) {
                    $(msg[index]['id']).removeClass();
                } else {
                    $(msg[index]['id']).removeClass(msg[index]['data']);
                }
                break;
            case "redirect" :
                window.location.href = msg[index]['url'];
                break;
            case "reloadLocation":
                window.location.reload();
                break;
            case "runScript" :
                jQuery.globalEval(msg[index]['data']);
                break;
            case "modal" :
                $(msg[index]['id']).modal(msg[index]['data']);
                break;
            case "show" :
                $(msg[index]['id']).show();
                break;
            case "hide" :
                $(msg[index]['id']).hide();
                break;
            case "insertBefore":
                $(msg[index]['data']).insertBefore(msg[index]['id']);
                break;
            case "initAjaxLinks":
                BeeflowAjax.initAjaxLinks();
                break;
            case "initAjaxForms":
                BeeflowAjax.initAjaxForms();
                break;
            case "initWebsocketForms":
                BeeflowAjax.initWebSocketForm();
                break;
            case "initAjaxSelect":
                BeeflowAjax.initAjaxSelect();
                break;
            case "loadScript":
                BeeflowAjax.loadScript(msg[index]['script'], msg[index]['callback']);
                break;
            case "returnJson":
                break;
            case "setInputValue":
                $(msg[index]['id']).val("");
                $(msg[index]['id']).val(msg[index]['data']);
                break;
            case "setAttribute":
                document.querySelector(msg[index]['id']).setAttribute(msg[index]['attribute'], msg[index]['value']);
                break;
        }
    }
};

BeeflowAjax.setFormFeedback = function (elementId, feedbackType) {
    var formGroup = $("#" + elementId).parents('.form-group');
    var glyphicon = formGroup.find('.glyphicon');
    switch (feedbackType) {
        case 'error' :
            formGroup.addClass('has-error').removeClass('has-success').removeClass('has-warning');
            glyphicon.addClass('glyphicon-remove').removeClass('glyphicon-ok').removeClass('glyphicon-warning-sign');
            break;
        case 'warning' :
            formGroup.addClass('has-warning').removeClass('has-success').removeClass('has-error');
            glyphicon.addClass('glyphicon-warning-sign').removeClass('glyphicon-ok').removeClass('glyphicon-remove');
            break;
        case 'success' :
            formGroup.addClass('has-success').removeClass('has-warning').removeClass('has-error');
            glyphicon.addClass('glyphicon-ok').removeClass('glyphicon-warning-sign').removeClass('glyphicon-remove');
            break;
        case 'clear' :
            formGroup.removeClass('has-success').removeClass('has-warning').removeClass('has-error');
            glyphicon.removeClass('glyphicon-ok').removeClass('glyphicon-warning-sign').removeClass('glyphicon-remove');
            break;
    }
};

BeeflowAjax.getFormValues = function (form) {
    if (typeof form === 'string') {
        var objects = $('form[name="' + form + '"]').serializeArray();
    } else {
        var objects = $(form).serializeArray();
    }
    var data = {};

    jQuery.each(objects, function (i, field) {
        data[field.name] = field.value;
    });

    return JSON.stringify(BeeflowAjax.prepareJson(data));
};

BeeflowAjax.prepareJson = function (data) {
    function htmlEncode(value) {
        return $('<div/>').text(value).html();
    }

    var ret = {};
    retloop:
        for (var input in data) {
            var val = data[input];

            var parts = input.split('[');
            var last = ret;

            for (var i in parts) {
                var part = parts[i];
                if (part.substr(-1) == ']') {
                    part = part.substr(0, part.length - 1);
                }

                if (i == parts.length - 1) {
                    last[part] = htmlEncode(val);
                    continue retloop;
                } else if (!last.hasOwnProperty(part)) {
                    last[part] = {};
                }
                last = last[part];
            }
        }
    return ret;
};

BeeflowAjax.initWebSocketForm = () => {
    $('.websocket-form').each(function () {
        $(this).unbind('submit');
        $(this).submit(function (e) {
            let submitButton = $(this).find('button[type="submit"]');

            if (submitButton.length === 0) {
                submitButton = $(this).find('input[type="submit"]');
            }

            let formData = JSON.parse(BeeflowAjax.getFormValues(this));
            BeeflowAjax.websocket.send(formData)
            e.preventDefault()
        })
    })
}

BeeflowAjax.initAjaxForms = function () {
    $('.ajax-form').each(function () {
        var $form = this;
        $($form).children('button[type="submit"]').on('click', function () {
            $($form).submit();
        });
        $($form).children('input[type="submit"]').on('click', function () {
            $($form).submit();
        });

        var callbackMethod = $($form).data('callback');
        var method = $($form).attr('method');

        if (typeof method === 'undefined') {
            method = 'POST';
        }

        $(this).unbind('submit');
        $(this).submit(function (e) {

            var submitButton = $(this).find('button[type="submit"]');
            if (submitButton.length === 0) {
                submitButton = $(this).find('input[type="submit"]');
            }

            BeeflowAjax.send($(this).attr('action'), BeeflowAjax.getFormValues(this), submitButton, callbackMethod, method);
            e.preventDefault();
        });
    });
};

BeeflowAjax.linkClickedAction = function (element, e) {
    var action = $(element).attr('href');
    var actionMethod = $(element).data('method');

    if (typeof actionMethod === 'undefined') {
        actionMethod = 'GET';
    }

    var callMethod = $(element).data('callback');

    BeeflowAjax.send(action, $(element).data(), element, callMethod, actionMethod);
    e.preventDefault();
};

BeeflowAjax.initAjaxLinks = function () {
    $('.ajax-link').each(function () {
        $(this).unbind('click');
        $(this).click(function (e) {
            if (typeof $(this).data('confirm') !== 'undefined') {
                if (!BeeflowMessageComponent.confirm($(this), e)) {
                    e.preventDefault();
                    return false;
                }
            }

            BeeflowAjax.linkClickedAction($(this), e);
        });
    });
};

BeeflowAjax.initAjaxSelect = function (elementId) {
    $("select").each(function () {
        if (typeof $(this).data('ajax-datasource') !== 'undefined' && elementId == $(this).attr('id')) {
            $(this).unbind('change');
            $(this).find('option').remove();

            var $element = $(this);
            var $request = $.ajax({
                url: $(this).data('ajax-datasource')
            });

            var url_value = url('?' + $(this).data('url-value'), decodeURIComponent(url()));
            var default_value = ($(this).data('default-value') === 'undefined') ? null : $(this).data('default-value');
            var selected_value = (url_value == null) ? default_value : url_value;
            if (typeof $(this).attr('multiple') === 'undefined') {
                var option = new Option('--', 0, (selected_value == null) ? true : false, (selected_value == null) ? true : false);
                $element.append(option);
            }
            $request.then(function (data) {
                if ("string" === typeof data) {
                    var data = JSON.parse(data);
                }
                for (var d = 0; d < data.length; d++) {
                    var item = data[d];
                    if (typeof selected_value !== 'object') {
                        var selected = (selected_value == item.id);
                    } else {
                        var selected = inArray(item.id, selected_value);
                    }
                    var option = new Option(item.text, item.id, selected, selected);
                    $element.append(option);
                }
            });
        }
    });
};

function inArray(needle, haystack) {
    if (typeof haystack === 'string') {
        haystack = [haystack];
    }
    if (typeof haystack === 'undefined') {
        return false;
    }
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
        if (typeof haystack[i] == 'object') {
            if (arrayCompare(haystack[i], needle))
                return true;
        } else {
            if (haystack[i] == needle)
                return true;
        }
    }
    return false;
}

function removeFromAjaxSelect(element) {
    for (var key in AjaxSelect) {
        if (AjaxSelect[key] == 'bar') {
            AjaxSelect.splice(key, 1);
        }
    }
}

BeeflowAjax.build = {
    element: (elementToBuild) => {
        const newElement = document.createElement(elementToBuild.elementName)
        const ignoredAttributes = ["elementType", "elementName"]

        for (let elementAttribute in elementToBuild) {
            if (!elementToBuild.hasOwnProperty(elementAttribute)) {
                continue
            }

            if (ignoredAttributes.includes(elementAttribute)) {
                continue
            }

            if (elementAttribute === "innerText") {
                newElement.textContent = elementToBuild.innerText
                continue
            }

            if (elementAttribute === "appendText") {
                newElement.innerHTML += elementToBuild.appendText
                continue
            }

            if (elementAttribute === "innerElement") {
                newElement.appendChild(BeeflowAjax.build[elementToBuild.innerElement.elementType](
                    elementToBuild.innerElement
                ))
                continue
            }

            if (elementAttribute === "innerElements") {
                elementToBuild.innerElements.forEach((element) => {
                    newElement.appendChild(BeeflowAjax.build[element.elementType](element))
                })
                continue
            }

            if (elementAttribute === "innerHTML") {
                newElement.innerHTML = elementToBuild.innerHTML
                continue
            }

            if (elementAttribute === "callback") {
                /** todo Implement callback function */
                continue
            }

            newElement.setAttribute(elementAttribute, elementToBuild[elementAttribute])
        }

        return newElement
    },

    list: (listType, listElements, callback) => {
        const listElement = document.createElement(listType)
        const possibleElements = ["element"]

        listElements.forEach((obj) => {
            if (obj.elementType === "element") {
                var newElement = BeeflowAjax.build["element"](obj)
            }

            if (possibleElements.includes(obj.elementType)) {
                listElement.appendChild(newElement)
            }
        })

        return listElement
    }
}


const elementsArray3 = [
    {
        "elementType": "element",
        "elementName": "li",
        "class": "label label-warning",
        "innerElement": {
            "elementType": "element",
            "elementName": "a",
            "href": "https://google.pl",
            "title": "Google",
            "innerText": "Google"

        }
    },
    {
        "elementType": "element",
        "elementName": "li",
        "class": "label label-warning",
        "innerElement": {
            "elementType": "element", "elementName": "a",
            "href": "https://example.com",
            "title": "Example",
            "innerText": "Example"

        }
    }
]

$(document).ready(function () {
    BeeflowAjax.initAjaxForms();
    BeeflowAjax.initAjaxLinks();
    BeeflowAjax.initAjaxSelect();
    BeeflowAjax.initWebSocketForm()
    setInterval(BeeflowAjax.ping, 1000);
});