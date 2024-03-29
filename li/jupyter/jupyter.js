import { LiElement, html, css } from '../../li.js';

import '../button/button.js';
import '../dropdown/dropdown.js';
import '../editor-html/editor-html.js';
import '../editor-ace/editor-ace.js';
import '../viewer-md/viewer-md.js';
import '../splitter/splitter.js';
import '../editor-simplemde/editor-simplemde.js';
import '../property-grid/property-grid.js';
import { LZString } from '../../lib/lz-string/lz-string.js';

const editorCSS = css`
    ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: lightgray; } ::-webkit-scrollbar-thumb {  background-color: gray; }            
    :host { position: relative; display: flex; width: 100%; overflow: hidden; min-height: 20px; }
`;

customElements.define('li-jupyter', class LiJupyter extends LiElement {
    static get styles() {
        return css`
            :host {
                position: relative;
                display: flex;
                flex-direction: column;
                padding: 16px 0;
            }
        `;
    }
    render() {
        return html`
            ${this.notebook?.label ? html`
                <h3 style="margin: -14px 0 2px 32px; color: gray">${this.notebook?.label || ''}</h3>
            ` : html``}
            ${this.readOnly || this.notebook?.cells?.length || !this.isReady ? html`` : html`
                <li-jupyter-cell-addbutton style="position: absolute; top: 18px; left: 6px; z-index: 31;"></li-jupyter-cell-addbutton>
            `}
            ${(this.notebook?.cells || []).map((cell, idx) => html`
                <li-jupyter-cell .cell=${cell} idx=${idx}></li-jupyter-cell>
            `)}
        `
    }

    static get properties() {
        return {
            id: { type: String, local: true },
            jupyter: { type: Object, default: {}, local: true },
            isReady: { type: Boolean, default: false },
            url: { type: String, default: '' },
            lzs: { type: String, default: '' },
            showBorder: { type: Boolean, default: true, local: true, save: true },
            readOnly: { type: Boolean, default: false, local: true },
            notebook: { type: Object, local: true },
            focusedIndex: { type: Number, default: -1, local: true },
            editedIndex: { type: Number, default: -1, local: true },
            jupiterUrl: { type: String, local: true },
            collapsed: { type: Boolean, local: true },
            _isChanged: { type: Boolean, local: true }
        }
    }
    get jupiterUrl() { return this.$url }
    set jupiterUrl(v) { return this._jupiterUrl = v }

    constructor() {
        super();
        this.jupyter = this;
    }
    firstUpdated() {
        super.firstUpdated();
        LI.listen(document, 'setFocusedIndex', (e) => {
            setTimeout(() => {
                this.focusedIndex = +e.detail.idx;
                setTimeout(() => {
                    this.editedIndex = +e.detail.editedIdx;
                    this.$update();
                }, 100);
            }, 100);
        })
    }
    updated(changedProperties) {
        if (changedProperties.has('url') || changedProperties.has('lzs')) this.loadURL();
        if (changedProperties.has('notebook')) this.setIsReady();
        if (changedProperties.has('focusedIndex')) this.editedIndex = -1;
        if (changedProperties.has('readOnly')) this.focusedIndex = -1;
        if (changedProperties.has('collapsed') && this.collapsed) this.notebook.cells.map((i, idx) => i._idx = idx + 1);

    }

    async loadURL() {
        this.focusedIndex = -1;
        this._location = window.location.href;
        let _lzs = this._location.split('?lzs=')[1];
        _lzs = _lzs || this.lzs;
        if (_lzs) {
            try {
                _lzs = LZString.decompressFromEncodedURIComponent(_lzs)
                this.notebook = JSON.parse(_lzs);
                // return;
            } catch (err) { }
        } else if (this.url) {
            const response = await fetch(this.url);
            const json = await response.json();
            this.notebook = json;
        }
        this.setIsReady();
    }
    setIsReady() {
        setTimeout(() => this.isReady = true, 300);
        this.$update();
    }
    share() {
        const str = JSON.stringify(this.notebook);
        if (str) {
            let url = this.$url.replace('jupyter.js', 'index.html#?lzs=') + LZString.compressToEncodedURIComponent(str);
            window.open(url, '_blank').focus();
        }
    }
    clearAll() {
        if (this.readOnly) return;
        this.notebook.cells = [];
        this.$update();
    }
    loadFile(e, add) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            this.notebook = JSON.parse(e.target.result);
            this.$update();
            LI.fire(document, 'changesJupyter', { type: 'jupyter_notebook', change: add ? 'addNotebook' : 'uploadNotebook', notebook: this.notebook, jupyter: this.jupyter });
        }
        reader.readAsText(file, 'UTF-8');
    }
    async saveFile(e) {
        let str = JSON.stringify(this.notebook, null, '\t');
        if (!str) return;
        const blob = new Blob([str], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = (this.notebook.label || 'li-jupyter') + '.json';
        a.click();
        this.$update();
    }
})

