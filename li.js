window.globalThis = window.globalThis || window;

// lit: 2.2.1
import { LitElement } from './lib/lit/lit-all.min.js';
export * from './lib/lit/lit-all.min.js';

// lit: 2.2.1
// import { LitElement } from 'https://unpkg.com/lit@2.2.1/index.js?module';
// export * from 'https://unpkg.com/lit@2.2.1/index.js?module';
// export { styleMap } from 'https://unpkg.com/lit@2.2.1/directives/style-map.js?module';
// export { unsafeHTML } from 'https://unpkg.com/lit@2.2.1/directives/unsafe-html.js?module';

// lit-element: 2.5.1, lit-html: 1.4.1
// import { LitElement } from './lib/lit/min/lit-element.js';
// export { css, unsafeCSS } from './lib/lit/min/lit-element.js';
// export { html, svg, classMap, styleMap, unsafeHTML, unsafeSVG } from './lib/lit/min/lit-html.js';

import { ulid, decodeTime, monotonicFactory } from './lib/ulid/ulid.js';
import './lib/icaro/icaro.js';

import './lib/styles/adoptedStyleSheets.js'; // https://github.com/calebdwilliams/construct-style-sheets
import { style } from './lib/styles/styles.js';
// import sheet from './lib/styles/styles.css' assert { type: 'css' };

const urlLI = import.meta.url;

document.addEventListener('mousedown', (e) => LI.mousePos = new DOMRect(e.pageX, e.pageY));
if (!window.LIRect) {
    window.LIRect = function(element) {
        if (element && element.host) element = element.host;
        const pos = element ? element.getBoundingClientRect() : LI.mousePos;
        return pos ? {
            ok: true, x: pos.x, y: pos.y,
            top: pos.top, bottom: pos.bottom, left: pos.left, right: pos.right,
            width: pos.width, height: pos.height
        } : { ok: false };
    }
}

export class LiElement extends LitElement {
    constructor() {
        super();

        this.$properties = this.constructor.elementProperties || this.constructor._classProperties;
        for (const k of this.$properties.keys()) {
            const prop = this.$properties.get(k)
            if (prop?.save) {
                this.__saves = this.__saves || [];
                this.__saves.push(k);
            }
            if (prop?.local) {
                this.__locals = this.__locals || [];
                this.__locals.push(k);
            }
            if (prop?.global) {
                this.__globals = this.__globals || [];
                this.__globals.push(k);
            }
            if (prop?.notify) {
                this.__notifications = this.__notifications || new Map();
                let name = typeof prop.notify !== 'string' ? `${k}-changed` : prop.notify;
                this.__notifications.set(k, name);
            }
            if (prop?.default !== undefined) this[k] = prop.default;
        }

        const name = this.localName.replace('li-', '');
        this.$url = `${urlLI.replace('li.js', '')}li/${name}/${name}.js`;
        this.$ulid = this.$ulid || LI.ulid();
        this.ulid = LI.ulid();
        if (this._useInfo) this.$urlInfo = `${urlLI.replace('li.js', '')}li/${name}/$info/$info.js`;
    }
    connectedCallback() {
        super.connectedCallback();
        this._initBus();
        if (this.$$) {
            this.$$.update.listen(this.fnUpdate);
        }
        if (this.$$ && this.__saves) {
            const obj = JSON.parse(localStorage.getItem(this._saveFileName));
            this.__saves.forEach(i => {
                const v = obj?.[this.localName + '.' + i];
                if (v !== undefined) {
                    if (v != null && v.constructor.name === "Object") {
                        this.$$[i] = this[i] = { ...this[i], ...v };
                    } else {
                        this.$$[i] = this[i] = v;
                    }
                } else {
                    this.$$[i] = this[i];
                }
                this.$$[i]?.listen && this.$$[i].listen(() => this.fnSave(i));
            });
            this.__enableSave = true;
        }
        if (this.$$ && this.__locals) {
            this.$$.listen(this.fnLocals);
            this.__locals.forEach(i => {
                if (this.$$[i] === undefined) this.$$[i] = this[i];
                else this[i] = this.$$[i];
            });

        }
        if (this.$$ && this.__globals) {
            LI.$$.listen(this.fnGlobals);
            this.__globals.forEach(i => {
                if (LI.$$[i] === undefined) LI.$$[i] = this[i];
                else this[i] = LI.$$[i];
            });

        }
        this._partid = this.$partid || this._partid || this.partid;

        if ('adoptedStyleSheets' in Document.prototype) {
            let sheet = new CSSStyleSheet();
            sheet.replaceSync(style.textContent);
            this.shadowRoot.adoptedStyleSheets = [...this.shadowRoot.adoptedStyleSheets, sheet];
        }
    }
    disconnectedCallback() {
        if (this.$$?.update) this.$$.update.unlisten(this.fnUpdate);
        if (this.$$ && this.__locals) this.$$.unlisten(this.fnLocals);
        if (LI.$$ && this.__globals) LI.$$.unlisten(this.fnGlobals);
        super.disconnectedCallback();
    }
    _initBus() {
        if (this.id?.startsWith('$') || this.$partid || this.$properties.get('$partid') || (!this.$$ && (!this.$root || this.$properties.get('_partid') || this.__saves || this.__locals || this.__globals))) {
            this._partid = this.$partid || this._partid || this.id || this.localName;
            this.$partid = this.$properties.get('$partid') ? this._partid : this.$partid;
            if (this.$$?.update) this.$$.update.unlisten(this.fnUpdate);
            LI._$$[this._partid] ||= { _$: this, _$$: icaro({ update: icaro({ value: 0 }) }) };
        }
    }

