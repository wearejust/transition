var events = {};

export function on(event, callback) {
    if (!events[event]) events[event] = [];
    events[event].push(callback);
}

export function trigger(event, data) {
    event = events[event];
    let callback;
    for (callback in event) {
        event[callback](data);
    }
}