customElements.define('li-jupyter-cell-addbutton', class LiJupyterAddButton extends LiElement {
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
                left: 84px;
                z-index: 31;
                font-size: 12px;
                cursor: pointer;
                color: dodgerblue;
            }
        `;
    }

    render() {
        return html`
            <li-button class="btn" name="add" size=16 radius="50%" title="add cell" @click=${() => this.showCellViews('add')} borderColor="dodgerblue" fill="dodgerblue"
                    style="top: ${this.position === 'top' ? '-16px' : 'unset'}; bottom: ${this.position !== 'top' ? '-16px' : 'unset'};"></li-button>
            ${this.position === 'top' ? html`
                ${!this.readOnly && this.cell && this.focusedIndex === this.idx ? html`
                    <li-button class="btn" name="close" size=16 radius="50%" title="unselect" borderColor="dodgerblue" @click=${() => { this.focusedIndex = -1; this.$update() }} style="top: -16px; left: 20px"></li-button>
                    <li-button class="btn" name="crop-7-5" size=16 radius="50%" title="collapse" borderColor="dodgerblue" @click=${() => this.collapsed = !this.collapsed} style="top: -16px; left: 40px" fill=${this.collapsed ? 'dodgerblue' : 'lightgray'}></li-button>
                    <li-button class="btn" name="edit" size=16 scale=.8 radius="50%" title="edit mode" borderColor="dodgerblue" fill=${this.editedIndex === this.idx ? 'red' : 'gray'} @click=${() => { this.editedIndex = (this.editedIndex === this.idx ? -1 : this.idx); this.$update() }} style="top: -16px; left: 60px"></li-button>
                ` : html``}
                <label class="lbl" @click=${() => this.showCellViews('select type')} title="select cell type">${this.cell?.label || this.cell?.cell_type || this.cell?.cell_name}</label>
            ` : html``}
        `
    }

    static get properties() {
        return {
            id: { type: String, local: true },
            jupyter: { type: Object, local: true },
            notebook: { type: Object, local: true },
            cell: { type: Object },
            position: { type: String, default: 'top' },
            readOnly: { type: Boolean, local: true },
            idx: { type: Number },
            collapsed: { type: Boolean, local: true },
            focusedIndex: { type: Number, local: true },
            editedIndex: { type: Number, local: true }
        }
    }

    async showCellViews(view) {
        this.view = view;
        this.editedIndex = -1;
        const res = await LI.show('dropdown', new LiJupyterListViews, { id: this.id }, { id: this.id, parent: this.$qs('li-button'), showHeader: true, label: view + ' cell' });
        if (res && view === 'add') this.editedIndex = -1;
        this.addCell(res.detail)
        this.$update();
    }
    addCell(item) {
        this.jupyter._isChanged = true;
        if (this.cell)
            this.jupyter.collapsed = true;
        setTimeout(() => {
            let idx = this.idx;
            let editedIdx = -1;
            if (this.view === 'add') {
                idx = this.position === 'top' ? idx : idx + 1;
                idx ||= 0;
                const cell = { ulid: LI.ulid(), type: 'jupyter_cell', cell_type: item.cell_type, cell_extType: item.cell_extType, source: item.source, label: item.label };
                this.notebook ||= { id: this.jupyter.id, cells: [] };
                this.notebook.cells.splice(idx, 0, cell);
                // editedIdx = this.notebook.cells.length === 1 ? 0 : -1;
                LI.fire(document, 'changesJupyter', { type: 'jupyter_cell', change: 'addCell', cell: cell, notebook: this.notebook, jupyter: this.jupyter });
            } else if (this.view === 'select type') {
                const cell = { ...this.cell, ...{ cell_type: item.cell_type, cell_extType: item.cell_extType, label: item.label } };
                LI.fire(document, 'changesJupyter', { type: 'jupyter_cell', change: 'setCellType', cell: cell, notebook: this.notebook, jupyter: this.jupyter });
                this.notebook.cells.splice(idx, 1, cell);
            }
            LI.fire(document, 'setFocusedIndex', { idx, editedIdx });
            setTimeout(() => this.jupyter._isChanged = false, 500);
        }, 10);
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
                border: 1px solid gray;
                color: gray;
                font-family: Arial;
            }
        `;
    }

    render() {
        return html`
            <div style="display: flex; flex-direction: column;">
                ${this.cellViews.map((i, indx) => html`
                    <li-button width="auto" textAlign="left" border=0 @click=${() => this.addCell(i)} style="padding: 2px">${(indx + 1) + '. ' + i.label}</li-button>
                `)}
            </div>
        `
    }
    static get properties() {
        return {
            id: { type: String, local: true },
        }
    }
    get cellViews() {
        return [
            { cell_type: 'html', cell_extType: 'html', source: '', label: 'html-Pell-editor' },
            { cell_type: 'markdown', cell_extType: 'md', source: '', label: 'md-Showdown' },
            { cell_type: 'code', cell_extType: 'code', source: '', label: 'code' },
            { cell_type: 'html-executable', cell_extType: 'html-executable', source: '', label: 'code-html-executable' },
            { cell_type: 'html-cde', cell_extType: 'html-cde', source: '', label: 'html-CDEditor' },
            { cell_type: 'html-jodit', cell_extType: 'html-jodit', source: '', label: 'html-Jodit-editor' },
            { cell_type: 'html-tiny', cell_extType: 'html-tiny', source: '', label: 'html-TinyMCE' }
        ]
    }

    addCell(item) {
        LI.fire(document, 'ok', item);
    }
}
customElements.define('li-jupyter-list-views', LiJupyterListViews);