    fnUpdate = (e) => { this.requestUpdate() }
    fnLocals = (e) => { if (this.__locals) this.__locals.forEach(i => { if (e.has(i)) this[i] = e.get(i) }) }
    fnGlobals = (e) => { if (this.__globals) this.__globals.forEach(i => { if (e.has(i)) this[i] = e.get(i) }) }
    fnSave = (prop) => {
        let obj = JSON.parse(localStorage.getItem(this._saveFileName));
        obj = obj || {};
        obj[this.localName + '.' + prop] = this[prop];
        localStorage.setItem(this._saveFileName, JSON.stringify(obj));
    }

    get partid() { return this._PARTID || this.$partid || this.$root?.partid || this._partid || undefined }
    get $$() { return LI._$$?.[this.partid]?.['_$$'] ? LI._$$[this.partid]['_$$'] : undefined }
    get $() { return LI._$$?.[this.partid]?.['_$'] ? LI._$$[this.partid]['_$'] : undefined }
    get $root() {
        try {
            return this.getRootNode().host;
        } catch (err) { }
    }
    get _saveFileName() { return ((this.id || this.partid || this.localName.replace('li-', '')) + '.saves') }
    // $(v) { return this.$$[v].value }
    $id(id) {
        if (!id) return Array.from(this.renderRoot.querySelectorAll('[id]'));
        return this.renderRoot.getElementById(id);
    }
    $refs(ref) {
        const refs = Array.from(this.renderRoot.querySelectorAll('[ref]'));
        if (!ref) return refs;
        let node = undefined;
        if (refs?.length) refs.forEach(i => {
            let _ref = i.getAttribute('ref');
            if (_ref === ref) node = node || i;
        })
        return node;
    }
    $qs(path) {
        return this.renderRoot.querySelector(path);
    }
    $qsa(path) {
        return Array.from(this.renderRoot.querySelectorAll(path));
    }

    firstUpdated() {
        super.firstUpdated();
        if (this.args) Object.keys(this.args).forEach(k => this[k] = this.args[k]);
        this.__isFirstUpdated = true;
    }

    update(changedProps) {
        super.update(changedProps);
        if (!changedProps) return;
        if (changedProps.has('_partid')) {
            this._initBus();
            this.$$.update.listen(this.fnUpdate);
        }
        if (this.args && changedProps.has('args')) Object.keys(this.args).forEach(k => this[k] = this.args[k]);
        for (const prop of changedProps.keys()) {
            if (this.__enableSave && this.__saves && this.__saves.includes(prop)) {
                this.fnSave(prop);
            }
            if (this.__isFirstUpdated) {
                if (this.$$ && this.__locals && this.__locals.includes(prop)) this.$$[prop] = this[prop];
                if (this.$$ && this.__globals && this.__globals.includes(prop)) LI.$$[prop] = this[prop];
            }
            if (this.__notifications && this.__notifications.has(prop)) {
                const event = this.__notifications.get(prop);
                this.fire(event, { value: this[prop] });
            }
        }
    }

    $update(property, value) { LI.$update.call(this, property, value) }
    $listen(event, fn) {
        if (!event) return;
        LI.$$[event] = LI.$$[event] || icaro({ count: 0 });
        LI.$$[event].listen(fn || this.fnListen);
    }
    $unlisten(event, fn) {
        if (!event || !LI.$$[event]) return;
        LI.$$[event].unlisten(fn || this.fnListen);
        LI.$$[event] = undefined;
    }
    $fire(event, value) {
        if (!event) return;
        LI.$$[event] = LI.$$[event] || icaro({ count: 0 });
        LI.$$[event].value = value;
        ++LI.$$[event].count;
    }

