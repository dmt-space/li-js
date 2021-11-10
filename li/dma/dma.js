import { LiElement, html, css } from '../../li.js';

import '../checkbox/checkbox.js';
import '../button/button.js';
import '../table/table.js';

customElements.define('li-dma', class LiDma extends LiElement {

    static get styles() {
        return css`
            :host {
                display: flex;
                flex-wrap: wrap;
                width: 100%;
                padding: 8px;
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
            <img src="dma.png" style="max-width: 100%; padding: 8px; fLex: .5; border: 1px solid lightgray; margin: 4px; justif-content: center; box-sizing: border-box">
            <div style="display: flex; flex: 1; flex-direction: column">
                <label style="font-weight: 600;">Входные данные:</label>
                <div style="display: flex; flex-direction: column; flex: 1; border: 1px solid lightgray; margin: 2px;  min-width: 240px">
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
                <div style="display: flex; flex-direction: column; flex: 1; border: 1px solid lightgray; margin: 2px; min-width: 240px">
                    <label>Количество витков (пара):</label>
                    <input .value=${this._turn} readonly>
                    <label>Длина 1-го провода (м):</label>
                    <input .value=${this._length} readonly>
                </div>
                <label style="font-weight: 600;">Результаты измерений:</label>
                <div style="display: flex; flex-direction: column; flex: 1; border: 1px solid lightgray; margin: 2px; min-width: 240px">
                    <label>Частота (кгц):</label>
                    <input>
                    <label>Автор:</label>
                    <input .value=${this.author}>
                    <li-button width="100%" style="flex: 1; margin: 6px;">Добавить в таблицу</li-button>
                </div>
            </div>
            <li-table .data=${this.data}></li-table>
        `;
    }

    static get properties() {
        return {
            d1: { type: Number, default: 1, save: true },
            d2: { type: Number, default: 9, save: true },
            d3: { type: Number, default: 25.4, save: true },
            d4: { type: Number, default: 228.6, save: true },
            d0: { type: Number, default: 1, save: true },
            turn: { type: Number, default: 0, save: true },
            edIzm: { type: String, default: 'мм', save: true },
            type: { type: String, default: '', save: true },
            ratio: { type: Boolean, default: false, save: true },
            author: { type: String, default: 'user', save: true },
        }
    }
    get data() {
        return {
            options: [

            ],
            columns: [
                { label: '№', name: '$idx', width: 60 },
                { label: 'col-001', name: 'c1', width: 150 },
                { label: 'col-002', name: 'c2', width: 250 },
                { label: 'col-003', name: 'c3' },
                { label: 'col-004', name: 'c4' },
                { label: 'col-005', name: 'c5', width: 120 },
                { label: '', name: '' },
            ]
        }
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
        let l = 0;
        for (let i = 0; i < this._turn; i += this.d0) {

        }
    }

    connectedCallback() {
        super.connectedCallback();

    }

    firstUpdated() {
        super.firstUpdated();

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
});
