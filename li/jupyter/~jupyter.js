LI({ is: 'li-jupyter',
    template: /*html*/`
        <style>
            :host {
                @apply --flex;
                @apply --vertical;
                padding: 12px 0;
                position: relative;
                min-height: 28px;
            }
        </style>
        <li-jupyter-cell-addbutton ~if="!notebook?.cells?.length" style="position: absolute; top: 18px; left: 12px; z-index: 31;"></li-jupyter-cell-addbutton>
        <li-jupyter-cell ~for="cell in notebook?.cells" :cell :idx="index"></li-jupyter-cell>
    `,
    props: {
        url: {
            default: '',
            async set(n) {
                await this.loadURL(n);
            }
        },
        readOnly: false,
        focusedCell: {
            type: Object,
            set(v) {
                this.editedCell = undefined
            }
        },
        showBorder: false // show cell border for mode is not readOnly
    },
    notebook: {},
    editedCell: undefined,
    loadURL(url = this.url) {
        this.focusedCell = undefined;
        if (url) 
            fetch(url).then(response => response.json()).then(json => this.notebook = json);
    }
})

LI({ is: 'li-jupyter-cell',
    template: /*html*/`
        <style>
            :host {
                display: block;
                position: relative;
                margin: 6px 12px;
                order: {{cell?.order || 0}};
                box-shadow: {{!readOnly && showBorder ? 'inset 0px 0px 0px 1px lightgray' : ''}};
            }
            .focused {
                box-shadow: 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.4);
            }
        </style>
        <li-jupyter-cell-toolbar ~if="!readOnly && focusedCell===cell" :cell></li-jupyter-cell-toolbar>
        <div ~class="{focused: !readOnly && focusedCell===cell}" ~is="cellType" :id="'cell-'+cell?.order" @tap="focusedCell=cell" :cell></div>
        <li-jupyter-cell-addbutton ~if="!readOnly && cell && focusedCell===cell" :cell></li-jupyter-cell-addbutton>
        <li-jupyter-cell-addbutton ~if="!readOnly && cell && focusedCell===cell" :cell position="bottom"></li-jupyter-cell-addbutton>
    `,
    props: {
        idx: {
            type: Number,
            set(v) {
                this.cell.order = v;
            }
        }
    },
    cell: {},
    get cellType() {
        if (this.cell?.cell_type === 'markdown') return 'li-jupyter-cell-markdown';
        if (this.cell?.cell_type === 'html') return 'li-jupyter-cell-html';
        if (this.cell?.cell_type === 'code') return 'li-jupyter-cell-code';
        return 'div';
    }
})

LI({ is: 'li-jupyter-cell-toolbar', imports: '@LI/button',
    template: /*html*/`
        <style>
            :host {
                display: flex;
                position: absolute;
                right: 8px;
                top: -12px;
                z-index: 21;
                box-shadow: 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.4);
                background: white;
                width: 200px;
                height: 24px;
            }
            li-button {
                border-radius: 3px;
                margin: 2px 0px;
            }
        </style>
        <li-button icon="icons:close" :icon-size @tap="focusedCell=undefined"></li-button>
        <li-button icon="icons:arrow-back:90" :icon-size @tap="tapOrder($event, -1.1)" :disabled="cell.order<=0" title="move up"></li-button>
        <li-button icon="icons:arrow-forward:90" :icon-size @tap="tapOrder($event, 1.1)" :disabled="cell.order>=notebook?.cells?.length-1" title="move down"></li-button>
        <li-button icon="icons:select-all" :icon-size title="show cells border" @tap="showBorder=!showBorder" allow-tooglle ::toggled="showBorder"></li-button>
        <li-button icon="editor:mode-edit" :icon-size @tap="editedCell=editedCell===cell?undefined:cell" ~style="{fill: editedCell===cell ? 'red' : ''}" title="edit mode"></li-button>
        <li-button ~if="editedCell===cell" icon="icons:settings" :icon-size></li-button>
        <div class="flex"></div>
        <li-button icon="icons:delete" :icon-size @tap="tapDelete" title="delete"></li-button>
    `,
    iconSize: 14,
    cell: {},
    tapOrder(e, v) {
        if (this.focusedCell !== this.cell) return;
        const ord = this.cell.order = this.cell.order + v;
        this.notebook.cells.sort((a, b) => a.order - b.order).map((i, idx) => i.order = idx - 1.1 <= ord ? idx : idx + 1);
    },
    tapDelete() {
        if (['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫️', '⚪️'].includes(this.cell.source.slice(0, 2)) || this.cell.source === ' ' || !this.cell.source) {
            this.notebook.cells.splice(this.cell.order, 1);
            this.notebook.cells.sort((a, b) => a.order - b.order).map((i, idx) => i.order = idx);
            this.focusedCell = this.notebook.cells[(this.cell.order > this.notebook.cells.length - 1) ? this.notebook.cells.length - 1 : this.cell.order];
        }
    }
})

