import {
    LiElement,
    html,
    css
} from 'https://resu062.github.io/li-js/li.js';

customElements.define('li-apps', class LiApps extends LiElement {
    static get styles() {
        return css`
            :host { 
                color: blue;
                flex: 1;
                margin: 4px 6px 4px 4px;
                padding: 4px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            div {
                padding: 2px;
                font-size: 24px;
            }
        `;
    }

    render() {
        return html`
            <h2>${this.txt}</h2>
            <li-date-to-circle type="day" size="140" fontSize="28"></li-date-to-circle>
            <div>
                <li-date-to-circle type="hour"></li-date-to-circle>
                <li-date-to-circle type="min"></li-date-to-circle>
                <li-date-to-circle type="sec"></li-date-to-circle>
                <li-date-to-circle></li-date-to-circle>
            </div>
            <div>секунд: ${this.s}</div>
            <div>минут: ${this.mn}</div>
            <div>часов: ${this.h}</div>
            <div>недель: ${this.w}</div>
            <div>месяцев: ${this.m}</div>
        `
    }

    static get properties() {
        return {
            txt: { type: String, default: 'до 19 декабря 2022 года осталось :' },
            dates: { type: String, default: '2022-12-19' },
            s: { type: Number },
            mn: { type: Number },
            h: { type: Number },
            d: { type: Number },
            w: { type: Number },
            m: { type: Number },
        }
    }
    constructor() {
        super();
        let end = (new Date(this.dates)).getTime();
        setInterval(() => {
            let today = (new Date()).getTime();
            this.s = Math.round((end - today) / 1000);
            this.mn = Math.round((end - today) / 1000 / 60);
            this.h = Math.round((end - today) / 1000 / 60 / 60);
            this.d = Math.round((end - today) / 1000 / 60 / 60 / 24);
            this.w = Math.round((end - today) / 1000 / 60 / 60 / 24 / 7);
            this.m = Math.round((end - today) / 1000 / 60 / 60 / 24 / 30.5);
        }, 16)
    }
})

customElements.define('li-date-to-circle', class LiDateToCircle extends LiElement {
    static get styles() {
        return css`

        `;
    }

    render() {
        return html`
            <canvas id="circle" width=${this.size} height="${this.size}"></canvas>
        `
    }

    static get properties() {
        return {
            date: { type: String, default: '2022-12-19' },
            type: {
                type: String,
                default: 'ms',
                list: ['day', 'hour', 'min', 'sec', 'ms']
            },
            size: { type: Number, default: 100 },
            padding: { type: Number, default: 8 },
            lineWidth: { type: Number, default: 2 },
            lineColor: { type: String, default: '#4285f4' },
            fontSize: { type: Number, default: 20 },
            fontColor: { type: String, default: 'red' },
            label: { type: String, default: '' },
        }
    }
    firstUpdated() {
        super.firstUpdated();
        const ctx = this.$qs('#circle').getContext('2d');
        const start = 4.72;
        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;
        let diff;
        const fn = () => {
            let today = Date.now();
            let end = Date.parse(this.date) ;
            let t = end - today;
            let al = t % 1000;
            let div = 1000;
            switch (this.type) {
                case 'sec':
                    t = t / 1000 | 0;
                    al = t % 60;
                    div = 60;
                    break;
                case 'min':
                    t = t / 1000 / 60 | 0;
                    al = t % 60;
                    div = 60;
                    break;
                case 'hour':
                    const x = new Date();
                    const currentTimeZoneOffsetInHours = x.getTimezoneOffset() / 60;
                    t = t / 1000 / 60 / 60 | 0;
                    t += currentTimeZoneOffsetInHours;
                    al = t % 24;
                    div = 24;
                    break;
                case 'day':
                    end = (new Date(this.date)).getTime();
                    today = (new Date()).getTime();
                    al = ((end - today) / 1000 / 60 / 60 / 24).toFixed(0);
                    // al = Math.ceil(Math.abs(end - today) / (1000 * 60 * 60 * 24));
                    div = 365;
                    break;
            }
            diff = ((al / div) * Math.PI * 2 * 10).toFixed(2);
            ctx.clearRect(0, 0, cw, ch);
            ctx.lineWidth = this.lineWidth;
            ctx.fillStyle = this.fontColor;
            ctx.strokeStyle = this.lineColor;
            ctx.textAlign = "center";
            ctx.font = `${this.fontSize}px monospace`;
            ctx.fillText(al, cw * .52, ch * .45 + 5, cw + 12);
            ctx.fillText(this.label || this.type, cw * .52, ch * .45 + 5 + this.fontSize, cw + 12);
            ctx.beginPath();

            ctx.arc(this.size / 2, this.size / 2, this.size / 2 - this.padding, start, diff / 10 + start, false);
            ctx.stroke();
        }
        setInterval(fn, 20);
    }
})
