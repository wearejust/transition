let events = {};

export function on(names, callback) {
    names.split(' ').map((name) => {
        if (!events[name]) events[name] = [];
        events[name].push(callback);
    });
}

export function trigger(names, data) {
    let event, callback;
    names.split(' ').map((name) => {
        event = events[name];
        for (callback in event) {
            event[callback](data, name);
        }
    });
}