customElements.define('li-jupyter-cell', class LiJupyterCell extends LiElement {
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
                width: 100%;
            }
            .focused {
                box-shadow: 0 0 0 1px dodgerblue;
            }
            .edited {
                box-shadow: 0 0 0 2px red;
            }
            .row {
                width: 100%;
                height: 100%;
                cursor: pointer;
                padding: 5px;
                color: darkgray;
                font-size: 12px;
            }
        `;
    }

    render() {
        return html`
            <div id="${this.id}" class="cell ${this.focused} ${this.edited}" style="box-shadow: ${this.showBorder && this.focusedIndex !== this.idx ? '0px 0px 0px 1px lightgray' : ''}">
                ${!this.readOnly && this.collapsed && this.editedIndex !== this.idx ? html`
                    <div class="row" @click=${this.click}>${(this.cell._idx || '..') + '. ' + this.cell?.label || this.cell?.cell_type || ''}</div>
                ` : html`
                    ${this.jupyter.hideCells ? html`` : html`${this.cellType}`}
                `}
            </div>
            ${!this.readOnly && this.cell && this.focusedIndex === this.idx ? html`
                <li-jupyter-cell-toolbar .cell=${this.cell} idx=${this.idx} .focusedControl=${this.focusedControl}></li-jupyter-cell-toolbar>
                <li-jupyter-cell-addbutton .cell=${this.cell} idx=${this.idx}></li-jupyter-cell-addbutton>
                <li-jupyter-cell-addbutton .cell=${this.cell} idx=${this.idx} position="bottom"></li-jupyter-cell-addbutton>
            ` : html``}
        `
    }

    static get properties() {
        return {
            jupyter: { type: Object, local: true },
            showBorder: { type: Boolean, local: true },
            readOnly: { type: Boolean, local: true },
            notebook: { type: Object, local: true },
            cell: { type: Object, default: undefined },
            idx: { type: Number },
            collapsed: { type: Boolean, local: true },
            focusedControl: { type: Boolean },
            focusedIndex: { type: Number, local: true },
            editedIndex: { type: Number, local: true },
            _isChanged: { type: Boolean, local: true }
        }
    }
    get focused() { return !this.edited && !this.readOnly && this.focusedIndex === this.idx ? 'focused' : '' }
    get edited() { return !this.readOnly && this.editedIndex === this.idx ? 'edited' : '' }
    get id() { return 'cell-' + (this.idx || 0) }
    get focusedControl() { return this.$qs('#control') }
    get cellType() {
        if (this.cell?.cell_type === 'html' || this.cell?.cell_name === 'html-editor' || this.cell?.cell_name === 'suneditor')
            return html`<li-jupyter-cell-html id="control" @click=${this.click} .cell=${this.cell} idx=${this.idx}></li-jupyter-cell-html>`;
        if (this.cell?.cell_type === 'markdown' || this.cell?.cell_name === 'simplemde' || this.cell?.cell_name === 'showdown')
            return html`<li-jupyter-cell-markdown id="control" @click=${this.click} .cell=${this.cell} idx=${this.idx}></li-jupyter-cell-markdown>`;
        if (this.cell?.cell_type === 'code')
            return html`<li-jupyter-cell-code id="control" @click=${this.click} .cell=${this.cell} idx=${this.idx}></li-jupyter-cell-code>`;
        if (this.cell?.cell_type === 'html-executable' || this.cell?.cell_name === 'iframe')
            return html`<li-jupyter-cell-html-executable id="control" @click=${this.click} .cell=${this.cell} idx=${this.idx}></li-jupyter-cell-html-executable>`;

        if (this.cell?.cell_type === 'html-cde')
            return html`<li-jupyter-cell-html-cde id="control" @click=${this.click} .cell=${this.cell} idx=${this.idx}></li-jupyter-cell-html-cde>`;
        if (this.cell?.cell_type === 'html-jodit')
            return html`<li-jupyter-cell-html-jodit id="control" @click=${this.click} .cell=${this.cell} idx=${this.idx}></li-jupyter-cell-html-jodit>`;
        if (this.cell?.cell_type === 'html-tiny')
            return html`<li-jupyter-cell-html-tiny id="control" @click=${this.click} .cell=${this.cell} idx=${this.idx}></li-jupyter-cell-html-tiny>`;

        return html`<div style="min-height: 28px;">${this.cell?.sourse || this.cell?.value}</div>`;
    }
    firstUpdated() {
        super.firstUpdated();
        setTimeout(() => {
            this.listen('change', (e) => {
                if (!this.jupyter._isChanged) {
                    LI.fire(document, 'changesJupyter', { type: 'jupyter_cell', change: 'changeCellValue', cell: this.cell, notebook: this.notebook, jupyter: this.jupyter });
                }
            })
        }, 500);
    }
    click(e) {
        if (this.readOnly) return;
        this.focusedIndex = this.idx;
        this.$update();
    }
})

customElements.define('li-jupyter-cell-toolbar', class LiJupyterCellToolbar extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                position: absolute;
                right: 8px;
                top: -18px;
                z-index: 21;
                box-shadow: 0 0 0 1px dodgerblue;
                border-radius: 2px;
                background: white;
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
            <li-button name="mode-edit" @click=${() => { this.editedIndex = this.editedIndex === this.idx ? -1 : this.idx; this.$update() }} fill=${this.editedIndex === this.idx ? 'red' : ''} title="edit mode" border=0 size=16></li-button>
            <li-button class="btn" name="crop-7-5" size=16 title="collapse" @click=${() => this.collapsed = !this.collapsed} fill=${this.collapsed ? 'dodgerblue' : 'lightgray'} border="none"></li-button>
            <li-button name="arrow-back" @click=${(e) => this.tapOrder(e, -1)} ?disabled=${this.idx <= 0} title="move up" border=0 size=16 rotate=90></li-button>
            <li-button name="arrow-forward"  @click=${(e) => this.tapOrder(e, 1)} ?disabled=${this.idx >= this.notebook?.cells?.length - 1} title="move down" border=0 size=16 rotate=90></li-button>
            <li-button id="sets" name="settings" border=0 size=16 @click=${this.showSettings} style="display: ${this.focusedControl?.editors?.length ? '' : 'none'}"></li-button>
            <div style="flex: 1;"></div>
            <li-button name="launch" @click="${this.share}" style="margin-right:2px" border="none" title="share" size=16></li-button>
            <li-button name="delete" @click=${this.tapDelete} title="delete" border=0 size=16></li-button>
            <li-button name="close" @click=${() => { this.focusedIndex = -1; this.$update() }} border=0 size=16 title="unselect"></li-button>
        `
    }

    static get properties() {
        return {
            jupyter: { type: Object, local: true },
            showBorder: { type: Boolean, local: true },
            readOnly: { type: Boolean, local: true },
            notebook: { type: Object, local: true },
            cell: { type: Object },
            idx: { type: Number },
            jupiterUrl: { type: String, local: true },
            showSettings: { type: Boolean },
            focusedControl: { type: Boolean },
            focusedIndex: { type: Number, local: true },
            editedIndex: { type: Number, local: true },
            _isChanged: { type: Boolean, local: true },
            collapsed: { type: Boolean, local: true }
        }
    }

    tapOrder(e, v) {
        this.jupyter._isChanged = true;
        this.jupyter.collapsed = true;
        this.editedIndex = -1;
        setTimeout(() => {
            const cells = this.notebook.cells.splice(this.idx, 1);
            let idx = this.idx + v;
            idx = idx < 0 ? 0 : idx > this.notebook.cells.length ? this.notebook.cells.length : idx;
            this.notebook.cells.splice(idx, 0, cells[0])
            this.focusedIndex = idx;
            LI.fire(document, 'changesJupyter', { type: 'jupyter_cell', change: 'moveCell', cell: this.cell, notebook: this.notebook, jupyter: this.jupyter });
            setTimeout(() => this.jupyter._isChanged = false, 500);
        }, 10)
    }
    tapDelete() {
        if (window.confirm(`Do you really want delete current cell ?`)) {
            this.jupyter._isChanged = true;
            const collapsed = this.jupyter.collapsed;
            this.jupyter.collapsed = true;
            this.editedIndex = -1;
            setTimeout(() => {
                this.cell._deleted = true;
                this.notebook.cells.splice(this.idx, 1);
                this.focusedIndex = (this.idx > this.notebook.cells.length - 1) ? this.notebook.cells.length - 1 : this.idx;
                this.jupyter.collapsed = collapsed;
                LI.fire(document, 'changesJupyter', { type: 'jupyter_cell', change: 'deleteCell', cell: this.cell, notebook: this.notebook, jupyter: this.jupyter });
                setTimeout(() => this.jupyter._isChanged = false, 500);
            }, 10)
        }
    }
    share() {
        const notebook = { ...this.notebook };
        notebook.cells = [this.cell];
        const str = JSON.stringify(notebook);
        if (str) {
            let url = this.jupiterUrl.replace('jupyter.js', 'index.html#?lzs=') + LZString.compressToEncodedURIComponent(str);
            window.open(url, '_blank').focus();
        }
    }
    async showSettings() {
        if (this.focusedControl?.editors?.length) {
            try {
                let io = getIO(this.focusedControl?.editors);
                let categories = this.focusedControl.categories;
                let val = await LI.show('dropdown', 'property-grid', { jupyter: this.jupyter, io, showButtons: false, categories, hideHeader: true }, { label: this.cell.cell_type, parent: this.$qs('#sets'), align: 'left', showHeader: true, intersect: true });
            } catch (error) { }
        }
    }
})

