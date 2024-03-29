const map = Object.create(null);

const dataPriv = {
    get: function (elem) {
        if (!map[elem]) {
            return this.set(elem);
        }
        return map[elem];
    },
    set: function (elem) {
        let o = Object.create(null);
        map[elem] = o;

        return o;
    },
    remove: function (elem, key) {
        let cache = map[elem];

        if (cache === undefined) {
            return;
        }

        if (key !== undefined) {
            cache[key] = undefined;
            delete cache[key];
        }
    },
};

function handle(event, handlers) {
    var i;
    let handleObj;
    let sel;
    let matchedHandlers;
    let matchedSelectors;
    let handlerQueue = [];
    let delegateCount = handlers.delegateCount;
    let cur = event.target;

    if (delegateCount && cur.nodeType) {
        for (; cur !== this; cur = cur.parentNode || this) {
            if (cur.nodeType === 1) {
                matchedHandlers = [];
                matchedSelectors = Object.create(null);

                for (i = 0; i < delegateCount; i++) {
                    handleObj = handlers[i];

                    sel = handleObj.selector + ' ';

                    if (matchedSelectors[sel] === undefined) {
                        let els = document.getElementsByClassName(sel);

                        let len = 0;
                        for (var i = 0, il = els.length; i < il; i++) {
                            if (els[i] === cur) {
                                len++;
                            }
                        }

                        matchedSelectors[sel] = len;
                    }

                    if (matchedSelectors[sel]) {
                        matchedHandlers.push(handleObj);
                    }
                }

                if (matchedHandlers.length) {
                    handlerQueue.push({
                        elem: cur,
                        handlers: matchedHandlers,
                    });
                }
            }
        }
    }

    return handlerQueue;
}

function dispatch(nativeEvent) {
    let event = {
        type: nativeEvent.type,
        currentTarget: nativeEvent.currentTarget,
        target: nativeEvent.target,
    };

    let i = 0;
    let j = 0;
    let matched;
    let handleObj;
    let handlerQueue;
    let args = new Array(arguments.length);
    let handlers = dataPriv.get(this).events[event.type];

    args[0] = event;

    for (i = 1; i < arguments.length; i++) {
        args[i] = arguments[i];
    }

    handlerQueue = handle.call(this, event, handlers);

    i = 0;
    while ((matched = handlerQueue[i++])) {
        event.currentTarget = matched.elem;

        j = 0;
        while ((handleObj = matched.handlers[j++])) {
            handleObj.handler.apply(matched.elem, args);
        }
    }
}

function delegate(elem, type, handler, selector) {
    let eventHandle;
    let handlers;
    let events;
    let handleObj;
    let elemData = dataPriv.get(elem);

    if (!(events = elemData.events)) {
        events = elemData.events = Object.create(null);
    }

    if (!(eventHandle = elemData.handle)) {
        eventHandle = elemData.handle = function (e) {
            return dispatch.apply(elem, arguments);
        };
    }

    handleObj = {
        type: type,
        handler: handler,
        selector: selector,
    };

    if (!(handlers = events[type])) {
        handlers = events[type] = [];
        handlers.delegateCount = 0;
    }

    elem.addEventListener && elem.addEventListener(type, eventHandle);

    if (selector) {
        handlers.splice(handlers.delegateCount++, 0, handleObj);
    } else {
        handlers.push(handleObj);
    }
}

export default delegate;
