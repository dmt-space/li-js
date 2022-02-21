import { LiElement, html, css } from '../../li.js';

import '../button/button.js';
import '../checkbox/checkbox.js';

customElements.define('li-layout-tree', class LiLayoutTree extends LiElement {
    static get properties() {
        return {
            readOnly: { type: Boolean, local: true },
            id: { type: String, default: '' },
            item: { type: Object, default: {} },
            iconSize: { type: Number, default: 28 },
            margin: { type: Number, default: 0 },
            colorBorder: { type: String, default: 'lightgray' },
            labelWidth: { type: Number, default: 128 },
            complex: { type: String, default: 'tree' },
            complexExt: { type: String, default: 'tree-line' },
            view: { type: String, default: '' },
            allowCheck: { type: Boolean, default: false },
            noCheckChildren: { type: Boolean, default: false },
            selected: { type: Object },
            fontSize: { type: String, default: 'medium' },
            allowEdit: { type: Boolean, default: false },
            _dragRow: { type: Object, local: true }
        }
    }

    get items() {
        return this.item && this.item.map ? this.item : this.item && this.item.items && this.item.items.map ? this.item.items : undefined;
    }
    get _ed() {
        return this.allowEdit && this._allowEdit;
    }
    set _ed(v) {
        this._allowEdit = v;
    }
    static get styles() {
        return css`
            :host {
                color: #707070;
            }
            .complex {
                overflow: hidden;
            }
            .tree {
                margin-left: 14px;
            }
            .tree-line {
                border-left: 1px dashed lightgray;
            }
            .row:not(.selected):hover {
                box-shadow: inset 0 -2px 0 0 black;
                cursor: pointer;
            }
            .selected {
                background-color: lightyellow;
                box-shadow: inset 0 -2px 0 0 blue;
            }
            [contentEditable] {
                outline: 0px solid transparent
            }
        `;
    }

    render() {
        return html`
            ${!this.items ? html`` : this.items.map(i => html`
                <div draggable=${!this.readOnly} @dragstart="${(e) => this._dragStart(e, i)}" @dragover=${(e) => this._dragOver(e, i)} @drop=${(e) => this._drop(e, i)}
                    class="row ${this.selected && (this.selected === i || this.selected?.ulid === i.ulid) ? 'selected' : ''}">
                    <div style="display:flex;align-items:center;margin-left:${this.margin}px;${!this.fullBorder ? 'border-bottom: 1px solid ' + this.colorBorder : ''}">
                        ${i.items && i.items.length ? html`
                            <li-button back="transparent" name="chevron-right" border="0" toggledClass="right90" ?toggled="${i.expanded}"
                                    @click="${(e) => this._click(e, i)}" size="${this.iconSize}"></li-button>
                        ` : html`
                            <div style="min-width:${this.iconSize + 2}px;width:${this.iconSize + 2}px;min-height:${this.iconSize + 2}px;height:${this.iconSize + 2}px"></div>
                        `}
                        ${this.allowCheck ? html`
                            <li-checkbox .size="${this.iconSize}" .item="${i}" @click="${(e) => this._checkChildren(e, i)}" @blur="${() => this._ed = false}"></li-checkbox>
                        ` : html``}
                        ${this._ed && (this.selected && (this.selected === i || this.selected?.ulid === i.ulid)) && !i._deleted ? html`
                            <input value="${i.label}" @change="${(e) => this._setLabel(e, i)}" style="color: gray; flex:1;padding:1px;width:${this.labelWidth}px;font-size:${this.fontSize};border: none;margin:1px;outline: none;"/>
                        ` : html`
                            <div style="flex:1;padding:2px;width:${this.labelWidth}px;font-size:${this.fontSize}; text-decoration:${i._deleted ? 'line-through solid red !important' : ''}"
                                @dblclick="${() => this._ed = !this.readOnly}" @click="${(e) => this._focus(e, i)}">${i.label}</div>
                        `}
                    </div>
                </div>
                <div class="complex ${this.complex} ${this.complexExt}">
                    ${i.items && i.items.length && i.expanded ? html`
                        <li-layout-tree .item="${i.items}" .margin="${this.margin}" .id="${this.id}" ?allowEdit="${this.allowEdit}" ?allowCheck="${this.allowCheck}" .iconSize="${this.iconSize}" .selected="${this.selected}"></li-layout-tree>
                    ` : html``}
                </div>
            `)}
        `
    }
    _setLabel(e, i) {
        if (this._ed) {
            this.selected.label = e.target.value;
            this._ed = false;
            this.fire('setlabel', e.target.value);
            this.$update();
            this.fire('changed', { type: 'setTreeLabel', value: e.target.value, item: i  });
        }
    }
    _checkChildren(e, i) {
        if (!this.noCheckChildren) LIUtils.arrSetItems(i, 'checked', e.target.toggled);
        //this.fire('changed', { type: 'checked', value: e.target.toggled, item: i });
        this.$update();
    }
    _click(e, i) {
        i.expanded = e.target.toggled;
        //this.fire('changed', { type: 'expanded', value: e.target.toggled, item: i });
        this.$update();
    }
    _focus(e, i) {
        this.selected = i;
        this.fire('selected', i);
        this.$update();
    }
    _dragStart(e, i) {
        this._dragRow = i;
    }
    _dragOver(e, i) {
        let enableDrag = true;
        let ulid = this._dragRow.ulid;
        let root = i;
        while (root) {
            if (root.ulid === ulid) enableDrag = false;
            root = root.parent || undefined;
        }
        if (enableDrag) {
            e.preventDefault();
        }
    }
    _drop(e, i) {
        this._dragRow.parent.items.splice(this._dragRow.parent.items.indexOf(this._dragRow), 1);
        i.items.splice(i.items.length, 0, this._dragRow);
        this._dragRow.parentId = i._id;
        this._dragRow.parent = i;
        i.expanded = true;
        this.$update();
        this.fire('changed', { type: 'moveTreeItem', value: e.target.value, item: this._dragRow });
        this._dragRow = undefined;
    }
});