const getIO = (eds) => {
    if (!eds?.length) return {};
    let io = { elementProperties: {} };
    eds.map(ed => {
        if (ed) {
            let props = ed.constructor.elementProperties;
            for (let [key, value] of props.entries()) {
                io[key] = ed[key];
                io.elementProperties[key] = value;
                io.elementProperties[key].category = io.elementProperties[key].category || ed.localName;
                io.ulid = ed.ulid;
            }
        }
    })
    io.elementProperties = new Map(Object.entries(io.elementProperties));
    return io;
}

customElements.define('li-jupyter-cell-markdown', class LiJupyterCellMarkdown extends LiElement {
    static get styles() {
        return [editorCSS, css``]
    }

    render() {
        return html`
            ${this.readOnly || this.editedIndex !== this.idx ? html`
                <li-viewer-md src=${this.cell?.source} style="width: 100%"></li-viewer-md>
            ` : html`
                <div style="display: flex; overflow: hidden; width: 100%; height: 80vh">
                    <div style="max-height: ${this._h}vh; width: 50%; overflow: auto">
                        <li-editor-ace class="ace" style="width: 100%; height: 100%" theme="solarized_light" mode="markdown"></li-editor-ace>
                        <!-- <li-editor-simplemde class="editor" style="width: 100%; height: 100%"></li-editor-simplemde> -->
                    </div>
                    <li-splitter size="3" color="dodgerblue" style="opacity: .3"></li-splitter>
                    <div style="max-height: 80vh; flex: 1; overflow: auto">
                        <li-viewer-md src=${this.cell?.source} style="width: 100%; padding: 0;"></li-viewer-md>
                    </div>
                </div>
            `}
        `
    }

    static get properties() {
        return {
            jupyter: { type: Object, local: true },
            readOnly: { type: Boolean, local: true },
            idx: { type: Number },
            cell: { type: Object },
            _h: { type: Number, default: 0 },
            editedIndex: { type: Number, local: true, notify: true }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        this.listen('change', (e) => {
            this.cell.source = e.detail
            this.$update();
        })
        this.listen('editedIndex-changed', () => {
            this._h = 0;
            requestAnimationFrame(() => {
                if (this.editedIndex >= 0 && this.editedIndex === this.idx) {
                    const ace = this.$qs('li-editor-ace');
                    if (ace) {
                        ace.options = { highlightActiveLine: false, showPrintMargin: false, minLines: 1, fontSize: 16 };
                        ace.src = this.cell.source;
                    }
                    const simplemde = this.$qs('li-editor-simplemde');
                    if (simplemde) {
                        simplemde.src = this.cell.source;
                    }
                }
                this._h = 80;
            })
        })
    }
})

customElements.define('li-jupyter-cell-code', class LiJupyterCellCode extends LiElement {
    static get styles() {
        return [editorCSS, css``]
    }

    render() {
        return html`
            <div style="display: flex; flex-direction: column; width: 100%; height: ${!this.readOnly && this.editedIndex === this.idx ? '80vh' : this.cell?.cell_h || 'unset'}; min-height: 24px; overflow: auto; padding: 2px 2px 0 2px">
                <li-editor-ace style="width: 100%; height: '100%'; min-height: 0px" theme=${!this.readOnly && this.editedIndex === this.idx ? 'solarized_light' : 'dawn'} mode="javascript"></li-editor-ace>    
                <li-splitter direction="horizontal" size=${this.cell?.splitterH >= 0 ? this.cell?.splitterH : 2} color="transparent" style="opacity: .3" resize></li-splitter>
                <div style="display: flex; overflow: auto; width: 100%; max-height: 0px;"></div>
            </div>
        `
    }

    static get properties() {
        return {
            jupyter: { type: Object, local: true },
            readOnly: { type: Boolean, local: true },
            idx: { type: Number },
            cell: { type: Object },
            editedIndex: { type: Number, local: true, notify: true }
        }
    }

    constructor() {
        super();
        this.listen('endSplitterMove', (e) => {
            if (!this.readOnly) {
                if (e.detail.direction === 'horizontal') {
                    this.cell.cell_h = e.detail.h;
                    this.cell.cell_h = this.cell.cell_h < 24 ? 24 : this.cell.cell_h;
                }
            }
        })
    }
    async firstUpdated() {
        super.firstUpdated();
        await new Promise((r) => setTimeout(r, 0));
        const ace = this.$qs('li-editor-ace');
        ace.options = { highlightActiveLine: false, showPrintMargin: false, minLines: 1, fontSize: 16 };
        ace.value = this.cell.source;
        this.$update();
        this.editors = [ace];
        this.categories = ['li-editor-ace'];
        setTimeout(() => {
            Object.keys(this.cell['li-editor-ace'] || []).map(key => {
                if (key === 'options') {
                    Object.keys(this.cell['li-editor-ace'][key]).forEach(i => {
                        this.$qs('li-editor-ace').defaultOptions[i] = this.cell['li-editor-ace'][key][i];
                    })
                } else {
                    this.$qs('li-editor-ace')[key] = this.cell['li-editor-ace'][key];
                }
            })
            this.listen('change', (e) => {
                if (!this.isFirstUpdated) return;
                this.cell.source = e.detail
                this.$update();
            })
            this.$listen('changedInPropertyGrid', (e) => {
                if (!this.isFirstUpdated || !e?.get('value')) return;
                const res = e.get('value');
                if (res.i.obj.ulid === this.$qs('li-editor-ace').ulid) {
                    this.editors[0][res.key] = res.value;
                    this.cell['li-editor-ace'] ||= {};
                    this.cell['li-editor-ace'][res.key] = res.value;
                }
            })
            this.listen('aceSetOptions', (e) => {
                if (!this.isFirstUpdated || !e?.detail?.opts) return;
                if (e.detail.ulid === this.$qs('li-editor-ace').ulid) {
                    this.cell['li-editor-ace'] ||= {};
                    this.cell['li-editor-ace'].options ||= {};
                    (e.detail?.opts || []).forEach(i => {
                        this.cell['li-editor-ace'].options[i.key] = i.value;
                    })
                }
            })
        })
        setTimeout(() => this.isFirstUpdated = true, 500);
    }
})

customElements.define('li-jupyter-cell-html', class LiJupyterCellHtml extends LiElement {
    static get styles() {
        return [editorCSS, css``]
    }

    render() {
        return html`
            ${this.readOnly || this.editedIndex !== this.idx ? html`
                <div .innerHTML=${this.cell.source} style="width: 100%; padding: 8px;"></div>
            ` : html`
                <div style="display: flex; overflow: hidden; width: 100%">
                    <div style="width: 50%; height: 80vh; overflow: hidden;">
                        <li-editor-html style="width: 100%"></li-editor-html>
                    </div>
                    <li-splitter size="3" color="dodgerblue" style="opacity: .3"></li-splitter>
                    <div style="flex: 1; height: 80vh; overflow: auto">
                        <div .innerHTML=${this.cell.source} style="width: 100%"></div>
                    </div>
                </div>
            `}
        `
    }

    static get properties() {
        return {
            jupyter: { type: Object, local: true },
            readOnly: { type: Boolean, local: true },
            idx: { type: Number },
            cell: { type: Object },
            editedIndex: { type: Number, local: true, notify: true }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        this.listen('change', (e) => this.cell.source = e.detail);
        this.listen('editedIndex-changed', () => {
            requestAnimationFrame(() => {
                if (this.editedIndex >= 0 && this.editedIndex === this.idx) this.$qs('li-editor-html').src = this.cell.source;
            })
        })
    }
})

customElements.define('li-jupyter-cell-html-executable', class LiJupyterCellHtmlExecutable extends LiElement {
    static get styles() {
        return [editorCSS, css`
            span {
                cursor: pointer;
                font-size: 12px;
                padding: 0 4px;
            }
            .mode {
                color: red;
                background: white;
            }
        `]
    }

    render() {
        return html`
            <div style="position: relative; display: flex; flex-direction: column; overflow: hidden; width: 100%; height: ${!this.readOnly && this.editedIndex === this.idx ? '80vh' : this.cell?.cell_h || '200px'}; min-height: 26px; padding: 2px 2px 0 2px;">
                <div style="display: flex; overflow: hidden; width: 100%; height: 100%">
                    <div style="width: ${this.cell?.cell_w === 0 || this.cell?.cell_w > 0 ? this.cell?.cell_w + '%' : '50%'}; overflow: auto">
                        <div style="display: flex; flex-direction: column; width: 100%; overflow: auto; height: 100%; position: relative">
                            <div style="display: flex; background: lightgray; padding: 4px;position: sticky; top: 0; z-index: 9">
                                <span @click=${() => this.mode = 'html'} class="${this.mode === 'html' ? 'mode' : ''}">html</span>
                                <span @click=${() => this.mode = 'javascript'} class="${this.mode === 'javascript' ? 'mode' : ''}">javascript</span>
                                <span @click=${() => this.mode = 'css'} class="${this.mode === 'css' ? 'mode' : ''}">css</span>
                                ${this.cell?.useJson ? html`
                                    <span @click=${() => this.mode = 'json'} class="${this.mode === 'json' ? 'mode' : ''}">json</span>
                                ` : html``}
                                <li-button size=12 name="code" @click=${(e) => { this.cell.useJson = !this.cell.useJson; this.$update() }} title="useJSON" style="margin-left: 8px;"></li-button>
                                <div style="flex: 1"></div>
                                <li-button size=12 name="content-cut" @click=${(e) => { this.cell.sourceHTML = this.cell.sourceJS = this.cell.sourceCSS = this._sourceJSON = ''; this.cell.sourceJSON = '{}'; this.listenIframe(true); this.$qs('li-editor-ace').value = '' }} title="clear all"></li-button>
                                <li-button size=12 name="refresh" @click=${(e) => { this.listenIframe(true) }} style="margin-left: 6px" title="refresh"></li-button>
                            </div>
                            <li-editor-ace class="ace" style="width: 100%" theme=${this.mode === 'html' ? 'cobalt' : this.mode === 'javascript' ? 'solarized_light' : this.mode === 'css' ? 'dawn' : 'chrome'} mode=${this.mode}></li-editor-ace>
                        </div>
                    </div>
                    <li-splitter size=${this.cell?.splitterV >= 0 ? this.cell?.splitterV : 2} color="transparent" style="opacity: .3"></li-splitter>
                    <div style="flex: 1; overflow: auto; width: 100%;">
                        <iframe style="border: none; width: 100%; height: 100%"></iframe>
                    </div>
                </div>
                <li-splitter direction="horizontal" size="${this.cell?.splitterH >= 0 ? this.cell?.splitterH : 2}" color="transparent" style="opacity: .3" resize></li-splitter>
                <div style="display: flex; overflow: auto; flex: 1; width: 100%"></div>
            </div>
        `
    }

    static get properties() {
        return {
            jupyter: { type: Object, local: true },
            readOnly: { type: Boolean, local: true },
            idx: { type: Number },
            cell: { type: Object },
            mode: { type: String, default: 'html' },
            editedIndex: { type: Number, local: true, notify: true }
        }
    }
    get srcdoc() {
        return `
<style>
    ${this.cell?.sourceCSS || ''}
</style>
${this.cell?.sourceHTML || ''}
<script type="module">
    ${this.sourceJSON}
    ${this.cell?.sourceJS || ''}
</script>
        `
    }
    get sourceJSON() {
        if (this.cell?.useJson || this.cell?.sourceJSON) return `
// import { Observable } from 'https://resu062.github.io/li-js/lib/object-observer/object-observer.js';
import { Observable } from 'https://libs.gullerya.com/object-observer/5.0.0/object-observer.min.js';
let json = Observable.from(${this._sourceJSON || '{}'});
Observable.observe(json, e => {
    const detail = JSON.stringify(json, null, 4);
    document.dispatchEvent(new CustomEvent('changeJSON', { detail }));
})
        `
        return '';
    }
    constructor() {
        super();
        this.listen('endSplitterMove', (e) => {
            if (!this.readOnly) {
                if (e.detail.direction === 'horizontal') {
                    this.cell.cell_h = e.detail.h;
                    this.cell.cell_h = this.cell.cell_h < 26 ? 26 : this.cell.cell_h;
                }
                if (e.detail.direction === 'vertical') {
                    this.cell.cell_w = e.detail.w;
                    this.cell.cell_w = this.cell.cell_w < 3 ? 0 : this.cell.cell_w;
                }
            }
            this.listenIframe(true);
        })
    }
    firstUpdated() {
        super.firstUpdated();
        this._sourceJSON = this.cell.sourceJSON || '{}';
        this.listen('change', (e) => {
            if (this._setAceValue) return;
            const v = e.detail;
            if (this.mode === 'javascript')
                this.cell.sourceJS = v || '';
            if (this.mode === 'html')
                this.cell.sourceHTML = v || '';
            if (this.mode === 'css')
                this.cell.sourceCSS = v || '';
            if (this.mode === 'json')
                this._sourceJSON = this.cell.sourceJSON = v || '{}';
            this.listenIframe(true);
        })
        setTimeout(() => {
            const ace = this.$qs('li-editor-ace');
            ace.options = { highlightActiveLine: false, showPrintMargin: false, minLines: 1, fontSize: 16 };
            this.setAceValue();
            this.listenIframe(true);
        })
    }
    updated(changedProperties) {
        if (changedProperties.has('mode')) this.setAceValue();
    }
    setAceValue(mode = this.mode) {
        this._setAceValue = true;
        const ace = this.$qs('li-editor-ace');
        if (mode === 'javascript')
            ace.value = this.cell.sourceJS || '';
        if (mode === 'html')
            ace.value = this.cell.sourceHTML || '';
        if (mode === 'css')
            ace.value = this.cell.sourceCSS || '';
        if (mode === 'json')
            ace.value = this._sourceJSON || this.cell.sourceJSON || '{}';
        setTimeout(() => this._setAceValue = false, 100);
    }
    listenIframe(update) {
        setTimeout(() => {
            const iframe = this.$qs('iframe');
            iframe.srcdoc = update ? this.srcdoc : iframe.srcdoc || this.srcdoc;
            setTimeout(() => {
                iframe.contentDocument?.addEventListener("changeJSON", (e) => {
                    this._sourceJSON = this.cell.sourceJSON = e.detail;
                    if (this.mode === 'json') {
                        this.setAceValue();
                        // console.log('..... changeJSON from iFrame: ', e.detail)
                        this.$update();
                    }
                })
            }, 500)
            this.$update();
        }, 100)
    }
})

class LiJupyterCellTemp extends LiElement {
    static get styles() { return [editorCSS, css``] }

    render() {
        return html`
            ${this.readOnly || this.editedIndex !== this.idx ? html`
                <div .innerHTML=${this.cell.source} style="width: 100%; padding: 8px;"></div>
            ` : html`
                <div style="display: flex; overflow: hidden; width: 100%">
                    <div style="width: 50%; height: ${this._h}vh; overflow: hidden; position: relative;">
                        <iframe style="border: none; width: 100%; height: 80vh;"></iframe>
                    </div>
                    <li-splitter size="3" color="dodgerblue" style="opacity: .3"></li-splitter>
                    <div style="flex: 1; height: 80vh; overflow: auto">
                        <div .innerHTML=${this.cell?.source} style="width: 100%"></div>
                    </div>
                </div>
            `}
        `
    }

    static get properties() {
        return {
            jupyter: { type: Object, local: true },
            readOnly: { type: Boolean, local: true },
            idx: { type: Number },
            cell: { type: Object },
            _h: { type: Number, default: 0 },
            editedIndex: { type: Number, local: true, notify: true }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        // this.listen('change', (e) => this.cell.source = e.detail);
        this.listen('editedIndex-changed', () => {
            if (this.editedIndex >= 0 && this.editedIndex === this.idx) {
                requestAnimationFrame(() => {
                    const iframe = this.$qs('iframe');
                    iframe.srcdoc = this.srcdoc;
                    setTimeout(() => (iframe.contentDocument || iframe.contentWindow)
                        .addEventListener("change", (e) => {
                            if (e.detail !== undefined)
                                this.cell.source = e.detail;
                                this.fire('change', e.detail)
                            this.$update();
                        }), 1000);
                    this._h = 80;
                })
            }
        })
    }
}

customElements.define('li-jupyter-cell-html-cde', class LiJupyterCellHtmlCDE extends LiJupyterCellTemp {
    get srcdoc() {
        return `
<style>
    html::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); } ::-webkit-scrollbar-thumb { border-radius: 10px; }
</style>
<div id="editor" style="height: 800px; overflow: hidden">${this.cell?.source || ''}</div>
<script src="https://cdn.ckeditor.com/4.17.2/full/ckeditor.js"></script>
<script>
    let editor = CKEDITOR.replace('editor');
    editor.on('change', (e) => {
        document.dispatchEvent(new CustomEvent('change', { detail: e.editor.getData() }));
    })
    editor.on('instanceReady', (e) => {
        if(e.editor.getCommand('maximize').state==CKEDITOR.TRISTATE_OFF) e.editor.execCommand('maximize');
    }) 
</script>
    `}
})

customElements.define('li-jupyter-cell-html-jodit', class LiJupyterCellHtmlJodit extends LiJupyterCellTemp {
    get srcdoc() {
        return `
<style>
    ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); } ::-webkit-scrollbar-thumb { border-radius: 10px; }
body, html { 
    margin: 0;
    min-width: 100%;
    min-height: 100%;
}
</style>
<textarea id="editor" name="editor">${this.cell?.source || ''}</textarea>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jodit/3.13.4/jodit.es2018.min.css"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jodit/3.13.4/jodit.es2018.min.js"></script>
<script type="module">
    const editor = Jodit.make('#editor', {
        toolbarButtonSize: "small",
        fullsize: true
    });
    editor.events.on('change.textLength', (e) => {
        document.dispatchEvent(new CustomEvent('change', { detail: e }));
    })
</script>
    `}
})

customElements.define('li-jupyter-cell-html-tiny', class LiJupyterCellHtmlTiny extends LiJupyterCellTemp {
    get srcdoc() {
        return `
<style> 
    ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); } ::-webkit-scrollbar-thumb { border-radius: 10px; }
    body, html { 
        margin: 0; 
    }
</style>
<textarea name="content" id="mytextarea">${this.cell?.source || ''}</textarea>
<script src="https://cdn.tiny.cloud/1/0dmt0rtivjr59ocff6ei6iqaicibk0ej2jwub5siiycmlk84/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>

<script type="module">
    const useDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    tinymce.init({
        selector: 'textarea#mytextarea',
        plugins: 'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons',
        editimage_cors_hosts: ['picsum.photos'],
        menubar: 'file edit view insert format tools table help',
        toolbar: 'undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
        height: '100vh',
        image_caption: true,
        quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
        noneditable_class: 'mceNonEditable',
        toolbar_mode: 'sliding',
        contextmenu: 'link image table',
        skin: useDarkMode ? 'oxide-dark' : 'oxide',
        content_css: useDarkMode ? 'dark' : 'default',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
        setup: (editor) => {
            editor.on('change', () => { document.dispatchEvent(new CustomEvent('change', { detail: editor.getContent() })) });
            editor.on('keyup', () => { document.dispatchEvent(new CustomEvent('change', { detail: editor.getContent() })) });
        },
    });
</script>
    `}
})
