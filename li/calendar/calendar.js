import { LiElement, html, css } from '../../li.js';
import '../button/button.js';

customElements.define('li-calendar', class LiCalendar extends LiElement {

    static get styles() {
        return css`
            :host {
                position: relative;
                color: #505050;
            }
            .box {
                position: sticky;
                top: 34px;
                background-color: #eee;
                display: flex;
                flex-wrap: wrap;
                border: 1px solid lightgray;
                margin: 0 4px 4px 4px;
                color: #505050; 
                z-index: 1;
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
            <div style="position: sticky; top:0 ;height: 28px; background-color: white; z-index: 1; padding: 3px; display: flex;align-items: center">
                <div style="cursor: pointer;" @click="${this._clickSelected}">${this._periods}</div>
                <div style="flex: 1"></div>
                <li-button @click="${this._clickCurrent}" name="center-focus-strong" title="show current month"></li-button>
            </div>
            <div class="box">
                ${['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'].map(i => html`<div class="cell">${i}</div>`)}
            </div>
            ${this.items.map(i => html`<li-calendar-month .item = ${i} id="${i.str}"></li-calendar-month>`)}
        `
    }

    static get properties() {
        return {
            items: { type: Array, default: [] },
            period: { type: Array, local: true },
        }
    }
    get _periods() {
        if (!this.period) return '';
        const p0 = this.period[0].split('-').reverse().join('-');
        if (this.period[0] === this.period[1]) return p0;
        const p1 = this.period[1].split('-').reverse().join('-');
        return p0 + ' ... ' + p1;
    }

    constructor() {
        super();
        this.items = [];
        const currentYear = new Date().getFullYear(),
            startYear = currentYear - 1,
            endYear = currentYear + 1;
        for (let y = startYear; y <= endYear; y++) {
            for (let m = 0; m < 12; m++) {
                this.items.push({ date: new Date(y, m), str: LI.dates(new Date(y, m)).monthStr, m, y });
            }
        }

    }
    firstUpdated() {
        super.firstUpdated();
        this.currentDate = LI.dates().short;
        this.period = this.period || [this.currentDate, this.currentDate];
        setTimeout(() => this._clickCurrent(), 100);
    }

    _clickSelected(e) {
        this.$id[LI.dates(new Date(this.period?.[0])).monthStr].scrollIntoView();
        this._scroll();
    }
    _clickCurrent(e) {
        this.$id[LI.dates().monthStr].scrollIntoView();
        this._scroll();
    }
    _scroll() {
        this.parentElement.scrollTo({
            top: this.parentElement.scrollTop - 80,
            behavior: "smooth"
        })
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
                position: relative;
                display: flex;
                flex-wrap: wrap;
                border: 1px solid lightgray;
                margin: 4px;
            }
            .month {
                margin: 8px;
                color: #505050;
                cursor: pointer;
            }
            .cell {
                width: calc(1/7 * 100%);
            }
        `;
    }

    render() {
        return html`
            ${!this.showMonth ? html`` : html`<div class="month" @click="${this._clickMonth}">${this.monthStr}</div>`}
            <div class="box">
                ${this.calendar.map(i => html`
                    <li-calendar-cell class="cell" .day="${i}" .year="${this.year}" .month="${this.month}" .days="${this.days}"></li-calendar-cell>
                `)}
            </div>
        `;
    }

    static get properties() {
        return {
            item: { type: Object },
            date: { type: Object },
            period: { type: Array, local: true },
            showMonth: { type: Boolean, default: true, reflect: true }
        }
    }
    get date() {
        return this._date = this._date || this.item?.date || thid.date || new Date();
    }
    get year() {
        return this._year = this._year = this.date.getFullYear();
    }
    get month() {
        return this._month = this._month = this.date.getMonth();
    }
    get days() {
        return new Date(this.year, this.month + 1, 0).getDate();
    }
    get weekday() {
        return new Date(this.year, this.month, 1).getDay() || 7;
    }
    get monthStr() {
        const m = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
        return m[this.month] + ', ' + this.year;
    }
    get calendar() {
        let arr = [...Array(this.weekday - 1).keys()].map(i => -1);
        arr = [...arr, ...Array(this.days).keys()];
        const length = arr.length > 28 && arr.length < 35 ? 35 - arr.length : arr.length > 35 ? 42 - arr.length : 0;
        if (length)
            arr = [...arr.map(i => i), ...[...Array(length).keys()].map(i => -1)];
        return [...arr.map(i => ++i)];
    }

    _clickMonth() {
        this.period[0] = LI.dates(new Date(this.year, this.month, 1)).short;
        this.period[1] = LI.dates(new Date(this.year, this.month, this.days)).short;
        this.$update();
    }

})

customElements.define('li-calendar-cell', class extends LiElement {

    static get styles() {
        return css`
            :host {
                position: relative;
            }
            .cell {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 40px;
            }
            .date:hover {
                filter: brightness(.75) contrast(200%);
            }
            .marker {
                position: absolute; 
                bottom: 0;
                width: 12px; 
                height: 12px; 
                border-radius: 50%;
                cursor: pointer;
            }
            .start {
                left: 0;
                background-color: lightgreen;
            }
            .end {
                right: 0;
                background-color: lightblue;
            }
        `;
    }

    render() {
        return html`
            <div class="cell ${this.day > 0 ? 'date' : ''}" style="background-color: ${this.inPeriod ? '#ffa' : this.color}; 
                cursor: ${this.day > 0 ? 'pointer' : 'inset'}; box-shadow: ${this.isToday ? 'inset 0 0 4px 2px orange' : '0 0 1px 0 gray'}"
                @dragover="${this._dragover}" @drop="${this._drop}" @click="${this._click}">${this.day < 1 ? '' : this.day}</div>
            ${this.day < 1 || !this.isStart ? html`` : html`
                <div id="start" draggable="true" class="marker start" @dragstart="${this._dragstart}" @touchstart="${this._dragstart}"></div>
            `}
            ${this.day < 1 || !this.isEnd ? html`` : html`
                <div id="end" draggable="true" class="marker end" @dragstart="${this._dragstart}" ></div>
            `}
        `;
    }

    static get properties() {
        return {
            day: { type: Number, default: 0 },
            month: { type: Number },
            year: { type: Number },
            days: { type: Number, default: 0 },
            period: { type: Array, local: true },
            dragMarker: { type: Object, local: true }
        }
    }
    get isToday() {
        return this.day > 0 && LI.dates().short === this.dateStr;
    }
    get date() {
        return this._date = this._date = new Date(this.year, this.month, this.day);
    }
    get dateS() {
        if (this.period)
            return this._dateS = this._dateS = new Date(+this.period[0].split('-')[0], this.period[0].split('-')[1] - 1, +this.period[0].split('-')[2]);
    }
    get dateE() {
        if (this.period)
            return this._dateE = this._dateE = new Date(+this.period[1].split('-')[0], this.period[1].split('-')[1] - 1, +this.period[1].split('-')[2]);
    }
    get dateStr() {
        return this._dateStr = this._dateStr = LI.dates(this.date).short;
    }
    get isStart() {
        return this.day > 0 && this.period && this.dateStr === this.period?.[0];
    }
    get isEnd() {
        return this.day > 0 && this.period && this.dateStr === this.period?.[1];
    }
    get inPeriod() {
        return this.day > 0 && this.date >= this.dateS && this.date <= this.dateE;
    }
    get color() {
        return `hsla(${this.month * 25}, 70%, 70%, 0.2)`;
    }

    _dragstart(e) {
        this.dragMarker = { id: e.target.id, date: this.date, s: new Date(this.period[0]), e: new Date(this.period[1]) };
    }
    _dragover(e) {
        if (this.day > 0) {
            if (this.dragMarker?.id === 'start' && this.date < this.dragMarker.e)
                e.preventDefault();
            if (this.dragMarker?.id === 'end' && this.date > this.dragMarker.s)
                e.preventDefault();
        }
    }
    _drop(e) {
        e.preventDefault();
        if (this.day > 0) {
            if (this.dragMarker?.id === 'start')
                this.period[0] = this.dateStr;
            if (this.dragMarker?.id === 'end')
                this.period[1] = this.dateStr;
            this.$update();
        }
    }
    _click(e) {
        if (this.day > 0) {
            this.period[0] = this.period[1] = this.dateStr;
            this.$update();
        }
    }

})
