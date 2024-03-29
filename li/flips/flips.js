import { LiElement, html, css } from '../../li.js';

import '../icon/icon.js';
import '../button/button.js';
import confetti from "https://cdn.skypack.dev/canvas-confetti";

customElements.define('li-flips', class LiFlips extends LiElement {
    static get styles() {
        return css`
            :host {
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: center;
                height: 100%;
                box-sizing: border-box;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            header {
                position: absolute;
                top: 0;
                max-width: 100%;
                min-width: 100%;
                display: flex;
                flex: 1;
                align-items: center;
                border-bottom: 1px solid lightgray;
                padding: 2px;
                z-index: 9;
                max-height: 44px;
                overflow: hidden;
                overflow-x: auto;
                box-sizing: border-box;
            }
            .txt {
                border: none;
                outline: none; 
                text-align: center;
                font-size: 22px;
                color: gray;
                white-space:nowrap;
            }
            .board {
                display: flex;
                flex-direction: column;
                align-self: center;
                justify-content: center;
                background-color: lightgray;
                border: 1px solid darkgray;
                width: 95vmin;
                max-height: 95vmin;
                position: relative;
                flex: 1;
                margin: 64px 8px 16px 8px;
                padding: 5px;
                overflow: hidden;
            }
            .row {
                display: flex;
                flex: 1;
            
            }
            .cell {
                display: flex;
                flex: 1;
                margin: calc(1px + 1vmin/2);
                background-color: transparent;
                perspective: 1000px;
                cursor: pointer;
            }
            .cell-inner {
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 1;
                position: relative;
                text-align: center;
                transition: transform 0.6s;
                transform-style: preserve-3d;
                box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
                border: 1px solid darkgray;
            }
            .selected .cell-inner {
                transform: rotateY(180deg);
            }
            .cell-front, .cell-back {
                position: absolute;
                width: 100%;
                height: 100%;
                -webkit-backface-visibility: hidden;
                backface-visibility: hidden;
                font-weight: 500;
            }
            .cell-back {
                background-color: #bbb;
                color: black;
            }
            .cell-front {
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 1;
                background-color: white;
                transform: rotateY(180deg);
            }
            .odd {
                color: transparent;
                font-size: 0;
                opacity: 1;
                background-size: cover;
                background-repeat: no-repeat;
                cursor: default;
            }
        `;
    }

    render() {
        return html`
            <style>
                .solved { opacity: ${this.end ? 1 : .3}; }
                .cell:hover .cell-inner { transform: ${this.babyMode ? 'rotateY(180deg)' : ''}; }
                .cell-front, .cell-back { font-size: ${14 + this.fontSize - 100 <= 14 ? 14 : 14 + this.fontSize - 100}px; }
            </style>
            <header>
                <li-button name='remove' border='none' size=28 @click=${() => --this.row}></li-button><div class='txt'>${this.row}</div><li-button name='add' border='none' size=28  @click=${() => ++this.row}></li-button>
                <li-button name='remove' border='none' size=28 @click=${() => --this.column} style='margin-left: 4px'></li-button><div class='txt'>${this.column}</div><li-button name='add' border='none' size=28  @click=${() => ++this.column}></li-button>
                <div style="display: flex; flex-direction: column; flex: 1; width: 100%">
                    <div class='txt' style="width: 100%; ">flips - ${this.mode}</div>
                    <div style="display: flex; width: 100%; justify-content: center; align-items: center">
                        <div style="color: green; flex: 1; text-align: right; font-weight: 600; opacity: .5">${this.isOk}</div>
                        <div style="padding: 0 4px"> : </div>
                        <div style="color: red; flex: 1; font-weight: 600; opacity: .5">${this.isError}</div>
                    </div>
                </div>
                <li-button name='face' border='none' size=28 @click=${() => this.babyMode = !this.babyMode} title='baby mode' toggledClass='ontoggled' ?toggled=${this.babyMode} style='margin: 0 8px 0 36px'></li-button>
                <li-button name='extension' border='none' size=28 @click=${this.setMode} title='mode' style='margin-right: 8px'></li-button>
                <li-button name='refresh' border='none' size=28 @click=${() => document.location.reload()} title='refresh' style='margin-right: 8px'></li-button>
            </header>
            <div id="board" class='board'>
                ${[...Array(+this.row).keys()].map(row => html`
                    <div class='row'>
                        ${[...Array(+this.column).keys()].map(column => {
                            let idx = this.column * row + column; 
                            return html`
                                <div class='cell ${(this.solved.includes(idx) || idx === this.card1?.id || idx === this.card2?.id) ? 'selected' : ''} ${this.solved.includes(idx) ? 'solved' : ''}' 
                                         @click=${e => this.onclick(e, idx, this.cards?.[idx])}>
                                    <div class='cell-inner'>
                                        <div class='cell-front ${idx === this.odd ? 'odd' : ''}' style="color: hsla(${this.cards?.[idx]?.c || 0}, 60%, 50%, 1);">
                                            ${this.mode === 'images' || this.mode === 'colors' || idx === this.odd ? html`
                                                <img src=${this.cards?.[idx]?.v || this._url + 'li.png'} style="width: 100%;max-height: 100%;">
                                            ` : html`
                                                ${this.cards?.[idx]?.v}
                                            `}
                                        </div>
                                        <div class='cell-back ${idx === this.odd ? 'odd' : ''}'>
                                            ${idx === this.odd ? html`
                                                <img src=${this._url + 'li.png'} style="width: 100%;max-height: 100%;">
                                            ` : html``}
                                        </div>
                                    </div>
                                </div>
                            `})}
                    </div>
                `)}
            </div>
        `
    }

    static get properties() {
        return {
            row: { type: Number, default: 3, save: true, category: 'settings' },
            column: { type: Number, default: 3, save: true, category: 'settings' },
            mode: { type: String, default: 'images', save: true, category: 'settings' },
            autoClose: { type: Boolean, default: true, category: 'settings' },
            timeToClose: { type: Number, default: 750, category: 'settings' },
            babyMode: { type: Boolean, default: false, save: true, category: 'settings' },
            fontSize: { type: Number, default: 32 },
            isOk: { type: Number, default: 0 },
            isError: { type: Number, default: 0 },
            step: { type: Number, default: 0 },
            cards: { type: Array },
            card1: { type: Object },
            card2: { type: Object },
            solved: { type: Array, default: [] },
            end: { type: Boolean },
        }
    }
    get odd() { return (this.row * this.column) % 2 === 0 ? '' : Math.floor(this.row * this.column / 2) }
    get _fontSize() { return Math.min(this.$qs('#board').offsetWidth / this.column + this.column * 4, this.$qs('#board').offsetHeight / this.row + this.row * 4) }
    get _url() { return this.$url.replace('flips.js', '') }

    firstUpdated() {
        super.firstUpdated();
        setTimeout(() => this.init(), 100);
        window.addEventListener('resize', () => LI.throttle('resize', () => this.fontSize = this._fontSize, 300), false);
    }
    updated(e) {
        if (e.has('row') || e.has('column')) {
            this.row = this.row < 2 ? 2 : this.row > 10 ? 10 : this.row;
            this.column = this.column < 2 ? 2 : this.column > 10 ? 10 : this.column;
        }
        if (e.has('row') || e.has('column') || e.has('mode')) this.init();
    }

    init() {
        this._confetti && clearInterval(this._confetti);
        this.fontSize = this._fontSize;
        this.isOk = this.isError = 0;
        this.card1 = this.card2 = undefined;
        this.solved = [];
        this.cards = [];
        const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        const rusAlphabet = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'];
        const digital1_9 = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        const images = [];
        let url = this._url + 'cards/cards-';
        for (let i = 1; i <= 140; i++) images.push(url + (i < 10 ? '00' + i : i < 100 ? '0' + i : i) + '.jpg');
        const colors = [];
        url = this._url + 'colors/colors-';
        for (let i = 1; i <= 12; i++) colors.push(url + (i < 10 ? '00' + i : i < 100 ? '0' + i : i) + '.jpg');
        let length = (this.row * this.column) - (this.odd ? 1 : 0);
        this.step = 360 / (length / 2);
        const mode = { images, '1...9': digital1_9, 'ABC...': alphabet, 'АБВ...': rusAlphabet, colors };
        const arr = mode[this.mode] || images;
        let unique = [];
        const uniqueCards = [];
        for (let i = 0; i < length / 2; i++) {
            const color = i * this.step;
            if (this.mode === 'digital') uniqueCards.push({ v: i, c: color }, { v: i, c: color });
            else {
                if (unique.length === 0) unique = [...Array(arr.length).keys()];
                const randomNumber = Math.floor(Math.random() * unique.length);
                const random = arr[unique[randomNumber]];
                uniqueCards.push({ v: random, c: color }, { v: random, c: color })
                unique[randomNumber] = unique[unique.length - 1];
                unique.pop();
            }
        }
        this.cards = [];
        while (uniqueCards.length !== 0) {
            const randomNumber = Math.floor(Math.random() * uniqueCards.length);
            this.cards.push(uniqueCards[randomNumber]);
            uniqueCards[randomNumber] = uniqueCards[uniqueCards.length - 1];
            uniqueCards.pop();
        }
        this.odd && this.cards.splice(this.odd, 0, -1);
        this.$update();
    }
    setMode() {
        const mode = ['images', '1...9', 'digital', 'ABC...', 'АБВ...', 'colors'];
        let idx = mode.indexOf(this.mode);
        idx = ++idx >= mode.length ? 0 : idx;
        this.mode = mode[idx];
    }
    onclick(e, id, value) {
        if (id === this.odd) return;
        if (!this.autoClose && this.card1 && this.card2) this.card1 = this.card2 = undefined;
        if (this.solved.includes(id) || this.card1?.id === id || value.v < 0) return;
        this.clickEffect ||= new Audio(this._url + 'audio/click.mp3');
        this.clickEffect.volume = 0.2;
        this.clickEffect.play();
        if (!this.card1) this.card1 = { id, value };
        else if (!this.card2) {
            this.card2 = { id, value };
            const color = this.mode === 'images' || this.mode === 'colors' || this.card1.value.c === this.card2.value.c;
            if (this.card1.value.v === this.card2.value.v && color) {
                this.solved ||= [];
                setTimeout(() => {
                    ++this.isOk;
                    this.solved.push(this.card1.id, this.card2.id);
                    this.card1 = this.card2 = undefined;
                    this.end = this.solved.length >= this.cards.length - (this.odd ? 2 : 0);
                    if (this.end) {
                        this.endEffect ||= new Audio(this._url + 'audio/end.mp3');
                        this.endEffect.volume = 0.2;
                        this.endEffect.play();
                        function randomInRange(min, max) { return Math.random() * (max - min) + min; }
                        this._confetti = setInterval(() => confetti({ angle: randomInRange(30, 150), spread: randomInRange(50, 70), particleCount: randomInRange(50, 100), origin: { y: .55 } }), 650);
                        setTimeout(() => this._confetti && clearInterval(this._confetti), 2100);
                    } else {
                        this.okEffect ||= new Audio(this._url + 'audio/ok.mp3');
                        this.okEffect.volume = 0.4;
                        this.okEffect.play();
                    }
                }, this.timeToClose);
            } else {
                this.errEffect ||= new Audio(this._url + 'audio/error.mp3');
                this.errEffect.volume = 0.1;
                this.errEffect.play();
                ++this.isError;
                this.autoClose && setTimeout(() => this.card1 = this.card2 = undefined, this.timeToClose);
            }
        }
        this.$update();
    }
})
