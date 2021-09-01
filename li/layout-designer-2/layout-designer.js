import { LiElement, html, css } from '../../li.js';

import '../layout-app/layout-app.js'
import '../button/button.js';
import '../checkbox/checkbox.js';

customElements.define('li-layout-designer', class LiLayoutDesigner extends LiElement {
    render() {
        return html`
            <li-layout-app id="layout.layout-app">
                <div slot="app-top">li-layout-designer</div>
                <div slot="app-top-right">
                    ${this.designMode
                ? html`
                        <li-button width="100" @click=${this._clearView}>Clear view</li-button>
                        <li-button width="100" @click=${this._loadActions}>Load actions</li-button>
                        <li-button width="100" @click=${this._saveActions}>Save actions</li-button>
                        <li-button width="100" @click=${this._clearActions}>Clear actions</li-button>
                    ` : html``}
                        <li-button name="settings" toggledClass="ontoggled" style="margin-right: 4px;" .toggled="${this.designMode}" @click="${() => this.designMode = this.$$.designMode = !this.designMode}"></li-button>
                    </div>
                <div slot="app-left">
                    <li-layout-designer-structure .layout=${this.layout} style="overflow: auto" .itree=${this.itree}></li-layout-designer-structure>
                </div>
                <div slot="app-main">
                    <li-layout-designer-structure .layout=${this.layout} style="overflow: auto"></li-layout-designer-structure>
                </div>
                <div slot="app-right">
                    <div>right panel...</div>
                </div>
            </li-layout-app>
        `;
    }

    static get properties() {
        return {
            keys: { type: String, default: 'items' },
            designMode: { type: Boolean, default: true, local: true },
            itree: { type: Boolean, default: true },
            id: { type: String, default: '' },
            data: { type: Object, default: {} },
            layout: { type: Object, default: {} }
        }
    }
    get inspectedObject() { return this.layout?.root?.focused }
    get localStorageName() { return (this.id || 'layot-designer') + '-actions' }
    connectedCallback() {
        super.connectedCallback();
        this.__keyDown = this._keyDown.bind(this);
        document.addEventListener('keydown', this.__keyDown);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('keydown', this.__keyDown);
    }
    updated(e) {
        super.update(e);
        if (e.has('data')) {
            this.layout = new Layout(this.data, this.keys, this.root);
        }
    }

    _keyDown(e) {
        if (this.designMode && e.code === 'KeyA' && (e.metaKey || e.ctrlKey)) {
            if (this.layout?.root?.focused) {
                this.layout.root.selection = [];
                (this.layout.root.focused?.owner.items || []).forEach(i => this.layout.root.selection.add(i));
                this.$update();
            }
        }
    }
    _loadActions() {
        this.layout = new Layout(this.data, this.keys, this.root);
        let actions = localStorage.getItem(this.localStorageName);
        actions = this.layout.root.actions = actions ? JSON.parse(actions) : {};
        actions?.actions?.forEach(i => execute(i, this.layout))
        actions?.expanded?.forEach(i => findById(this.layout, i).expanded = true);
        actions?.checked?.forEach(i => findById(this.layout, i).checked = false);
    }
    _saveActions() {
        if (this.designMode) {
            if (!confirm('Rewrite actions ?')) return;
            this.layout.root.actions.expanded = getAllProps(this.layout, 'expanded', true);
            this.layout.root.actions.checked = getAllProps(this.layout, 'checked', false);
            localStorage.setItem(this.localStorageName, JSON.stringify(this.layout.root.actions));
        }
    }
    _clearActions() {
        if (!confirm('Clear actions ?')) return;
        localStorage.removeItem(this.localStorageName);
    }
    _clearView() {
        this.layout = new Layout(this.data, this.keys, this.root);
    }
});

customElements.define('li-layout-designer-structure', class LiLayoutStructure extends LiElement {
    render() {
        return html`
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    cursor: ${this.designMode && !this.itree ? 'pointer' : 'unset'};
                    outline: 1px dotted lightgray;
                }
            </style>
            ${this.layout?.items?.map(item => html`
                <li-layout-designer-container .layout=${item} .itree=${this.itree}></li-layout-designer-container>
            `)}
        `;
    }

    static get properties() {
        return {
            designMode: { type: Boolean, local: true },
            itree: { type: Boolean },
            layout: { type: Object },
        }
    }
});

