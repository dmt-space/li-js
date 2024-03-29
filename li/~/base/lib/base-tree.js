import { LiElement, html, css } from '../../../../li.js';

import '../../../button/button.js';
import '../../../checkbox/checkbox.js';

customElements.define('li-base-tree', class LiBaseTree extends LiElement {
    static get properties() {
        return {
            id: { type: String, default: '' },
            item: { type: Object, default: {} },
            iconSize: { type: Number, default: 24 },
            margin: { type: Number, default: 0 },
            colorBorder: { type: String, default: 'lightgray' },
            labelWidth: { type: Number, default: 128 },
            complex: { type: String, default: 'tree' },
            complexExt: { type: String, default: 'tree-line' },
            view: { type: String, default: '' },
            allowCheck: { type: Boolean, default: true },
            noCheckChildren: { type: Boolean, default: false },
            selectedRow: { type: Object, default: {}, global: true },
            fontSize: { type: String, default: 'medium' },
            allowEdit: { type: Boolean, default: true },
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
                <div draggable="true" @dragstart="${(e) => this._dragStart(e, i)}" @dragover=${(e) => this._dragOver(e, i)} @drop=${(e) => this._drop(e, i)}
                    class="row ${this.selectedRow === i || this.selectedRow?.ulid === i.ulid ? 'selected' : ''}">
                    <div style="display:flex;align-items:center;margin-left:${this.margin}px;${!this.fullBorder ? 'border-bottom: 1px solid ' + this.colorBorder : ''}"
                            @contextmenu=${e => { this._contextmenu(e, i) }}>
                        ${i.items?.length || i.doc?.items?.length ? html`
                            <li-button back="transparent" name="chevron-right" border="0" toggledClass="right90" ?toggled="${i.expanded}"
                                    @click="${(e) => this._click(e, i)}" size="${this.iconSize}"></li-button>
                        ` : html`
                            <div style="min-width:${this.iconSize + 2}px;width:${this.iconSize + 2}px;min-height:${this.iconSize + 2}px;height:${this.iconSize + 2}px"></div>
                        `}
                        ${this.allowCheck ? html`
                            <li-checkbox .size="${this.iconSize}" .item="${i}" @click="${(e) => this._checkChildren(e, i)}" @blur="${() => this._ed = false}"></li-checkbox>
                        ` : html``}
                        ${this._ed && (this.selectedRow === i || this.selectedRow?.ulid === i.ulid) && !i._deleted ? html`
                            <input value="${i.label}" @change="${(e) => this._setLabel(e, i)}" 
                                style="background-color: transparent; color: gray; flex:1;padding:1px;width:${this.labelWidth}px;font-size:${this.fontSize};border: none;margin:1px;outline: none;"
                            />
                        ` : html`
                            <div style="flex:1;padding:2px;width:${this.labelWidth}px;font-size:${this.fontSize}; text-decoration:${i._deleted ? 'line-through 2px solid red !important' : ''}"
                                @dblclick="${() => this._ed = true}" @click="${(e) => this._focus(e, i)}">${i.label}</div>
                        `}
                    </div>
                </div>
                <div class="complex ${this.complex} ${this.complexExt}">
                    ${i.expanded && i.items?.length ? html`
                        <li-base-tree .item="${i.items}" .margin="${this.margin}" .id="${this.id}" ?allowEdit="${this.allowEdit}" ?allowCheck="${this.allowCheck}" .iconSize="${this.iconSize}" .selected="${this.selectedRow}"></li-base-tree>
                    ` : html``}
                </div>
            `)}
        `
    }
    _setLabel(e, i) {
        if (this._ed) {
            this.selectedRow.label = e.target.value;
            this._ed = false;
            this.fire('setlabel', e.target.value);
            //this.fire('changed', { type: 'setlabel', value: e.target.value, item: i  });
            this.$update();
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
        this.fire('selectedBaseTreeRow', i);
        this.$update();
    }
    _focus(e, i) {
        this.selectedRow = i;
        this.fire('selectedBaseTreeRow', i);
        this.$update();
    }
    _dragStart(e, i) {
        this._dragRow = i;
    }
    _dragOver(e, i) {
        if (i.localDB.name !== this._dragRow.localDB.name) return;
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
        i.items ||= [];
        i.items.splice(i.items.length, 0, this._dragRow);
        this._dragRow.doc.parent = i._id;
        this._dragRow.parent = i;
        i.expanded = true;
        this._dragRow = undefined;
        this.$update();
    }
    _contextmenu(e, i) {
        e.preventDefault();
        //this._focus(e, i);
        LI.show('dropdown', 'db-cell-list', {
            list: [
                { group: 'setView', label: 'set view' },
                { icon: 'content-paste', label: 'source', action: 'source', hideIcons: '23' },
                { icon: 'content-paste', label: 'props', action: 'props', hideIcons: '23' },
                { icon: 'content-paste', label: 'table', action: 'table', hideIcons: '23' },
                
            ],
            width: '200px'
        }, {}).then(result => {
            if (result.detail.action)
                this.fire('dbAction', { action: result.detail.action, label: result.detail.value, liitem: i, result });
        }).catch(err => { });
    }
});