LI({ is: 'li-jupyter-cell-addbutton', imports: '@LI/button, @tools/containers',
    template: /*html*/`
        <style>
            .btn {
                display: flex;
                position: absolute;
                left: -8px;
                z-index: 21;
                border: 1px solid lightgray;
                border-radius: 50%;
                background: white;
                opacity: 0.7;
                top: {{ position==='top' ? '-12px' : 'unset' }};
                bottom: {{ position!=='top' ? '-12px' : 'unset' }};
            }
            .btn:hover {
                opacity: 1;
            }
            .cell {
                position: absolute;
                top: -12px;
                left: 20px;
                z-index: 21;
                font-size: 10px;
                cursor: pointer;
            }
        </style>
        <li-button class="btn" icon="icons:add" :icon-size title="add cell" @tap="showCellViews('add')"></li-button>
        <div ~if="position==='top'" class="cell" @tap="showCellViews('select type')" title="select cell type" ~style="color: ${this.cell?.color || 'gray'}">{{cell.label || cell.cell_type}}</div>
    `,
    props: {
        position: 'top'
    },
    iconSize: 14,
    cell: {},
    async showCellViews(view) {
        const res = await LI.showDropdown('li-jupyter-list-views', { cell: this.cell, notebook: this.notebook, position: this.position, view }, {});
        if (res && view === 'add') this.editedCell = undefined;
    }
})

LI({ is: 'li-jupyter-list-views', imports: '@LI/button',
    template: /*html*/`
        <style>
            :host {
                @apply --vertical;
                min-width: 140px;
            }
        </style>
        <div class="header flex" style="text-align: center; padding: 1px; width: 100%">{{view}} cell</div>
        <li-button class="horizontal flex" ~for="cellViews" @tap="addCell(item)" style="justify-content: start">{{item.source + item.label}}</li-button>
    `,
    props: {
        position: 'top',
        view: 'add'
    },
    iconSize: 14,
    cell: {},
    notebook: {},
    get cellViews() { 
        return [
            { cell_type: 'markdown', cell_extType: 'md', color: '#F7630C', source: '🟠... ', label: 'md' },
            { cell_type: 'html', cell_extType: 'html', color: '#16C60C', source: '🟢... ', label: 'html' },
            { cell_type: 'code', cell_extType: 'code', color: '#0078D7', source: '🔵... ', label: 'code' },
        ]
    },
    addCell(item) {
        const idx = this.cell?.order || 0;
        if (this.view === 'add') {
            const ord = this.position === 'top' ? idx - .1 : idx + .1;
            const cell = { order: ord, cell_type: item.cell_type, cell_extType: item.cell_extType, source: item.source, color: item.color, label: item.label };
            this.notebook.cells ||= [];
            this.notebook.cells.splice(idx, 0, cell);
            this.notebook.cells.sort((a, b) => a.order - b.order).map((i, idx) => i.order = idx - .1 <= ord ? idx : idx + 1);
        } else if (this.view === 'select type') {
            const cell = { ...this.cell, ...{ cell_type: item.cell_type, cell_extType: item.cell_extType, color: item.color, label: item.label  } };
            this.notebook.cells.splice(idx, 1, cell);
        }
        this.fire('ok');
    }
})

