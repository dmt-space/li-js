import { LiElement, html, css } from '../../li.js';

import '../checkbox/checkbox.js';
import '../button/button.js';
import '../table/table.js';
import '../../lib/pouchdb/pouchdb.js';

customElements.define('li-dma', class LiDma extends LiElement {

    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                flex-wrap: wrap;
                width: calc(100% - 2px);
                padding: 8px;
                box-sizing: border-box;
            }
            .container {
                display: flex;
                flex-wrap: wrap;
                width: 100%;
                box-sizing: border-box;
            }
            label {
                padding: 4px;
            }
            input {
                color: gray;
                margin: 4px;
                font-size: 18px;
            }
        `;
    }

    render() {
        return html`
            <div class="container">
                <img src="dma.png" style="max-width: 100%; padding: 8px; flex: .5; border: 1px solid lightgray; margin: auto; justif-content: center; box-sizing: border-box">
                <div style="display: flex; flex: 1; flex-direction: column">
                    <label style="font-weight: 600;">Входные данные:</label>
                    <div style="display: flex; flex-direction: column; flex: 1; border: 1px solid lightgray; margin: 2px;">
                        <label>Внутренний диаметр (дюйм):</label>
                        <input id="d1" .value=${this._d1} type="number" @change=${this._input} @blur=${this._input}>
                        <label>Внешний диаметр (дюйм):</label>
                        <input id="d2" .value=${this._d2} type="number" @change=${this._input} @blur=${this._input}>
                        <label>Внутренний диаметр (${this.edIzm}):</label>
                        <input id="d3" .value=${this._d3} type="number" @change=${this._input} @blur=${this._input}>
                        <label>Внешний диаметр (${this.edIzm}):</label>
                        <input id="d4" .value=${this._d4} type="number" @change=${this._input} @blur=${this._input}>
                        <div style="display: flex; align-items: center;">
                            <li-checkbox title="мм" .toggled=${this.edIzm === 'мм'} @change=${this._checked}></li-checkbox>мм
                            <li-checkbox title="см" .toggled=${this.edIzm === 'см'} @change=${this._checked}></li-checkbox>см
                        </div>
                        <div style="display: flex; align-items: center;">
                            <li-checkbox id="ratio" .toggled=${this.ratio} @change=${this._checked}></li-checkbox>Внешний / внутренний = 3.326
                        </div>
                        <label>Диаметр провода с изоляцией (мм):</label>
                        <input id="d0" .value=${this.d0} type="number" @change=${this._input} @blur=${this._input}>
                        <label>Марка провода:</label>
                        <input .value=${this.type} @change=${e => this.type = e.target.value}>
                    </div>
                </div>
                <div style="display: flex; flex: 1; flex-direction: column">
                    <label style="font-weight: 600;">Расчетные данные:</label>
                    <div style="display: flex; flex-direction: column; flex: 1; border: 1px solid lightgray; margin: 2px;">
                        <label>Количество витков (пара):</label>
                        <input .value=${this._turn || ''} readonly>
                        <label>Длина 1-го провода* (м):</label>
                        <input .value=${this._length} readonly>
                        <label style="font-size: 14px">* - без учета отводов</label>
                    </div>
                    <label style="font-weight: 600;">Результаты измерений:</label>
                    <div style="display: flex; flex-direction: column; flex: 1; border: 1px solid lightgray; margin: 2px; min-width: 240px">
                        <label>Частота (кгц):</label>
                        <input .value=${this.frequency || ''} @change=${e => this.frequency = e.target.value}>
                        <label>Автор:</label>
                        <input .value=${this.author || ''} @change=${e => this.author = e.target.value}>
                        <li-button id="add" width="100%" style="flex: 1; margin: 6px;" @click=${this._tap}>Добавить в таблицу</li-button>
                    </div>
                </div>
            </div>
            <div style="display: flex; flex: 1; padding: 4px">
                ${this.data?.rows?.length ? html`
                    <li-button id="export" width="200" @click=${this._tap}>Экспортировать таблицу</li-button>
                ` : html``}
                <li-button id="refresh" name="refresh" title="отменить изменения" style="margin-left: auto" @click=${this._tap}></li-button>
                <li-button id="delete" name="close" title="удалить выбранную строку в таблице" @click=${this._tap}></li-button>
                <li-button id="save" name="save" title="сохранить" .fill="${this._needSave ? 'red' : ''}" .color="${this._needSave ? 'red' : 'gray'}" @click=${this._tap}></li-button>
            </div>
            <li-table id="dma-table" .data=${this.data}></li-table>
            <label>Импортирование таблицы:</label>
            <input type="file" id="import" @change=${this._tap}/>
        `;
    }

    static get properties() {
        return {
            dbName: { type: String, default: 'dma', save: true },
            d1: { type: Number, default: 1, save: true },
            d2: { type: Number, default: 9, save: true },
            d3: { type: Number, default: 25.4, save: true },
            d4: { type: Number, default: 228.6, save: true },
            d0: { type: Number, default: 1, save: true },
            edIzm: { type: String, default: 'мм', save: true },
            type: { type: String, default: '', save: true },
            ratio: { type: Boolean, default: false, save: true },
            author: { type: String, default: 'user', save: true },
            frequency: { type: String, default: '', save: true },
            action: { type: Object, global: true },
            _changedList: { type: Object },
        }
    }
    get row() {
        return {
            frequency: this.frequency,
            d3: this._d3,
            d4: this._d4,
            edIzm: this.edIzm,
            d0: this.d0,
            type: this.type,
            turn: this._turn,
            length: this._length,
            date: LI.dates(new Date()).short,
            author: this.author,
            _id: 'dma:' + LI.ulid()
        }
    }
    get data() {
        if (this._data) return this._data;
        this._data = {
            options: [

            ],
            columns: [
                { name: '$idx', label: '№', width: 60 },
                { name: 'frequency', label: 'Частота (кГц)', width: 100 },
                { name: 'd3', label: 'Внутр.D', width: 80 },
                { name: 'd4', label: 'Внеш.D', width: 80 },
                { name: 'edIzm', label: 'Ед.Изм', width: 70 },
                { name: 'd0', label: 'Провод (мм)', width: 100 },
                { name: 'type', label: 'Марка', width: 100 },
                { name: 'turn', label: 'Кол.витков', width: 90 },
                { name: 'length', label: 'Длина (м)', width: 100 },
                { name: 'date', label: 'Дата', width: 120 },
                { name: 'author', label: 'Автор', width: 120 },
                { name: 'rating', label: 'Оценка', typeColumn: 'rating', width: 120 },
                { name: 'note', label: 'Примечание', minWidth: 100, textAlign: 'left' },
            ],
            rows: this._rows || []
        }
        return this._data;
    }
    get _d1() {
        return Number(this.d1).toFixed(3);
    }
    get _d2() {
        return Number(this.d2).toFixed(3);
    }
    get _d3() {
        return (Number(this.d3 / (this.edIzm === 'мм' ? 1 : 10))).toFixed(2);
    }
    get _d4() {
        return (Number(this.d4 / (this.edIzm === 'мм' ? 1 : 10)).toFixed(2));
    }
    get _turn() {
        return Number((this.d4 - this.d3) / 4 / (this.d0 || 1)).toFixed(2);
    }
    get _length() {
        const pi = 3.14159265359;
        let l = 0, d = this.d3;
        for (let i = 0; i <= this._turn; i++) {
            l = l + pi * (d + i * this.d0 * 4);
        }
        return (l / 1000).toFixed(3);
    }
    get _needSave() {
        return this._changedList?.size;
    }

    updated(e) {
        if (e.has('action') && this.action) {
            if (this.action.action === 'tableCellChanged' && this.$ulid !== this.action.ulid && this.action.row?._id) {
                this._changedList = this._changedList || new Map();
                this._changedList.set(this.action.row._id, this.action.row);
                this.$update();
            }
        }
    }
    firstUpdated() {
        super.firstUpdated();
        this._changedList = new Map();
        this.listen('tableRowSelect', (e) => {
            this._focusedRow = e.detail.row;
            this.$update();
        });
        setTimeout(async () => {
            this._dbName = window.location.href.split('#')?.[1];
            this.dbName = this._dbName || this.dbName || 'dma';
            this.dbLocal = new PouchDB(this.dbName);
            this._loadAll();
        }, 100);
    }

    async _loadAll() {
        this._rows = [];
        let items = await this.dbLocal.allDocs({ include_docs: true });
        items.rows.forEach(i => this._rows.push(i.doc));
        this._data = undefined;
        this.$update();
    }

    _checked(e) {
        if (e.target.title === 'мм' || e.target.title === 'см') {
            this.edIzm = e.target.title;
            e.target.toggled = true;
        } else if (e.target.id === 'ratio') {
            this.ratio = e.target.toggled;
            if (this.ratio) {
                if (this.d2 > 0) {
                    this.d1 = this.d2 / 3.326
                    this.$id('d1').value = this._d1;
                    this._input('', 'd1', this.d1);
                } else if (this.d1 > 0) {
                    this.d2 = this.d1 * 3.326
                    this.$id('d2').value = this._d2;
                    this._input('', 'd2', this.d2);
                }
            }
        }
        this.$update();
    }
    _input(e, id, val) {
        id = id || e?.target?.id;
        val = val || e?.target?.value;
        switch (id) {
            case 'd0':
                this.d0 = val;
                break;
            case 'd1':
                this.d1 = val;
                this.d3 = val * 25.4;
                this.$id(id).value = this._d1;
                if (this.ratio && !this._step) {
                    this._step = true;
                    this.d2 = this.d1 * 3.326;
                    this._input('', 'd2', this.d2);
                }
                break;
            case 'd2':
                this.d2 = val;
                this.d4 = val * 25.4;
                this.$id(id).value = this._d2;
                if (this.ratio && !this._step) {
                    this._step = true;
                    this.d1 = this.d2 / 3.326;
                    this._input('', 'd1', this.d1);
                }
                break;
            case 'd3':
                this.d3 = val * (this.edIzm === 'мм' ? 1 : 10);
                this.d1 = this.d3 / 25.4;
                this.$id(id).value = this._d3;
                if (this.ratio && !this._step) {
                    this._step = true;
                    this.d4 = this.d3 * 3.326
                    this._input('', 'd4', this.d4);
                }
                break;
            case 'd4':
                this.d4 = val * (this.edIzm === 'мм' ? 1 : 10);
                this.d2 = this.d4 / 25.4;
                this.$id(id).value = this._d4;
                if (this.ratio && !this._step) {
                    this._step = true;
                    this.d3 = this.d4 / 3.326;
                    this._input('', 'd3', this.d3);
                }
                break;
            default:
                break;
        }
        this._step = false;
        this.$update();
    }
    async _tap(e) {
        this._changedList = this._changedList || new Map();
        switch (e.target.id) {
            case 'add':
                let row = this.row;
                this._changedList.set(row._id, row);
                this._data.rows.push(row);
                this.$id('dma-table')._setRows();
                break;
            case 'delete':
                if (this._focusedRow) {
                    this._focusedRow._deleted = true;
                    this._changedList.set(this._focusedRow._id, this._focusedRow);
                    this.action = undefined;
                    this.action = {
                        id: `dma-table`,
                        fn: '_deleteRow'
                    }
                }
                break;
            case 'save':
                if (this._changedList?.size) {
                    const res = [];
                    this._changedList.forEach(i => res.push(i));
                    await this.dbLocal.bulkDocs(res);
                    this._loadAll();
                    this._changedList = new Map();
                }
                break;
            case 'refresh':
                this._loadAll();
                this._changedList = new Map();
                break;
            case 'export':
                const content = new Blob([JSON.stringify(this.data.rows)], { type: 'text/plain' });
                const a = document.createElement("a");
                const file = new Blob([content], { type: 'text/plain' });
                a.href = URL.createObjectURL(file);
                a.download = this.dbName + '.json';
                a.click();
                break;
            case 'import':
                if (window.confirm(`Do you really want rewrite current Database ?`)) {
                    let file = e.target.files[0];
                    if (file) {
                        await this.dbLocal.destroy(async (err, response) => {
                            if (err) return console.log(err);
                            else console.log("Local Database Deleted");
                        });
                        const reader = new FileReader();
                        reader.onload = async ({ target: { result } }) => {
                            result = JSON.parse(result);
                            result.map(i => { if (i._rev) delete i._rev });
                            this.dbLocal = new PouchDB(this.dbName);
                            await this.dbLocal.bulkDocs(result, { new_edits: true }, (...args) => { this.$update(); console.log('DONE', args) });
                            setTimeout(() => document.location.reload(), 500);
                        };
                        reader.readAsText(file);
                    }
                }
                break;
            default:
                break;
        }
        this.$update();
    }
});