customElements.define('li-layout-designer-container', class LiLayoutContainer extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                box-shadow: -1px -1px 0 0 lightgray;
                position: relative;
                flex: 1;
            }
            .focused { box-shadow: 0 1px 0 0 blue; }
            .active { background-color: lightyellow; }
            .structure {
                margin-left: 18px;
                overflow: hidden;
            }
            .drag-to:after {
                text-align: center;
                content: attr(capture);
                pointer-events: none;
                position: absolute;
                left: 0;
                top: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0,255,0,.25);
            }
            .drag-to-error:after {
                content: "not allow drop";
                pointer-events: none;
                background-color: rgba(255,0,0,.25) !important;
            }
            .drag-to-left:after { box-shadow: inset 2px 0 0 0 var(--success-color, green); }
            .drag-to-right:after { box-shadow: inset -3px 0 0 0 var(--success-color, green); }
            .drag-to-top:after { box-shadow: inset 0 2px 0 0 var(--success-color, green); }
            .drag-to-bottom:after { box-shadow: inset 0 -3px 0 0 var(--success-color, green); }
            .horizontal { display: flex; }
        `;
    }
    render() {
        return html`
            <style>
                .block {
                    flex-direction: ${this.layout.block};
                    flex: ${this.layout.block === 'row' ? 1 : 0};
                }
            </style>
            ${this.show ? html`
                <div class="row horizontal ${this.dragClass} ${this.focused} ${this.active}" draggable=${this.draggable} capture=${this.capture} style="align-items: center; min-height: 36px" @click=${this._pointerdown}>
                    ${this.hasChildren ? html`
                        <li-button name="chevron-right" toggledClass="right90" .toggled="${this.layout.expanded}" size="18" back="transparent" border=0 @click=${this._toggleExpand}></li-button>
                    ` : html``}
                    ${this.itree ? html`
                        <li-checkbox .toggled=${this.layout.checked} @click=${this._toggleChecked} style="cursor: ${this.designMode ? 'pointer' : 'unset'}; padding-left: ${this.hasChildren ? 0 : '20px'}"></li-checkbox>
                    ` : html`
                        <div style="padding-left: ${this.hasChildren ? 0 : '20px'}"></div>
                    `}
                    <div style="padding-left: 2px">${this.layout?.label}</div>
                </div>
            ` : html``}
            ${this.hasChildren && this.layout.expanded ? html`
                <li-layout-designer-structure class="${this.strClass}" .layout=${this.layout} .itree=${this.itree}></li-layout-designer-structure>
            ` : html``}
        `
    }

    static get properties() {
        return {
            designMode: { type: Boolean, local: true },
            itree: { type: Boolean },
            layout: { type: Object, default: undefined },
            dragTo: { type: String, default: '' },
            capture: { type: String, default: '' },
        }
    }

    get icon() { return this.hasChildren ? (this.layout?.expanded ? 'remove' : 'add') : '' }
    get hasChildren() { return this.layout?.items?.length }
    get focused() { return this.layout?.root?.focused === this.layout ? 'focused' : null }
    get active() { return this.layout?.root?.selection?.includes(this.layout) ? 'active' : null }
    get draggable() { return this.designMode && !this.itree ? 'true' : 'false' }
    get show() { return this.itree || (!this.itree && this.layout.checked && this.layout.owner.checked && !this.layout.block) }
    get strClass() { return this.itree || !this.layout.block ? 'structure' : 'block' }
    get dragClass() { return `${this.dragTo ? 'drag-to' : ''} ${[this.dragTo]}`}

    firstUpdated() {
        super.firstUpdated();
        this.listen('dragstart', this._dragstart);
        this.listen('dragover', this._dragover);
        this.listen('dragleave', this._dragleave);
        this.listen('dragend', this._dragend);
        this.listen('drop', this._drop);
    }

    _toggleExpand(e) {
        this.layout.expanded = e.target.toggled;
        this.$update();
    }
    _toggleChecked(e) {
        if (!this.designMode) return;
        this.layout.checked = e.target.toggled;
        setChildrenProps(this.layout, 'checked', this.layout.checked);
        this.$update();
    }
    _dragstart(e) {
        if (this.itree || !this.designMode) return;
        e.stopPropagation();
        if (this.layout.root.selection.length > 1 && !this.layout.root.selection.has(this.layout))
            this.layout.root.selection = [];
        this.layout.root.dragLayout = this.layout;
        e.dataTransfer.setDragImage(this.layout.root.selection.length > 1 ? dragImage3 : dragImage, -20, 7);
    }
    _dragover(e) {
        if (this.itree || !this.designMode) return;
        e.stopPropagation();
        this.dragTo = 'drag-to-error';
        if (this.layout.$owner !== this.layout.root.dragLayout.$owner
            || this.layout === this.layout.root.dragLayout
            || this.layout.root.selection.includes(this.layout)
        ) return;
        e.preventDefault();
        let x = e.layerX, y = e.layerY, w = e.target.offsetWidth, h = e.target.offsetHeight;
        x = (x - w / 2) / w * 2;
        y = (y - h / 2) / h * 2;
        let to = (Math.abs(x) > Math.abs(y)) ? (x < 0 ? 'left' : 'right') : (y < 0 ? 'top' : 'bottom');
        this.dragTo = 'drag-to-' + to;
        this.layout.root.to = to;
        let capt = this.layout.root.selection.length > 1 ? 'multiple rows' : 'row:' + this.layout.root.dragLayout.data?.name;
        this.capture = `${capt} to row:${this.layout.data.name} - ${to}`;
    }
    _dragleave(e) { this.dragTo = '' }
    _dragend(e) { this.dragTo = '' }
    _drop(e) {
        e.stopPropagation();
        this.dragTo = '';
        execute({ type: 'move', to: this.layout.root.to, drag: this.layout.root.dragLayout, target: this.layout }, this.layout.root.layout);
        this.$update();
    }
    _pointerdown(e) {
        if (!this.designMode) {
            this.layout.root.focused = this.layout;
            return;
        }
        const _selection = [...[], ...(this.layout.root.selection || [])];
        this.layout.root.selection = [];
        if (e.metaKey || e.ctrlKey) {
            if (_selection.has(this.layout)) _selection.remove(this.layout);
            else if (!_selection.length || _selection[0].$owner === this.layout.$owner) {
                _selection.add(this.layout);
            }
            this.layout.root.selection = _selection;
        } else if (e.shiftKey) {
            if (!this.layout.root.focused || !_selection.length || this.layout.root.focused.$owner !== this.layout.$owner) {
                this.layout.root.focused = this.layout;
                this.layout.root.selection.add(this.layout);
            } else {
                this.layout.root.selection = [];
                let idx = this.layout.owner.items.indexOf(this.layout),
                    idxf = this.layout.owner.items.indexOf(this.layout.root.focused),
                    start = Math.min(idxf, idx),
                    end = Math.max(idxf, idx);
                for (let i = start; i <= end; i++) this.layout.root.selection.add(this.layout.owner.items[i]);
            }
        } else
            this.layout.root.focused = this.layout;
            this.$update();
    }
});

class Layout {
    constructor(data, key, root, owner) {
        this.data = data || {};
        this.key = key || 'items';
        this.root = root || { selection: [], actions: { actions: [], expanded: [], checked: [] }, focused: {} };
        this.root.data = this.root.data || data;
        this.root.layout = this.root.layout || this;
        this.$owner = owner || this;
        this.owner = owner || this;
    }
    root = {};
    expanded = false;
    checked = true;
    block = '';
    get items() { 
        this._items = this._items || this.data?.[this.key]?.map(i => new Layout(i, this.key, this.root, this));
        return this._items;
    }
    get id() { return this._id || this.data.id || this.data.name }
    set id(v) { this._id = v }
    get label() { return this._label || this.data.label || this.data.name || this.id }
    set label(v) { this._label = v }
}

const getUUID = function b(a) { return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b) };
const dragImage = new Image();
dragImage.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAQCAYAAABQrvyxAAAACXBIWXMAAAsSAAALEgHS3X78AAAAa0lEQVRIiWPU6v91RFv4jwIv+78/DEMIfP7JxHL1LcsDFpDjJ7p8kB5KjoeB/D0CDExDLeSRAcjtTIPHOeSBUQ8MNBj1wECDUQ8MNBj1wECDUQ8MNGACteqGquNBbgc3SUGtuiHZnH7L8gAAtichl6hs6rYAAAAASUVORK5CYII=`;
const dragImage3 = new Image();
dragImage3.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAAUCAYAAADC1B7dAAAACXBIWXMAAAsSAAALEgHS3X78AAAA4klEQVRYhWPU6v91RFv4jwIv+78/DEMIfP7JxHL1LcuDqwWsNsiuZgF5ZqLLB+mh5BkYyN8jwMDAwIoixjTUYgYZ8LL/Ew9b/P2J9oTfR2DCTIPCZWQCQfb/LKDUBUplMBNYhponsAFYTIHy1JCOIRhAjqlh4SEYAJUHw8pDDEO9UMAGRj002MGohwY7GH4eArVaB4E7yAIffzFiaAM3wUGtVlDzAVTjDgmfQD3z6SdmAmOB9CdYGUBtoRbbodmNQI4peIwMl5hi/P//P4oCUEwN4Q7fU4yYQIqpodclf8vyAAC+a17T0iNSKwAAAABJRU5ErkJggg==`;

