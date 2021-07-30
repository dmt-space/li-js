import { LiElement, html, css } from '../../li.js';

customElements.define('li-calendar', class LiCalendar extends LiElement {

    static get styles() {
        return css`
            :host {
                position: relative;
            }
            .box {
                position: sticky;
                top: 4px;
                background-color: #eee;
                display: flex;
                flex-wrap: wrap;
                border: 1px solid lightgray;
                margin: 0 4px 4px 4px;
            }
            .cell {
                display: flex;
                align-items: center;
                justify-content: center;
                width: calc(1/7 * 100%);
                height: 40px;
                box-shadow: 0 0 1px 0 gray;
            }
        `;
    }

    render() {
        return html`
        <div style="position: sticky; top:0 ;height: 4px; background-color: white; z-index: 1;"></div>
        <div class="box" style="margin-bottom: 2px; color: #505050; z-index: 1;">
            ${['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'].map(i => html`
                <div class="cell">${i}</div>
            `)}
        </div>
        ${this.items.map(i => html`
            <li-calendar-month .item = ${i}></li-calendar-month>
        `)}
            
        `
    }

    static get properties() {
        return {
            items: { type: Array, default: [] }
        }
    }

    constructor() {
        super();
        this.items = [];
        const endYear = new Date().getFullYear() + 1;
        for (let y = 2020; y <= endYear; y++) {
            for (let m = 0; m < 12; m++) {
                this.items.push({ date: new Date(y, m) });
            }
        }

    }
    firstUpdated() {
        super.firstUpdated();

    }
    updated(changedProperties) {

    }

})

customElements.define('li-calendar-month', class LiCalendarMonth extends LiElement {

    static get styles() {
        return css`
            :host{
                font-family: Arial;
                color: gray;
            }
            .box {
                display: flex;
                flex-wrap: wrap;
                border: 1px solid lightgray;
                margin: 4px;
            }
            .cell {
                display: flex;
                align-items: center;
                justify-content: center;
                width: calc(1/7 * 100%);
                height: 40px;
                box-shadow: 0 0 1px 0 gray;
                cursor: pointer;
            }
            .cell:hover {
                filter: brightness(0);
            }
            .month {
                margin: 8px;
                color: #505050;
            }
        `;
    }

    render() {
        return html`
            ${!this.showMonth ? html`` : html`<div class="month"> ${this.month}</div>`}
            <div class="box" style="background-color: ${this.color}">
                ${this.calendar.map(i => html`
                    <div class="cell">${i < 0 ? '' : i + 1}</div>
                `)}
            </div>
        `;
    }

    static get properties() {
        return {
            item: { type: Object },
            showMonth: { type: Boolean, default: true, reflect: true }
        }
    }
    get date() {
        this._date = this._date || this.item?.date || new Date();
        return this._date;
    }
    get days() {
        return new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDate();
    }
    get weekday() {
        return new Date(this.date.getFullYear(), this.date.getMonth(), 1).getDay();
    }
    get month() {
        const m = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
        return m[this.date.getMonth()] + ', ' + this.date.getFullYear();
    }
    get calendar() {
        let arr = [...Array(this.weekday >= 1 ? this.weekday - 1 : 6).keys()].map(i => -1);
        arr = [...arr, ...Array(this.days).keys()];
        const length = arr.length > 28 && arr.length < 35 ? 35 - arr.length : arr.length > 35 ? 42 - arr.length : 0;
        if (length)
            arr = [...arr, ...[...Array(length).keys()].map(i => -1)];
        return arr;
    }
    get color() {
        return `hsla(${this.date.getMonth() * 25}, 70%, 70%, 0.2`;
    }

    updated(changedProperties) {

    }

})