    fnListen = (e) => console.log('...fire ', this.localName, e?.type, e?.detail);
    listen(event, callback, options) { if (event) event.split(',').forEach(i => this.addEventListener(i.trim(), callback || this.fnListen, options)) }
    unlisten(event, callback, options) { if (event) event.split(',').forEach(i => this.removeEventListener(i.trim(), callback || this.fnListen, options)) }
    fire(event, detail = {}) { if (event) requestAnimationFrame(() => this.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true, detail }))) }
}

const __$$ = { _$$: {}, $$: {} };
__$$.$$ = icaro({});
__$$.$$.update = icaro({ value: 0 });
const _$temp = {};
_$temp.throttles = new Map();
_$temp.debounces = new Map();
class CLI {
    constructor() {
        this.ulid = ulid;
        this.ulidm = monotonicFactory();
        this.icaro = icaro;
        this.$url = urlLI;
    }
    get _$$() { return __$$._$$; }
    get $$() { return __$$.$$; }
    $update(property, value) {
        if (!this.$$) {
            this.requestUpdate();
            return;
        }
        if (!property && this.$$.update) ++this.$$.update.value;
        else if (this.$$[property]) this.$$[property]['value'] = value;
    }

    async createComponent(comp, props = {}) {
        comp = comp || {};
        if (typeof comp === 'string') {
            comp = comp.replace('li-', '');
            let url = `${urlLI.replace('li.js', '')}li` + (comp.includes('.') ? comp : `/${comp}/${comp}.js`);
            await import(url);
            const cmp = document.createElement(`li-${comp}`);
            for (let p in props) cmp[p] = props[p];
            return cmp;
        }
        for (let p in props) comp[p] = props[p];
        return comp;
    }
    async show(host, comp, compProps = {}, hostProps = {}) {
        host = await this.createComponent(host, hostProps);
        comp = await this.createComponent(comp, compProps);
        if (hostProps.data && hostProps.data.host) hostProps.data.host.push(host);
        return host.show(comp);
    }

    listen(target, event, callback, options) { if (target && event && callback) event.split(',').forEach(i => target.addEventListener(i.trim(), callback, options)) }
    unlisten(target, event, callback, options) { if (target && event && callback) event.split(',').forEach(i => target.removeEventListener(i.trim(), callback, options)) }
    fire(target, event, detail = {}) { if (target && event) target.dispatchEvent(new CustomEvent(event, { detail })) }

    throttle(key, func, delay = 0, immediate = false) {
        let pending = _$temp.throttles.get(key);
        if (pending) return;
        if (immediate) func();
        pending = setTimeout(() => {
            _$temp.throttles.delete(key);
            if (!immediate) func();
        }, delay);
        _$temp.throttles.set(key, pending);
    }
    debounce(key, func, delay = 0, immediate = false) {
        let pending = _$temp.debounces.get(key);
        if (pending) clearTimeout(pending);
        if (!pending && immediate) func();
        pending = setTimeout(() => {
            _$temp.debounces.delete(key);
            func();
        }, delay);
        _$temp.debounces.set(key, pending)
    }

    dates(d = new Date(), isShort) {
        const utc = d.toISOString();
        const local = new Date(d.getTime() - (d.getTimezoneOffset()) * 60 * 1000).toISOString().slice(0, -5).replace('T', ' ');
        const short = local.split(' ')[0];
        const monthStr = short.slice(0, -3);
        if (isShort) return { utc, local };
        return { utc, local, short, monthStr };
    }
    ulidToDateTime(ulid) {
        return new Date(decodeTime(ulid));
    }
    isPlainObject = (v) => !!v && typeof v === 'object' && (v.__proto__ === null || v.__proto__ === Object.prototype);
    isString = (v) => Object.prototype.toString.call(v) === '[object String]';
    sortBy = (arr, k) => arr.concat().sort((a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0));
    MS_DAY = 1000 * 60 * 60 * 24; // ms in day
}
globalThis.LI = new CLI();

Object.defineProperty(Array.prototype, 'has', { enumerable: false, value: Array.prototype.includes })
Object.defineProperty(Array.prototype, 'clear', { enumerable: false, value: function() { this.splice(0) } })
Object.defineProperty(Array.prototype, 'first', { enumerable: false, get() { return this[0] } })
Object.defineProperty(Array.prototype, 'last', { enumerable: false, get() { return this[this.length - 1] } })
Object.defineProperty(Array.prototype, 'add', { enumerable: false, value: function(...item) { for (let i of item) { if (this.includes(i)) continue; this.push(i) } } })
Object.defineProperty(Array.prototype, 'remove', { enumerable: false, value: function(...items) { for (const item of items) { const idx = this.indexOf(item); if (idx < 0) continue; this.splice(idx, 1) } } })
