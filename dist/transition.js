/** 
* @wearejust/transition 
* Transition between pages 
* 
* @version 1.0.0 
* @author Emre Koc <emre.koc@wearejust.com> 
*/
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.on = on;
exports.trigger = trigger;
// Events
var events = {};

function on(event, callback) {
    if (!events[event]) events[event] = [];
    events[event].push(callback);
}

function trigger(event, data) {
    event = events[event];
    var callback = void 0;
    for (callback in event) {
        event[callback](data);
    }
}

// Available
var available = exports.available = undefined;

$(function () {
    exports.available = available = !!history.pushState;
    if (!available) return;

    trigger('ready');
});