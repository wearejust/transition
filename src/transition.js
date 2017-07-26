// Available
export var available;

$(function() {
    available = !!history.pushState;
    if (!available) return;

    trigger('ready');
});

