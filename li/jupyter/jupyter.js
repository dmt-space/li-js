import { LiElement, html, css } from '../../li.js';

import '../button/button.js';
import '../dropdown/dropdown.js';
import '../editor-html/editor-html.js';
import '../editor-ace/editor-ace.js';
import '../viewer-md/viewer-md.js';
import '../splitter/splitter.js';

customElements.define('li-jupyter', class extends LiElement {
    static get styles() {
        return css`
            :host {
                position: relative;
                display: flex;
                flex-direction: column;
                padding: 12px 0;
            }
        `;
    }
    render() {
        return html`
            ${this.notebook?.cells?.length ? html`` : html`
                <li-jupyter-cell-addbutton style="position: absolute; top: 18px; left: 6px; z-index: 31;"></li-jupyter-cell-addbutton>
            `}
            ${(this.notebook?.cells || []).map((cell, idx) => html`
                <li-jupyter-cell .cell=${cell} idx=${idx}></li-jupyter-cell>
            `)}
        `
    }

    static get properties() {
        return {
            url: { type: String, default: '' },
            showBorder: { type: Boolean, default: false, local: true, save: true },
            readOnly: { type: Boolean, default: false, local: true },
            notebook: { type: Object, default: {}, local: true },
            focusedCell: { type: Object, local: true },
            editedCell: { type: Object, local: true },
        }
    }

    updated(changedProperties) {
        if (changedProperties.has('url')) this.loadURL();
        if (changedProperties.has('focusedCell')) this.editedCell = undefined;
    }

    async loadURL(url = this.url) {
        this.focusedCell = undefined;
        if (url) {
            const response = await fetch(url);
            const json = await response.json();
            this.notebook = json;
            this.notebook.cells.map((i, idx) => i.order ||= idx);
            this.$update();
        }
    }
})

customElements.define('li-jupyter-cell-addbutton', class extends LiElement {
    static get styles() {
        return css`
            .btn {
                display: flex;
                position: absolute;
                left: 0px;
                z-index: 31;
            }
            .lbl {
                position: absolute;
                top: -14px;
                left: 24px;
                z-index: 31;
                font-size: 12px;
                cursor: pointer;
            }
        `;
    }

    render() {
        return html`
            <li-button class="btn" name="add" size=16 radius="50%" title="add cell" @click=${() => this.showCellViews('add')} borderColor="dodgerblue"
                    style="top: ${this.position === 'top' ? '-16px' : 'unset'}; bottom: ${this.position !== 'top' ? '-16px' : 'unset'};"></li-button>
            ${this.position === 'top' ? html`
                <label class="lbl" @click=${() => this.showCellViews('select type')} title="select cell type" style="color: ${this.cell?.color || 'gray'}">${this.cell?.label || this.cell?.cell_type}</label>
            ` : html``}
        `
    }

    static get properties() {
        return {
            notebook: { type: Object, local: true },
            cell: { type: Object },
            position: { type: String, default: 'top' }
        }
    }

    async showCellViews(view) {
        const res = await LI.show('dropdown', new LiJupyterListViews, { notebook: this.notebook, cell: this.cell, position: this.position, view }, { parent: this.$qs('li-button') });
        if (res && view === 'add') this.editedCell = undefined;
        this.$update();
    }
})

