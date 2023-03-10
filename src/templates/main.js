const screen_width = 1920;
const screen_height = 1080;
const image_width = document.getElementById("screen").offsetWidth;
const image_height = document.getElementById("screen").offsetHeight;

var cursor_moved = false;
var cursor_x = 0;
var cursor_y = 0;

const URL = window.location.href.split("//")[1].split("/")[0];

let the_controllers = new WebSocket("ws://" + URL + "/controllers");
let screen_1 = new WebSocket("ws://" + URL + "/screen_1");
let screen_2 = new WebSocket("ws://" + URL + "/screen_2");

screen_1.onopen = function (_) {
    screen_1.send("get");
    document.title = "LoControl • Connected!";
};

screen_1.onmessage = function (e) {
    document.getElementById("screen").src = e.data;
    if (cursor_moved) {
        the_controllers.send("cursor:" + cursor_x + ":" + cursor_y);
        cursor_moved = false;
    }
    screen_2.send(".");
};

screen_2.onmessage = function (e) {
    document.getElementById("screen").src = e.data;
    screen_1.send(".");
};

const error = function (_) {document.title = "LoControl • Deconected!";};
the_controllers.onclose = error;
the_controllers.onerror = error;
screen_1.onclose = error;
screen_1.onerror = error;
screen_2.onclose = error;
screen_2.onerror = error;

function onScreen(x, y){
    if (x >= (document.documentElement.clientWidth - document.getElementById("screen").offsetWidth) / 2 &&
        x <= (document.documentElement.clientWidth + document.getElementById("screen").offsetWidth) / 2 &&
        y >= (document.documentElement.clientHeight - document.getElementById("screen").offsetHeight) / 2 &&
        y <= (document.documentElement.clientHeight + document.getElementById("screen").offsetHeight) / 2) {
        return true;
    } else {
        return false;
    }
}

onmousemove = function (e) {
    if (onScreen(e.clientX, e.clientY)) {
        cursor_x = (((e.clientX - (document.documentElement.clientWidth - document.getElementById("screen").offsetWidth) / 2) * screen_width) / 
                    document.getElementById("screen").offsetWidth).toFixed();
        cursor_y = (((e.clientY - (document.documentElement.clientHeight - document.getElementById("screen").offsetHeight) / 2) * screen_height) / 
                    document.getElementById("screen").offsetHeight).toFixed();
        cursor_moved = true;
    }
};

onmousedown = function (e) {
    if (onScreen(e.clientX, e.clientY)) {
        if (window.event.which == 1) {
            the_controllers.send("leftdown");
        } else if (window.event.which == 3) {
            the_controllers.send("rightdown");
        }
    }
};

onmouseup = function (e) {
    if (onScreen(e.clientX, e.clientY)) {
        if (window.event.which == 1) {
            the_controllers.send("leftup");
        } else if (window.event.which == 3) {
            the_controllers.send("rightup");
        }
    }
};

onkeydown = function (e) {
    the_controllers.send("keypress:" + e["key"]);
};

onkeyup = function (e) {
    the_controllers.send("keyrelease:" + e["key"]);
};
