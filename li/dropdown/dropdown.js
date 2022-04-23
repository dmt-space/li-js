import { LiElement, html, css, styleMap } from '../../li.js';

customElements.define('li-dropdown', class LiDropdown extends LiElement {
    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: lightgray; } ::-webkit-scrollbar-thumb { background-color: gray; }
            div { 
                position: fixed;
                overflow-y: auto;
                z-index: 99;
                box-sizing: border-box;
            }
            .block {
                display: none;
            }
            .b-show {
                display: block;
                animation: showBlock .2s linear forwards;
                box-shadow: 0 4px 5px 0 rgb(0 0 0 / 14%), 0 1px 10px 0 rgb(0 0 0 / 12%), 0 2px 4px -1px rgb(0 0 0 / 40%);
            }
            @keyframes showBlock {  0% { opacity: 0; } 100% { opacity: 1; } }
            .modal {
                display: none;
                position: fixed;
                z-index: 98;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.4);
            }
        `;
    }
    render() {
        return html`
            <div id="modal" class="modal" @pointerdown="${this.close}"></div>
            <div id="dropdown" class="${this.opened ? 'b-show' : 'block'}" style="${styleMap({ ...this.size })}">
                <header style="width: ${this.headerWidth || '100%'}; box-sizing: border-box; display: ${this.hideHeader ? 'none' : 'flex'}; flex: 1; border: 1px solid gray; background-color: gray; align-items: center; position: sticky; top: 0; z-index: 100; max-height: 30px; color: white;">
                    <span style="padding-left: 4px">${this.label || this.component.localName}</span>
                    <li-button name="close" style="margin-left: auto" @pointerdown="${this.close}" size="22"></li-button>
                </header>
                <slot id="component" name="${this.opened ? '' : '?'}" @slotchange="${this._slotChange}"></slot>
            </div>
        `;
    }

    static get properties() {
        return {
            component: { type: Object, default: undefined },
            opened: { type: Boolean, default: false },
            size: { type: Object, default: {} },
            align: { type: String, default: 'bottom', list: ['bottom', 'top', 'left', 'right'] },
            useParentWidth: { type: Boolean, default: false, reflect: true },
            intersect: { type: Boolean, default: false, reflect: true },
            minWidth: { type: Number, default: undefined, reflect: true },
            minHeight: { type: Number, default: undefined, reflect: true },
            addWidth: { type: Number, default: 0, reflect: true },
            label: { type: String, default: '' },
            hideHeader: { type: Boolean, default: true, reflect: true },
        }
    }

    constructor() {
        super();
        this.__ok = this.ok.bind(this);
        this.__keyup = this._keyup.bind(this);
        this.__close = this._close.bind(this);
    }
    connectedCallback() {
        super.connectedCallback();
        LI.listen(window, 'dropdownDataChange', this.__ok, true);
        LI.listen(window, 'keyup', this.__keyup, true);
        LI.listen(window, 'mousedown, resize, wheel', this.__close, true);
        LI.listen(document, 'ok', (e) => this.ok(e));
        this._setSize();
    }
    disconnectedCallback() {
        LI.unlisten(window, 'dropdownDataChange', this.__ok, true);
        LI.unlisten(window, 'keyup', this.__keyup, true);
        LI.unlisten(window, 'mousedown, resize, wheel', this.__close, true);
        LI.unlisten(document, 'ok', this.ok());
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
            LI.listen(this, 'ok', (e) => resolve({ component: this.component, detail: e.detail.detail }));
            LI.listen(this, 'close', () => reject());
        })
    }
    close() {
        this.opened = false;
        LI.fire(this, 'close', this.component);
        if (this.parentElement === document.body) document.body.removeChild(this);
    }
    ok(e) {
        let el = e?.detail?.target;
        while (el && el.localName !== 'li-dropdown') {
            try {
                el = el.parentElement;
            }
            catch (ev) {
                console.error(ev)
                break;
            }
        }
        if (el?.ulid !== this.ulid) return
        this.opened = false;
        const res = e && e.detail || this.component;
        LI.fire(this, 'ok', { detail: res });
        if (this.parentElement === document.body) document.body.removeChild(this);
        return res;
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
    _setSize() {
        const rect = LIRect(this.parent);
        if (!this.component || !rect.ok) return;
        this.contentRect = this.component.getBoundingClientRect()
        let height = this.contentRect?.height || 0;
        height = height + (this.hideHeader ? 0 : 30)
        let width = this.contentRect?.width || 0;
        this.headerWidth = width;
        let winWidth = window.innerWidth;
        let winHeight = window.innerHeight;
        let top = this.align === 'modal' ? winHeight / 2 - height / 2 : rect.top;
        let left = this.align === 'modal' ? winWidth / 2 - width / 2 : rect.left
        if (!height || !width) return { top: top + 'px', left: left + 'px' };
        let maxHeight = winHeight;
        let maxWidth = winWidth;
        let minHeight = this.minHeight || height;
        let minWidth = this.minWidth || width;
        let right = left + width;
        let bottom = top + height;

        let parentWidth = rect.width;
        if (rect.right > winWidth)
            parentWidth += winWidth - rect.right;
        if (rect.left < 0)
            parentWidth += rect.left;

        let size = {};
        this._steps = this._steps || [];
        this.align = ['left', 'right', 'top', 'bottom', 'modal'].includes(this.align) ? this.align : 'bottom';
        switch (this.align) {
            case 'left': {
                right = this.intersect ? rect.right : rect.left;
                left = right - width;
                if (this.parent) left = left < 0 ? 0 : left;
            } break;
            case 'right': {
                left = this.intersect ? rect.left : rect.right;
                right = left + width;
                if (this.parent && right > winWidth) size.right = 0;
            } break;
            case 'top': {
                bottom = this.intersect ? rect.bottom : rect.top;
                top = bottom - height;
                if (this.parent) {
                    top = top < 0 ? 0 : top;
                    maxHeight = bottom - top;
                    maxHeight = maxHeight < 120 ? 120 : maxHeight;
                }
            } break;
            case 'bottom': {
                top = this.intersect ? rect.top : rect.bottom;
                bottom = top + height;
                if (this.parent) {
                    if (bottom > maxHeight) size.bottom = 0;
                    maxHeight = winHeight - top;
                    maxHeight = maxHeight < 120 ? 120 : maxHeight;
                }
            } break;
        }

        top = top < 0 ? 0 : top;
        left = left < 0 ? 0 : left;
        if (bottom > winHeight) size.bottom = 0
        if (right > winWidth) size.right = 0;
        if (this.useParentWidth) minWidth = maxWidth = parentWidth + this.addWidth;

        maxWidth = maxWidth > winWidth ? winWidth : maxWidth;
        maxHeight = maxHeight > winHeight ? winHeight : maxHeight;
        minWidth = minWidth > maxWidth ? maxWidth : minWidth;
        minHeight = minHeight > maxHeight ? maxHeight : minHeight;

        size = { ...size, ...{ maxWidth, minWidth, minHeight, maxHeight } };
        if (!size.hasOwnProperty('bottom')) size.top = top;
        if (!size.hasOwnProperty('right')) size.left = left;
        Object.keys(size).forEach(k => size[k] += 'px');
        this._steps = [];
        this.size = { ...{}, ...size };
        this.$id('modal').style.display = this.align === 'modal' ? 'block' : 'none';
        return size;
    }
    _keyup(e) {
        if (e.keyCode === 27) this.close();
        if (e.keyCode === 13) this.ok();
    }
    _close(e) {
        if (e.target instanceof Node) {
            let dd = this;
            while (e?.target && dd) {
                try {
                    if (dd.contains?.(e.target))
                        return;
                    dd = dd.nextElementSibling;
                }
                catch (ev) {
                    console.error(ev)
                    break;
                }
            }
        }
        this.close();
    }
})