class LiJupyterListViews extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                min-width: 140px;
                position: relative;
                background: white;
                border: 1px solid lightgray;
                color: gray;
                font-family: Arial;
            }
        `;
    }

    render() {
        return html`
            <div style="text-align: center; padding: 4px; border-bottom: 1px solid lightgray;">${this.view} cell</div>
            <div style="display: flex; flex-direction: column; padding: 4px;">
                ${this.cellViews.map(i => html`
                    <li-button width="auto" textAlign="left" border=0 @click=${() => this.addCell(i)} style="padding: 2px">${i.source + i.label}</li-button>
                `)}
            </div>
        `
    }

    static get properties() {
        return {
            notebook: { type: Object, local: true },
            cell: { type: Object },
            position: { type: String, default: 'top' },
            view: { type: String },
        }
    }
    get cellViews() {
        return [
            { cell_type: 'markdown', cell_extType: 'md', color: '#F7630C', source: '🟠 ... ', label: 'md' },
            { cell_type: 'html', cell_extType: 'html', color: '#16C60C', source: '🟢 ... ', label: 'html' },
            { cell_type: 'code', cell_extType: 'code', color: '#0078D7', source: '🔵 ... ', label: 'code' },
            { cell_type: 'html-code', cell_extType: 'html-code', color: 'gray', source: '⚪️... ', label: 'html-code' },
        ]
    }

    addCell(item) {
        const idx = this.cell?.order || 0;
        if (this.view === 'add') {
            const ord = this.position === 'top' ? idx - .1 : idx + .1;
            const cell = { order: ord, cell_type: item.cell_type, cell_extType: item.cell_extType, source: item.source, color: item.color, label: item.label };
            this.notebook.cells ||= [];
            this.notebook.cells.splice(idx, 0, cell);
            this.notebook.cells.sort((a, b) => a.order - b.order).map((i, idx) => i.order = idx - .1 <= ord ? idx : idx + 1);
        } else if (this.view === 'select type') {
            const cell = { ...this.cell, ...{ cell_type: item.cell_type, cell_extType: item.cell_extType, color: item.color, label: item.label } };
            this.notebook.cells.splice(idx, 1, cell);
        }
        LI.fire(document, 'ok', item);
    }
}
customElements.define('li-jupyter-list-views', LiJupyterListViews);

customElements.define('li-jupyter-cell', class extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                position: relative;
                margin: 6px 6px;
            }
            .cell {
                display: flex;
                position: relative;
                /* padding: 4px; */
                min-height: 28px;
                width: 100%
            }
            .focused {
                /* box-shadow: 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.4); */
                box-shadow: 0 0 0 1px dodgerblue;
            }
        `;
    }

    render() {
        return html`
            <div id="${this.id}" class="cell ${this.focused}" style="order: ${this.cell?.order || 0}; box-shadow: ${!this.readOnly && this.showBorder && this.focusedCell !== this.cell ? 'inset 0px 0px 0px 1px lightgray' : ''};">
                ${this.cellType}
            </div>
            ${!this.readOnly && this.cell && this.focusedCell === this.cell ? html`
                <li-jupyter-cell-toolbar .cell=${this.cell} idx=${this.idx}></li-jupyter-cell-toolbar>
                <li-jupyter-cell-addbutton .cell=${this.cell}></li-jupyter-cell-addbutton>
                <li-jupyter-cell-addbutton .cell=${this.cell} position="bottom"></li-jupyter-cell-addbutton>
            ` : html``}
        `
    }

    static get properties() {
        return {
            showBorder: { type: Boolean, local: true },
            readOnly: { type: Boolean, local: true },
            notebook: { type: Object, local: true },
            focusedCell: { type: Object, local: true },
            editedCell: { type: Object, local: true },
            cell: { type: Object, default: undefined },
            idx: { type: Number, default: 0 },
        }
    }
    get focused() { return !this.readOnly && this.focusedCell === this.cell ? 'focused' : '' }
    get id() { return 'cell-' + (this.cell?.order || this.idx || 0) }
    get cellType() {
        if (this.cell?.cell_type === 'markdown')
            return html`<li-jupyter-cell-markdown @click=${this.click} @dblclick=${this.dblclick} .cell=${this.cell}></li-jupyter-cell-markdown>`;
        if (this.cell?.cell_type === 'html')
            return html`<li-jupyter-cell-html @click=${this.click} @dblclick=${this.dblclick} .cell=${this.cell}></li-jupyter-cell-html>`;
        if (this.cell?.cell_type === 'code')
            return html`<li-jupyter-cell-code @click=${this.click} @dblclick=${this.dblclick} .cell=${this.cell}></li-jupyter-cell-code>`;
        if (this.cell?.cell_type === 'html-code')
            return html`<li-jupyter-cell-html-code @click=${this.click} @dblclick=${this.dblclick} .cell=${this.cell}></li-jupyter-cell-html-code>`;

        return html`<div></div>`;
    }
    click(e) {
        this.focusedCell = this.cell;
        this.$update();
    }
    dblclick(e) {
        if (this.readOnly) return;
        this.editedCell = this.editedCell === this.cell ? undefined : this.cell;
        this.$update();
    }
})