function findById(item, id) {
    let items = item?.items;
    if (!items?.length) return;
    return items.reduce((res, i) => {
        if (i.id + '' === id + '') res = i;
        return res || findById(i, id);
    }, undefined);
}
function clearEmptyBlocks(item) {
    let items = item?.items;
    if (!items) return;
    items.map(i => {
        if (i.block && i.items?.length === 0) {
            i.owner.items.splice(i.owner.items.indexOf(i), 1);
            clearEmptyBlocks(item);
        }
        clearEmptyBlocks(i);
    })
    items.map(i => { if (i.block && i.items?.length === 0) i.owner.items.splice(i.owner.items.indexOf(i), 1) });
    return;
}
const setChildrenProps = (item, prop, value) => {
    item[prop] = value;
    (item.items || []).forEach(i => setChildrenProps(i, prop, value));
}
const getAllProps = (item, prop, value, arr = []) => {
    (item.items || []).forEach(i => {
        if (i[prop] === value) arr.add(i.id);
        getAllProps(i, prop, value, arr)
        return arr;
    });
    return arr;
}
const execute = (action, layout) => {
    if (!action) return;
    if (action.drag && !(action.drag instanceof Layout)) action.drag = findById(layout, action.drag);
    if (action.target && !(action.target instanceof Layout)) action.target = findById(layout, action.target);
    if (action.selection?.length) {
        let _selection = [];
        action.selection.forEach(i => {
            let item = findById(i, action.target);
            if (item) _selection.push(item);
        })
        action.selection = _selection;
    }
    const fn = { move };
    if (fn[action.type]) fn[action.type](action);
    clearEmptyBlocks(layout);
    if (action.drag) action.drag = action.drag.id;
    if (action.target) action.target = action.target.id;
    if (layout.root.selection?.length) action.selection = layout.root.selection.map(i => i.id);
    layout.root.actions.actions = layout.root.actions.actions || [];
    layout.root.actions.actions.push(action);
}
const move = (action) => {
    const drag = action.drag,
        target = action.target,
        owner = target.owner;
    if (!drag || !target || drag.$owner !== target.$owner) return;
    const selection = action.selection || target.root.selection?.length ? [...[], ...drag.root.selection] : [drag];
    selection.forEach(i => i.owner.items.splice(i.owner.items.indexOf(i), 1));
    const idxt = owner.items.indexOf(target);
    owner.items.splice(idxt, 1);
    if (action.to === 'bottom' || action.to === 'right') selection.unshift(target);
    else selection.push(target);
    if (
        (action.to === 'top' || action.to === 'bottom') && owner?.block !== 'column'
        || (action.to === 'left' || action.to === 'right') && owner?.block !== 'row'
    ) {
        const layout = new Layout('', '', drag.root);
        layout.owner = owner;
        layout.block = (action.to === 'top' || action.to === 'bottom') ? 'column' : 'row';
        layout.label = (action.to === 'top' || action.to === 'bottom') ? 'block (v)' : 'block (h)';
        layout.id = action.id || getUUID();
        action.id = layout.id;
        layout.expanded = true;
        selection.forEach(i => i.owner = layout);
        layout._items = selection;
        owner.items.splice(idxt, 0, layout);
    } else {
        selection.forEach((i, idx) => {
            i.owner = owner;
            owner.items.splice(idxt + idx, 0, i);
        })
    }
}
