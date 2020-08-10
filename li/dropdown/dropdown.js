import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import { styleMap } from '../../lib/lit-html/directives/style-map.js';

customElements.define('li-dropdown', class LiDropdown extends LiElement {
    static get properties() {
        return {
            component: { type: Object, default: undefined }, 
            opened: { type: Boolean, default: false }, 
            size: { type: Object, default: {} },
            useParent: { type: Boolean, default: false, reflect: true },
            hFactor: { type: Number, default: 1, reflect: true },
            useParentWidth: { type: Boolean, default: false, reflect: true },
            useParentHeight: { type: Boolean, default: false, reflect: true },
            intersect: { type: Boolean, default: false, reflect: true },
            minWidth: { type: Number, default: undefined, reflect: true },
            maxWidth: { type: Number, default: undefined, reflect: true },
            maxHeight: { type: Number, default: undefined, reflect: true }
        }
    }

    connectedCallback() {
        super.connectedCallback();
        LI.listen('okChangedValue', this.ok.bind(this), { target: window, useCapture: true });
        LI.listen('keydown', this._keyDown.bind(this), { target: window, useCapture: true });
        LI.listen('mousedown, resize, wheel', this._close.bind(this), { target: window, useCapture: true });
        this._setSize();
    }
    disconnectedCallback() {
        LI.unlisten('okChangedValue', this.ok.bind(this), { target: window, useCapture: true });
        LI.unlisten('keydown', this._keyDown.bind(this), { target: window, useCapture: true });
        LI.unlisten('mousedown, resize, wheel', this._close.bind(this), { target: window, useCapture: true });
        super.disconnectedCallback();
    }

    show(comp, props = {}) {
        for (let p in props) this[p] = props[p];
        if (comp) {
            this.component = comp;
            this.appendChild(this.component);
        }
        if (!this.parentElement) document.body.appendChild(this);
        this._setSize();
        this.opened = true;
        return new Promise((resolve, reject) => {
            LI.listen('ok', () => resolve(this.component), { target: this });
            LI.listen('close', () => reject(), { target: this });
        })
    }
    close() {
        this.opened = false;
        LI.fire(this, 'close', this.component);
        if (this.parentElement === document.body) document.body.removeChild(this);
    }
    ok() {
        this.opened = false;
        LI.fire(this, 'ok', this.component);
        if (this.parentElement === document.body) document.body.removeChild(this);
    }

    _slotChange(e) {
        const els = e.target.assignedElements();
        if (els.length) {
            setTimeout(() => {
                this.component = els[0];
                this._setSize();
                this.component.style.visibility = 'visible';
            }, 10);
        }
    }
    _setSize(repeat = false) {
        const rect = new LIRect(this.parent);
        if (!this.component || !rect.ok) return;
        requestAnimationFrame(() => {
            let size = {},
                containerSize = this.component.getBoundingClientRect();
            const h = containerSize.height,
                w = containerSize.width,
                l = rect.left,
                t = this.intersect ? rect.top : rect.bottom,
                r = window.innerWidth - rect.left,
                b = window.innerHeight - t;
            
            if (this.useParent && this.parent) {
                let s = this.parent.getBoundingClientRect();
                //size.bottom = s.bottom;
                let f = s.height * (this.hFactor || 1);
                f = f > b ? b : f;
                size.height = size.maxHeight = f;
                size.left = s.left;
                size.right = s.right;
                size.top = s.top;
                size.width = size.maxWidth = s.width;
                Object.keys(size).forEach(k => size[k] += 'px');
                this.size = { ...{}, ...size };
                return;
            }
            
            size.minWidth = this.parent && this.parent.offsetWidth > this.minWidth ? this.parent.offsetWidth : this.minWidth || w;
            if (this.useParentWidth && this.parent) size.width = size.maxWidth = this.parent.offsetWidth;
            else if (this.maxWidth) size.maxWidth = this.maxWidth > size.minWidth ? this.maxWidth : size.minWidth;
            if (this.maxHeight) size.maxHeight = this.maxHeight;
            if (b > h) {
                size.maxHeight = b;
                size.top = t;
            } else {
                if (this.parent) {
                    if (h >= t && b >= t) {
                        size.top = t;
                        size.bottom = 0;
                    } else {
                        size.top = (rect.top - h < 0 ? 0 : rect.top - h);
                        size.maxHeight = rect.top - 4;
                    }
                } else {
                    size.bottom = 0;
                }
            }
            if (r > w) {
                size.left = l;
            } else {
                if (this.parent && this.useParentWidth) {
                    size.left = l;
                } else {
                    size.right = 0;
                }
            }
            Object.keys(size).forEach(k => size[k] += 'px');
            this.size = { ...{}, ...size };
        });
    }
    _keyDown(e) {
        if (e.keyCode === 27) this.close();
        if (e.keyCode === 13) this.ok();
    }
    _close(e) {
        let el = this;
        while (el) {
            if (e.target !== window && el.contains(e.target)) {
                if (e.type === 'resize' && this._offsetHeight !== e.target.offsetHeight) {
                    this._setSize();
                    this._offsetHeight = e.target.offsetHeight;
                }
                return;
            }
            el = el.nextElementSibling;
        }
        this.close();
    }
    
    static get styles() {
        return css`
            div { 
                position: fixed;
                overflow-y: auto;
            }
        `;
    }
    render() {
        return html`
            <div id="dropdown" style=${styleMap({ ...this.size, visibility: this.opened ? 'visible' : 'hidden' })}>
                <slot id="component" name=${this.opened ? '' : '?'} @slotchange="${this._slotChange}"></slot>
            </div>
        `;
    }
});