customElements.define('li-jupyter-cell-toolbar', class extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                position: absolute;
                right: 8px;
                top: -18px;
                z-index: 21;
                /* box-shadow: 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.4); */
                box-shadow: 0 0 0 1px dodgerblue;
                background: white;
                width: 200px;
                height: 24px;
            }
            li-button {
                border-radius: 3px;
                margin: 4px 2px;
            }
            li-button[disabled] {
                pointer-events: none;
                opacity: .5;
            }
        `;
    }

    render() {
        return html`
            <li-button name="close" @click=${() => { this.focusedCell = undefined; this.$update() }} border=0 size=16></li-button>
            <li-button name="arrow-back" @click=${(e) => this.tapOrder(e, -1.1)} ?disabled=${this.order <= 0} title="move up" border=0 size=16 rotate=90></li-button>
            <li-button name="arrow-forward"  @click=${(e) => this.tapOrder(e, 1.1)} ?disabled=${this.order >= this.notebook?.cells?.length - 1} title="move down" border=0 size=16 rotate=90></li-button>
            <li-button name="select-all" title="show cells border" @click=${() => { this.showBorder = !this.showBorder; this.$update(); }} border=0 size=16></li-button>
            <li-button name="mode-edit" @click=${() => { this.editedCell = this.editedCell === this.cell ? undefined : this.cell; this.$update() }} fill=${this.editedCell === this.cell ? 'red' : ''} title="edit mode" border=0 size=16></li-button>
            ${this.editedCell === this.cell ? html`
                <li-button name="settings" border=0 size=16></li-button>
            ` : html``}
            <div style="flex: 1;"></div>
            <li-button name="delete" @click=${this.tapDelete} title="delete" border=0 size=16></li-button>
        `
    }

    static get properties() {
        return {
            showBorder: { type: Boolean, local: true },
            readOnly: { type: Boolean, local: true },
            notebook: { type: Object, local: true },
            focusedCell: { type: Object, local: true },
            editedCell: { type: Object, local: true },
            cell: { type: Object },
            idx: { type: Number, default: 0 }
        }
    }
    get order() { return this.cell.order || this.idx }

    tapOrder(e, v) {
        if (this.focusedCell !== this.cell) return;
        const ord = this.cell.order = this.order + v;
        this.notebook.cells.sort((a, b) => a.order - b.order).map((i, idx) => i.order = idx - 1.1 <= ord ? idx : idx + 1);
        this.$update();
    }
    tapDelete() {
        if (!this.cell.source || this.cell.source === ' ' || ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫️', '⚪️'].includes(this.cell.source.slice(0, 2))) {
            this.notebook.cells.splice(this.cell.order, 1);
            this.notebook.cells.sort((a, b) => a.order - b.order).map((i, idx) => i.order = idx);
            this.focusedCell = this.notebook.cells[(this.cell.order > this.notebook.cells.length - 1) ? this.notebook.cells.length - 1 : this.cell.order];
            this.$update();
        }
    }
})

customElements.define('li-jupyter-cell-markdown', class extends LiElement {
    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; }
            ::-webkit-scrollbar-track { background: lightgray; }
            ::-webkit-scrollbar-thumb {  background-color: gray; }            
            :host {
                position: relative;
                display: flex;
                width: 100%;
                min-height: 28px;
            }
        `;
    }

    render() {
        return html`
            ${this.readOnly || this.editedCell !== this.cell ? html`
                <li-viewer-md src=${this.cell?.source} style="width: 100%"></li-viewer-md>
            ` :  html`
                <div style="display: flex; overflow: hidden; width: 100%">
                    <div style="max-height: 80vh; width: 50%; overflow: auto">
                        <li-editor-ace class="ace" style="width: 100%" theme="solarized_light" mode="markdown"></li-editor-ace> 
                    </div>
                    <li-splitter size="3px" color="dodgerblue" style="opacity: .3"></li-splitter>
                    <div style="max-height: 80vh; flex: 1; overflow: auto">
                        <li-viewer-md src=${this.cell?.source} style="width: 100%; padding: 0;"></li-viewer-md>
                    </div>
                </div>
            `}
        `
    }

    static get properties() {
        return {
            readOnly: { type: Boolean, local: true },
            editedCell: { type: Object, local: true, notify: true },
            cell: { type: Object }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        this.listen('change', (e) => {
            this.cell.source = e.detail
            this.$update();
        })
        this.listen('editedCell-changed', () => {
            requestAnimationFrame(() => {
                if (this.editedCell && this.editedCell === this.cell) {
                    const ace = this.$qs('li-editor-ace');
                    ace.options = { highlightActiveLine: false, showPrintMargin: false, minLines: 1, fontSize: 16 };
                    ace.src = this.cell.source;
                }
            })
        })
    }
})

