import { LiElement, html, css } from '../../li.js';

customElements.define('li-flips', class LiFlips extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                justify-content: center;
                height: 100%;
            }
            .board {
                display: flex;
                flex-direction: column;
                align-self: center;
                justify-content: center;
                background-color: lightgray;
                border: 1px solid darkgray;
            }
            .row {
                display: flex;
            }
            .cell {
                display: flex;
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
                color: darkcyan;
                background-color: white;
                transform: rotateY(180deg);
            }
            .odd {
                opacity: 0;
            }
        `;
    }

    render() {
        return html`
            <style>
                .board {
                    padding: ${(this.margin || 5) / 2}px;
                }
                .solved {
                    opacity: ${this.showSolved ? .3 : 0};
                }
                .cell:hover .cell-inner {
                    transform: ${this.babyMode ? 'rotateY(180deg)' : ''};
                }
                .cell {
                    width: ${this.width || 100}px;
                    height: ${this.height || 100}px;
                    margin: ${this.margin || 10}px;
                }
                .cell-front {
                    font-size: ${this.fontSize || 48}px;
                }
            </style>
            <div class="board">
                ${[...Array(+this.row).keys()].map(row => html`
                    <div class="row">
                        ${[...Array(+this.column).keys()].map(column => { 
                            let idx = this.column * row + column; 
                            return html`
                                <div class="cell
                                        ${(this.showSolved && this.solved.includes(idx) || idx === this.card1?.id || idx === this.card2?.id) ? 'selected' : ''}
                                        ${this.solved.includes(idx) ? 'solved' : ''}" id=${idx} @click=${e => this.onclick(e, idx, this.cards?.[idx])}>
                                    <div class="cell-inner">
                                        <div class="cell-front ${idx === this.odd ? 'odd' : ''}">
                                            ${this.cards?.[idx]}
                                        </div>
                                        <div class="cell-back ${idx === this.odd ? 'odd' : ''}">
                                            
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
    }
    updated(e) {
        if (e.has('row') || e.has('column') || e.has('showSolved') || e.has('autoClose') || e.has('timeToClose')  || e.has('babyMode') 
            || e.has('width') || e.has('height') || e.has('margin') || e.has('fontSize')) 
            this.init();
    }

    static get properties() {
        return {
            row: { type: Number, default: 5, save: true, category: 'settings' },
            column: { type: Number, default: 5, save: true, category: 'settings' },
            width: { type: Number, default: 100, save: true, category: 'settings' },
            height: { type: Number, default: 100, save: true, category: 'settings' },
            margin: { type: Number, default: 5, save: true, category: 'settings' },
            fontSize: { type: Number, default: 48, save: true, category: 'settings' },
            showSolved: { type: Boolean, default: true, save: true, category: 'settings' },
            autoClose: { type: Boolean, default: true, save: true, category: 'settings' },
            timeToClose: { type: Number, default: 750, save: true, category: 'settings' },
            babyMode: { type: Boolean, default: false, save: true, category: 'settings' },
            cards: { type: Array },
            card1: { type: Object },
            card2: { type: Object },
            solved: { type: Array, default: [] },
        }
    }
    get odd() {
        return (this.row * this.column) % 2 === 0 ? '' : Math.floor(this.row * this.column / 2);
    }

    init() {
        this.card1 = this.card2 = undefined;
        this.solved = [];
        this.cards = [];
        let length = (this.row * this.column) - (this.odd ? 1 : 0);
        for (let i = 0; i < length / 2; i++) {
            this.cards.push(i, i);
        }
        this.cards = this.cards.sort(() => Math.random() - 0.5);
        if (this.odd) {
            this.cards.splice(this.odd, 0, -1);
        }
        this.$update();
    }
    onclick(e, id, value) {
        if (!this.autoClose && this.card1 && this.card2) this.card1 = this.card2 = undefined;
        if (this.solved.includes(id) || this.card1?.id === id || value < 0) {
            return;
        }
        if (!this.card1) {
            this.card1 = { id, value };
        } else if (!this.card2) {
            this.card2 = { id, value };
            if (this.card1.value === this.card2.value) {
                this.solved ||= [];
                setTimeout(() => {
                    this.solved.push(this.card1.id, this.card2.id);
                    this.card1 = this.card2 = undefined;
                }, this.timeToClose);
            } else {
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
