BeeflowAjax.remove = function (elementId) {
    $(elementId).fadeOut().remove();
};

BeeflowMessageComponent.success = function (msg, title, callback) {
    if (callback) {
        console.log(callback)
        swal(title, msg, "success").then(() => {eval(callback)});
    } else {
        swal(title, msg, "success");
    }
};

BeeflowMessageComponent.datatable_confirm = function (element, event, title = "", text = "", _callback) {
    swal({
        title: $(element).data('confirm-tile') ? $(element).data('confirm-tile') : title,
        text: $(element).data('confirm') ? $(element).data('confirm') : text,
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            _callback()
        } else {
            return false;
        }
    });

    return false;
};

BeeflowMessageComponent.confirm = function (element, event, title = "", text = "") {
    swal({
        title: $(element).data('confirm-tile') ? $(element).data('confirm-tile') : title,
        text: $(element).data('confirm') ? $(element).data('confirm') : text,
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            BeeflowAjax.linkClickedAction(element, event);
        } else {
            return false;
        }
    });

    return false;
};

BeeflowMessageComponent.internalServerError = function () {
    swal(
        BeeflowMessages['Internal Server Error'],
        BeeflowMessages['The server encountered something unexpected that didn\'t allow it to complete the request. We apologize.'],
        "error"
    );
};

BeeflowMessageComponent.error = function (msg, title, callback) {
    if (callback && typeof (callback) === "function") {
        swal(title, msg, "error").then(() => {eval(callback)});
    } else {
        swal(title, msg, "error");
    }
};

BeeflowMessageComponent.warning = function (msg, title, callback) {
    if (callback && typeof (callback) === "function") {
        swal(title, msg, "warning").then(() => {eval(callback)});
    } else {
        swal(title, msg, "warning");
    }
};

BeeflowMessageComponent.info = function (msg, title, callback) {
    if (callback && typeof (callback) === "function") {
        swal(title, msg, "info").then(() => {eval(callback)});
    } else {
        swal(title, msg, "info");
    }
};

BeeflowAjax.remove = function (elementId) {
    $(elementId).fadeOut(500, function () {
        $(this).remove();
    });
};