customElements.define('li-jupyter-cell-code', class extends LiElement {
    static get styles() {
        return css`
            :host {
                width: 100%;
                display: flex;
                /* padding: 4px; */
                min-height: 28px;
            }
            .box {
                width: 24px;
                cursor: pointer;
                align-self: flex-start;
                padding-right: 4px;
            }
        `;
    }

    render() {
        return html`
            <div class="box ">
                <div>[...]</div>
            </div>
            <li-editor-ace style="width: 100%;" theme=${!this.readOnly && this.editedCell === this.cell ? 'solarized_light' : 'dawn'} mode="javascript"></li-editor-ace>    
        `
    }

    firstUpdated() {
        super.firstUpdated();
        setTimeout(() => {
            const ace = this.$qs('li-editor-ace');
            ace.options = { highlightActiveLine: false, showPrintMargin: false, minLines: 1, fontSize: 16 };
            ace.value = this.cell.source;
            this.$update();
        });
    }

    static get properties() {
        return {
            readOnly: { type: Boolean, local: true },
            editedCell: { type: Object, local: true },
            cell: { type: Object }
        }
    }
})

customElements.define('li-jupyter-cell-html', class extends LiElement {
    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; }
            ::-webkit-scrollbar-track { background: lightgray; }
            ::-webkit-scrollbar-thumb {  background-color: gray; }    
            :host {
                position: relative;
                display: flex;
                flex: 1;
                min-height: 28px;
            }
        `;
    }

    render() {
        return html`
            ${this.readOnly || this.editedCell !== this.cell ? html`
                <div .innerHTML=${this.cell.source} style="width: 100%; padding: 8px;"></div>
            ` :  html`
                <div style="display: flex; overflow: hidden; width: 100%">
                    <div style="width: 50%; height: 80vh; overflow: auto">
                        <li-editor-html style="width: 100%"></li-editor-html>
                    </div>
                    <li-splitter size="3px" color="dodgerblue" style="opacity: .3"></li-splitter>
                    <div style="flex: 1; height: 80vh; overflow: auto">
                        <div .innerHTML=${this.cell.source} style="width: 100%"></div>
                    </div>
                </div>
            `}
        `
    }

    static get properties() {
        return {
            readOnly: { type: Boolean, local: true },
            editedCell: { type: Object, local: true, notify: true },
            cell: { type: Object }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        this.listen('change', (e) => this.cell.source = e.detail);
        this.listen('editedCell-changed', () => {
            requestAnimationFrame(() => {
                if (this.editedCell && this.editedCell === this.cell) this.$qs('li-editor-html').src = this.cell.source;
            })
        })
    }
})

customElements.define('li-jupyter-cell-html-code', class extends LiElement {
    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; }
            ::-webkit-scrollbar-track { background: lightgray; }
            ::-webkit-scrollbar-thumb {  background-color: gray; }            
            :host {
                position: relative;
                display: flex;
                flex-direction: column;
                width: 100%;
                min-height: 24px;
            }
        `;
    }

    render() {
        return html`
            <div style="position: relative; display: flex; flex-direction: column; overflow: hidden; width: 100%; height: 100%; min-height: 24px;">
                <div style="display: flex; overflow: hidden; width: 100%; height: 100%">
                    <div style="width: 50%; overflow: auto">
                        <li-editor-ace class="ace" style="width: 100%" theme="cobalt" mode="html"></li-editor-ace> 
                    </div>
                    <li-splitter size="3px" color="dodgerblue" style="opacity: .3"></li-splitter>
                    <div style="flex: 1; overflow: auto">
                        <iframe srcdoc=${this.cell?.source} style="border: none; width: 100%; height: 100%"></iframe>
                    </div>
                </div>
                <li-splitter direction="horizontal" size="3px" color="dodgerblue" style="opacity: .3" resize></li-splitter>
                <div style="display: flex; overflow: auto; flex: 1; width: 100%"></div>
            </div>
        `
    }

    static get properties() {
        return {
            readOnly: { type: Boolean, local: true },
            editedCell: { type: Object, local: true, notify: true },
            cell: { type: Object }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        this.listen('change', (e) => {
            this.cell.source = e.detail
            this.$update();
        })
        setTimeout(() => {
            const ace = this.$qs('li-editor-ace');
            ace.options = { highlightActiveLine: false, showPrintMargin: false, minLines: 1, fontSize: 16 };
            ace.value = this.cell.source;
            this.$update();
        })
    }
})