LI({ is: 'li-jupyter-cell-markdown', imports: '@LI/md-viewer, @LI/ace-editor, @LI/splitter',
    template: /*html*/`
        <style>
            ::-webkit-scrollbar { width: 4px; height: 4px; }
            ::-webkit-scrollbar-track { -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); }
            ::-webkit-scrollbar-thumb { border-radius: 10px; background: var(--body-background); -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5); }
            :host {
                @apply --horizontal;
                @apply --flex;
                min-height: 28px;
                height: 100%;
                max-height: {{!readOnly&&editedCell===cell ? '80vh' : ''}};
            }
        </style>
        <div class="flex" ~show="!readOnly&&editedCell===cell" style="min-width: 50%; overflow: auto;">
            <li-ace-editor class="flex ace" highlight-active-line="false" show-print-margin="false" theme="solarized_light" mode:markdown show-gutter="false" min-lines=1></li-ace-editor></li-ace-editor>
        </div>
        <!-- <li-splitter class="no-flex" ~if="!readOnly&&editedCell===cell" style="width: 4px;"></li-splitter> -->
        <div class="flex" style="min-width: 50%; overflow: auto">
            <li-md-viewer class="flex" :srcmd="cell?.source" :src="cell?.src"></li-md-viewer>
        </div>
    `,
    cell: {},
    listeners: {
        change(e) {
            if (this.readOnly || this.editedCell !== this.cell) return;
            //this.debounce('changeCellValue', () => {
                this.cell.source = this.$('li-ace-editor').value;
            //}, 1000);
        },
        dblclick(e) {
            if (this.readOnly) return;
            this.editedCell = this.editedCell === this.cell ? undefined : this.cell;
        }
    },
    observers: [
        function setEditedCell(editedCell) {
            if (editedCell && editedCell === this.cell)
                this.$('li-ace-editor').value = this.$('li-md-viewer').source;
        }
    ]
})

LI({ is: 'li-jupyter-cell-code', imports: '@LI/ace-editor',
    template: /*html*/`
        <style>
            :host {
                position: relative;
                @apply --horizontal;
                @apply -- flex;
                border: 1px solid #eee;
                padding: 4px;
            }
            .box {
                width: 24px;
                cursor: pointer;
                align-self: flex-start;
                padding-right: 4px;
            }
            .ace {
                height: unset;
            }
        </style>
        <div class="box vertical no-flex">
            <div>[...]</div>
        </div>
        <li-ace-editor class="flex ace" :value="cell?.source" highlight-active-line="false" show-print-margin="false" :theme="!readOnly&&editedCell===cell?'solarized_light':'dawn'" min-lines=1 :read-only="isReadOnly && editedCell!==cell"></li-ace-editor>
    `,
    cell: {},
    listeners: {
        change(e) {
            if (!this.isReadOnly || this.editedCell === this.cell) 
            this.cell.source = this.$('li-ace-editor').value;        
        },
        dblclick(e) {
            if (this.readOnly) return;
            this.editedCell = this.editedCell === this.cell ? undefined : this.cell;
        }
    },
    get isReadOnly() {
        return this.cell?.cell_props?.readOnly;
    }
})

LI({ is: 'li-jupyter-cell-html', imports: '@LI/pell-editor',
    template: /*html*/`
        <style>
            :host {
                @apply --horizontal;
                @apply --flex;
                min-height: 28px;
            }

        </style>
        <li-pell-editor class="flex pell" ~show="!readOnly&&editedCell===cell" :pell></li-pell-editor>
        <div  ~show="editedCell!==cell" :html="cell.source" style="width: 100%; padding: 8px;"></div>
    `,
    cell: {},
    listeners: {
        change(e) {
            if (this.readOnly || this.editedCell !== this.cell) return;
            this.cell.source = e.detail.value;
        },
        dblclick(e) {
            if (this.readOnly) return;
            this.editedCell = this.editedCell === this.cell ? undefined : this.cell;
        }
    },
    observers: [
        function setEditedCell(editedCell) {
            if (editedCell && editedCell === this.cell)
                this.$('li-pell-editor').editor.content.innerHTML = this.cell.source;
        }
    ]
})
