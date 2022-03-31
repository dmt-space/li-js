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
                /* border: 1px solid blue; */
                margin: 4px 6px 4px 4px;
                padding: 4px;
             }
             div {
                 font-size: 28px;
             }
        `;
    }

    render() {
        return html`
            <h1>${this.txt}</h1>
            <div>секунд: ${this.s}</div>
            <div>минут: ${this.mn}</div>
            <div>часов: ${this.h}</div>
            <div>дней: ${this.d}</div>
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
            this.s = (end - today) / 1000;
            this.mn = ((end - today) / 1000 / 60).toFixed(0);
            this.h = ((end - today) / 1000 / 60 / 60).toFixed(0);
            this.d = ((end - today) / 1000 / 60 / 60 / 24).toFixed(0);
            this.w = ((end - today) / 1000 / 60 / 60 / 24 / 7).toFixed(0);
            this.m = (new Date(this.dates).getMonth() - (new Date()).getMonth()).toFixed(0);
        }, 16)
    }
})
