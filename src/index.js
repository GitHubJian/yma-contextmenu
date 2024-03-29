import delegate from './delegate';

const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;
const camelCase = function (name) {
    return name
        .replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
            return offset ? letter.toUpperCase() : letter;
        })
        .replace(MOZ_HACK_REGEXP, 'Moz$1');
};

function isFunction(v) {
    return typeof v === 'function';
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function setStyle(el, styleName, value) {
    if (!el || !styleName) {
        return;
    }

    if (typeof styleName === 'object') {
        for (let prop in styleName) {
            if (styleName.hasOwnProperty(prop)) {
                setStyle(el, prop, styleName[prop]);
            }
        }
    } else {
        styleName = camelCase(styleName);

        el.style[styleName] = value;
    }
}

function bindContextMenu(el, list) {
    let contextmenu;
    let contextmenuWidth;
    let contextmenuHeight;

    function createContextMenu(el, list) {
        const keymaps = Object.create(null);
        contextmenu = document.createElement('div');
        contextmenu.className = 'yma-contextmenu';
        const ul = document.createElement('ul');
        ul.className = 'yma-contextmenu__list';

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < list.length; i++) {
            const option = list[i];
            const {label, command, keymap} = option;
            const li = document.createElement('li');
            li.className = `yma-contextmenu__item yma-contextmenu__item-${i}`;

            const key = keymap
                .split('+')
                .map(t => t.trim())
                .map(t => capitalizeFirstLetter(t))
                .join('+');

            const labelSpan = document.createElement('span');
            labelSpan.className = 'yma-contextmenu__label';
            labelSpan.innerText = label;

            const keySpan = document.createElement('span');
            keySpan.className = 'yma-contextmenu__key';
            keySpan.innerText = key;

            li.appendChild(labelSpan);
            li.appendChild(keySpan);

            fragment.appendChild(li);

            delegate(el, 'click', command, `yma-contextmenu__item-${i}`);

            keymaps[keymap.replace(/\s/g, '')] = command;
        }

        ul.appendChild(fragment);
        contextmenu.appendChild(ul);

        el.appendChild(contextmenu);

        const rect = contextmenu.getBoundingClientRect();
        contextmenuWidth = rect.width;
        contextmenuHeight = rect.height;

        document.addEventListener('keydown', function (event) {
            const {ctrlKey, altKey, key} = event;
            const realKey = [ctrlKey ? 'ctrl' : '', altKey ? 'alt' : '', key]
                .filter(v => v)
                .join('+');

            if (isFunction(keymaps[realKey])) {
                keymaps[realKey]();
            }
        });
    }

    function show(e) {
        e.preventDefault();
        e.stopPropagation();

        let x = 0;
        let y = 0;
        const {clientX, clientY} = e;

        const isOverPortWidth = clientX + contextmenuWidth > window.innerWidth;
        const isOverPortHeight =
            clientY + contextmenuHeight > window.innerHeight;

        if (isOverPortWidth) {
            x = clientX - contextmenuWidth;
            y = clientY;
        }

        if (isOverPortHeight) {
            x = clientX;
            y = clientY - contextmenuHeight;
        }

        if (!isOverPortHeight && !isOverPortWidth) {
            x = clientX;
            y = clientY;
        }
        setStyle(contextmenu, {
            top: y + 'px',
            left: x + 'px',
        });
    }

    function hide() {
        setStyle(contextmenu, {
            top: -9999 + 'px',
            left: -9999 + 'px',
        });
    }

    function mounted(el) {
        el.addEventListener('contextmenu', show);
        window.addEventListener('contextmenu', hide, true);
        el.addEventListener('click', hide);
    }

    function unmounted() {
        el.removeEventListener('contextmenu', show);
        window.removeEventListener('contextmenu', hide, true);
    }

    createContextMenu(el, list);

    mounted(el);

    return {
        unmounted,
    };
}

export default bindContextMenu;
