import { LiElement, html, css } from '../../li.js';

customElements.define('li-timer', class LiTimer extends LiElement {
    static get styles() {
        return css`
            :host { 
                flex: 1;
                margin: 4px 6px 4px 4px;
                padding: 4px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .row {
                color: blue;
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 200px;
                font-size: 20px;
            }
            .lbl {
                color: blue;
                font-size: 16px;
            }
            .vertical {
                display: flex;
                flex-direction: column;
            }
            .box {
                box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
                border: 1px solid darkgray;
                margin: 8px 2px;
                padding: 8px;
                justify-content: space-between;
                align-items: center;
                border-radius: 4px;
                text-align: center;
            }
        `;
    }

    render() {
        return html`
            <div class="vertical box">
                <div style="font-size: 20px; font-weight: 500; color: blue;">${this.txt}</div>
                <div style="font-size: 24px; font-weight: 700; color: blue;">${this.date + ' ' + this.time}</div>
                <div style="font-size: 20px; font-weight: 500; color: blue;">${this.txt2}</div>
            </div>
            <div class="vertical box">
                <li-timer-circle type="day" size="100" fontSize="24"></li-timer-circle>
                <div>
                    <li-timer-circle type="hour"></li-timer-circle>
                    <li-timer-circle type="min"></li-timer-circle>
                    <li-timer-circle type="sec"></li-timer-circle>
                    <li-timer-circle></li-timer-circle>
                </div>
            </div>
            <div class="vertical box">
                <div class="row"><span class="lbl">секунд: </span>${this.s}</div>
                <div class="row"><span class="lbl">минут: </span>${this.mn}</div>
                <div class="row"><span class="lbl">часов: </span>${this.h}</div>
                <div class="row"><span class="lbl">дней: </span>${this.d}</div>
                <div class="row"><span class="lbl">недель: </span>${this.w}</div>
                <div class="row"><span class="lbl">месяцев: </span>${this.m}</div>
                <div class="row"><span class="lbl">лет: </span>${this.y}</div>
            </div>
        `
    }

    static get properties() {
        return {
            txt: { type: String, default: '' },
            txt2: { type: String, default: '' },
            date: { type: String, default: '', local: true },
            time: { type: String, default: '', local: true },
            s: { type: Number, local: true },
            mn: { type: Number, local: true },
            h: { type: Number, local: true },
            d: { type: Number, local: true },
            w: { type: Number, local: true },
            m: { type: Number, local: true },
            y: { type: Number, local: true },
            end: { type: Object, local: true },
            today: { type: Object, local: true },
            toUpdate: { type: Boolean, local: true }
        }
    }
    firstUpdated() {
        super.firstUpdated();
        this.init();
    }

    init() {
        const url = new URL(document.location.href);
        const date = url.searchParams.get('date');
        const time = url.searchParams.get('time');
        const txt = url.searchParams.get('txt');
        const txt2 = url.searchParams.get('txt2');
        
        this.date = date || this.date || '2023-01-01';
        this.time = time || this.time || '00:00:00';

        this.end = (new Date(this.date + 'T' + this.time)).getTime();
        this.today = (new Date()).getTime();
        let diff = this.end - this.today;

        this.txt = txt || this.txt || (diff >= 0 ? 'осталось до' : 'прошло с');
        this.txt2 = txt2 || this.txt2 || '';

        setInterval(() => {
            this.today = (new Date()).getTime();
            diff = Math.abs(this.end - this.today);
            this.d = (diff / 1000 / 60 / 60 / 24).toFixed(2);
            this.w = (diff / 1000 / 60 / 60 / 24 / 7).toFixed(2);
            this.m = (diff / 1000 / 60 / 60 / 24 / 30.5).toFixed(2);
            this.y = (diff / 1000 / 60 / 60 / 24 / 365).toFixed(2);
            this.toUpdate = !this.toUpdate;
        }, 16)
    }
})

customElements.define('li-timer-circle', class LiTimerCircle extends LiElement {
    render() {
        return html`
            <canvas id="circle" width=${this.size} height="${this.size}"></canvas>
        `
    }

    static get properties() {
        return {
            type: { type: String, default: 'ms', list: ['day', 'hour', 'min', 'sec', 'ms'] },
            label: { type: String, default: '' },
            size: { type: Number, default: 80 },
            padding: { type: Number, default: 8 },
            lineWidth: { type: Number, default: 2 },
            lineColor: { type: String, default: '#4285f4' },
            fontSize: { type: Number, default: 18 },
            fontColor: { type: String, default: 'red' },
            labelSize: { type: Number, default: 0 },
            labelColor: { type: String, default: '' },
            end: { type: Object, local: true },
            today: { type: Object, local: true },
            toUpdate: { type: Boolean, local: true },
            s: { type: Number, local: true },
            mn: { type: Number, local: true },
            h: { type: Number, local: true },
            d: { type: Number, local: true },
            w: { type: Number, local: true },
            m: { type: Number, local: true },
        }
    }
    firstUpdated() {
        super.firstUpdated();
        this.ctx = this.$qs('#circle').getContext('2d');
        this.start = 4.72;
        this.cw = this.ctx.canvas.width;
        this.ch = this.ctx.canvas.height;
        this.clock = {
            sec: (t, al, div) => {
                t = t / 1000 | 0; 
                al = t % 60;
                div = 60;
                this.s = t
                return { t, al, div };
            },
            min: (t, al, div) => {
                t = t / 1000 / 60 | 0;
                al = t % 60;
                div = 60;
                this.mn = t;
                return { t, al, div };
            },
            hour: (t, al, div) => {
                t = t / 1000 / 60 / 60 | 0;
                al = t % 24;
                div = 24;
                this.h = t;
                return { t, al, div };
            },
            day: (t, al, div) => {
                al = Math.floor(t / (1000 * 60 * 60 * 24));
                div = 365;
                return { t, al, div };
            }
        }
    }
    updated(e) {
        if (e.has('toUpdate')) {
            let t = Math.abs(this.end - this.today);
            let al = t % 1000;
            let div = 1000;
            if (this.clock[this.type]) {
                const act = this.clock[this.type](t, al, div);
                t = act.t; al = act.al; div = act.div;
            }
            const diff = ((al / div) * Math.PI * 2 * 10).toFixed(2);
            this.ctx.clearRect(0, 0, this.cw, this.ch);
            this.ctx.strokeStyle = this.lineColor;
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.textAlign = "center";
            this.ctx.fillStyle = this.fontColor;
            this.ctx.font = `bold ${this.fontSize || 18}px monospace`;
            this.ctx.fillStyle = this.labelColor || this.fontColor;
            this.ctx.fillText(al, this.cw * .52, this.ch * .45 + 5, this.cw + 12);
            this.ctx.font = `${this.labelSize || this.fontSize - 4 || 14}px monospace`;
            this.ctx.fillText(this.label || this.type, this.cw * .52, this.ch * .45 + 5 + this.fontSize, this.cw + 12);
            this.ctx.beginPath();
            this.ctx.arc(this.size / 2, this.size / 2, this.size / 2 - this.padding, this.start, diff / 10 + this.start, false);
            this.ctx.stroke();
        }
    }
})
