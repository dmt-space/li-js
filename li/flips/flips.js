import { LiElement, html, css } from '../../li.js';

import '../icon/icon.js';
import '../button/button.js';

customElements.define('li-flips', class LiFlips extends LiElement {
    static get styles() {
        return css`
            :host {
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: center;
                height: 100%;
            }
            header {
                position: absolute;
                top: 0;
                min-width: 100%;
                display: flex;
                flex: 1;
                align-items: center;
                border-bottom: 1px solid lightgray;
                padding: 2px;
                z-index: 9;
                flex-wrap: wrap;
            }
            .txt {
                border: none;
                outline: none; 
                text-align: center;
                font-size: 24px;
                width: 40px;
                color: gray;
            }
            .board {
                display: flex;
                flex-direction: column;
                align-self: center;
                justify-content: center;
                background-color: lightgray;
                border: 1px solid darkgray;
                width: 100vmin;
                max-height: 100vmin;
                position: relative;
                flex: 1;
                margin: 44px 8px 8px 8px;
                padding: 5px;
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
                opacity: .3;
                background-size: cover;
                background-repeat: no-repeat;
            }
        `;
    }

    render() {
        return html`
            <style>
                .solved {
                    opacity: ${this.showSolved ? .3 : 0};
                }
                .cell:hover .cell-inner {
                    transform: ${this.babyMode ? 'rotateY(180deg)' : ''};
                }
                .cell-front, .cell-back {
                    font-size: ${this.fontSize - 32}px;
                }
            </style>
            <header>
                <li-button name='remove' border='none' size=32 @click=${() => --this.row}></li-button><div class='txt'>${this.row}</div><li-button name='add' border='none' size=32  @click=${() => ++this.row}></li-button>
                <li-button name='remove' border='none' size=32 @click=${() => --this.column} style='margin-left: 8px'></li-button><div class='txt'>${this.column}</div><li-button name='add' border='none' size=32  @click=${() => ++this.column}></li-button>
                <div class='txt' style='flex: 1'>flips - ${this.mode}</div>
                <li-icon name='done' border='none' size=32 fill='green'></li-icon><div class='txt' style='color: green; width: 100px'>${this.isOk}</div>
                <li-icon name='close' border='none' size=32 fill='red'></li-icon><div class='txt' style='color: red; width: 100px'>${this.isError}</div>
                <li-button name='face' border='none' size=32 @click=${() => this.babyMode = !this.babyMode} title='baby mode' toggledClass='ontoggled' ?toggled=${this.babyMode}></li-button>
                <li-button name='visibility-off' border='none' size=32 @click=${() => this.showSolved = !this.showSolved} title='show sloved' toggledClass='ontoggled' ?toggled=${!this.showSolved}></li-button>
                <li-button name='extension' border='none' size=32 @click=${this.setMode} title='mode' style='margin-right: 8px'></li-button>
                <li-button name='refresh' border='none' size=32 @click=${() => document.location.reload()} title='refresh' style='margin-right: 8px'></li-button>
            </header>

            <div class='board'>
                ${[...Array(+this.row).keys()].map(row => html`
                    <div class='row'>
                        ${[...Array(+this.column).keys()].map(column => {
            let idx = this.column * row + column;
            return html`
                                <div class='cell
                                        ${(this.showSolved && this.solved.includes(idx) || idx === this.card1?.id || idx === this.card2?.id) ? 'selected' : ''}
                                        ${this.solved.includes(idx) ? 'solved' : ''}' id=${'cell_' + idx} @click=${e => this.onclick(e, idx, this.cards?.[idx])}>
                                    <div class='cell-inner'>
                                        <div class='cell-front ${idx === this.odd ? 'odd' : ''}' style="color: hsla(${this.cards?.[idx]?.c || 0}, 60%, 50%, 1);">
                                            ${this.mode === 'images' ? html`
                                                <img src=${idx === this.odd ? '/lib/li.png' : this.cards?.[idx]?.v} style="width: 100%;max-height: 100%;">
                                            ` : html`
                                                ${this.cards?.[idx]?.v || ''}
                                            `}
                                        </div>
                                        <div class='cell-back ${idx === this.odd ? 'odd' : ''}'>
                                            ${idx === this.odd ? html`
                                                <img src="/lib/li.png" style="width: 100%;max-height: 100%;">
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

    firstUpdated() {
        super.firstUpdated();
        setTimeout(() => {
            this.init();
        }, 100);
        window.addEventListener('resize', () => {
            LI.throttle('resize', () => {
                this.fontSize = Math.min(this.$qs('#cell_0').offsetWidth, this.$qs('#cell_0').offsetHeight);
            }, 300);
        }, false);
    }
    updated(e) {
        if (e.has('row') || e.has('column')) {
            this.row = this.row < 2 ? 2 : this.row > 10 ? 10 : this.row;
            this.column = this.column < 2 ? 2 : this.column > 10 ? 10 : this.column;
        }
        if (e.has('row') || e.has('column') || e.has('showSolved') || e.has('babyMode') || e.has('mode'))
            this.init();
    }

    static get properties() {
        return {
            row: { type: Number, default: 5, save: true, category: 'settings' },
            column: { type: Number, default: 5, save: true, category: 'settings' },
            showSolved: { type: Boolean, default: true, save: true, category: 'settings' },
            mode: { type: String, default: 'images', save: true, category: 'settings' },
            autoClose: { type: Boolean, default: true, category: 'settings' },
            timeToClose: { type: Number, default: 750, category: 'settings' },
            babyMode: { type: Boolean, default: false, save: true, category: 'settings' },
            fontSize: { type: Number, default: 32, category: 'settings' },
            isOk: { type: Number, default: 0 },
            isError: { type: Number, default: 0 },
            step: { type: Number, default: 0 },
            cards: { type: Array },
            card1: { type: Object },
            card2: { type: Object },
            solved: { type: Array, default: [] }
        }
    }
    get odd() {
        return (this.row * this.column) % 2 === 0 ? '' : Math.floor(this.row * this.column / 2);
    }

    init() {
        this.fontSize = Math.min(this.$qs('#cell_0').offsetWidth, this.$qs('#cell_0').offsetHeight);
        this.isOk = this.isError = 0;
        this.card1 = this.card2 = undefined;
        this.solved = [];
        this.cards = [];
        const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        const rusAlphabet = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'];
        const digital1_9 = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        const images = [];
        for (let i = 1; i <= 140; i++) {
            images.push('/lib/media/cards/_cards-' + (i < 10 ? '00' + i : i < 100 ? '0' + i : i) + '.jpg'); 
        }
        let length = (this.row * this.column) - (this.odd ? 1 : 0);
        this.step = 360 / (length / 2);
        const arr = this.mode === 'digital' ? [] : this.mode === 'ABC...' ? alphabet : this.mode === 'АБВ...' ? rusAlphabet : this.mode === '1...9' ? digital1_9 : this.mode === 'images' ? images : digital;
        for (let i = 0; i < length / 2; i++) {
            const color = i * this.step;
            if (this.mode === 'digital') this.cards.push({ v: i, c: color }, { v: i, c: color })
            else {
                const random = arr[Math.floor(Math.random() * arr.length)];
                this.cards.push({ v: random, c: color }, { v: random, c: color });
            }
        }
        this.cards = this.cards.sort(() => Math.random() - 0.5);
        if (this.odd) {
            this.cards.splice(this.odd, 0, -1);
        }
        this.$update();
    }
    setMode() {
        this.mode = this.mode === 'digital' ? 'ABC...' : this.mode === 'ABC...' ? 'АБВ...' : this.mode === 'АБВ...' ? '1...9' : this.mode === '1...9' ? 'images' : 'digital';
    }
    onclick(e, id, value) {
        if (!this.autoClose && this.card1 && this.card2) this.card1 = this.card2 = undefined;
        if (this.solved.includes(id) || this.card1?.id === id || value.v < 0) {
            return;
        }
        if (!this.card1) {
            this.card1 = { id, value };
        } else if (!this.card2) {
            this.card2 = { id, value };
            const color = this.mode === 'images' || this.card1.value.c === this.card2.value.c;
            if (this.card1.value.v === this.card2.value.v && color) {
                this.solved ||= [];
                setTimeout(() => {
                    ++this.isOk;
                    this.solved.push(this.card1.id, this.card2.id);
                    this.card1 = this.card2 = undefined;
                }, this.timeToClose);
            } else {
                ++this.isError;
                if (this.autoClose) {
                    setTimeout(() => {
                        this.card1 = this.card2 = undefined;
                    }, this.timeToClose);
                }
            }
        }
        this.$update();
    }
})
