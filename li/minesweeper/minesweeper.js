import { LiElement, html, css } from '../../li.js';
import '../timer/timer.js';
import '../button/button.js';

import confetti from "https://cdn.skypack.dev/canvas-confetti";

customElements.define('li-minesweeper', class LiMinesweeper extends LiElement {
    static get styles() {
        return css`
            :host {
                display: relative;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;
                box-sizing: border-box;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            .clock {
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: .7;
            }
            .field {
                display: flex;
                justify-content: center;
                box-shadow: 0 4px 8px 0 rgba(0, 0, 0, .3);
            }
            .smile {
                position: absolute;
                margin: auto;
                width: 200px;
                left: 50%;
                margin-left: -100px;
                margin-top: 64px;
                z-index: 99;
                visibility: hidden;
                opacity: 0;
                transition: opacity 3s linear, visibility .5s linear;
                cursor: pointer;
            }
            .smile.show {
                opacity: .5;
                visibility: visible;
            }
            .smile-win {
                fill: yellow;
            }
            .smile-lose {
                fill: red;
            }
            li-timer-circle {
                cursor: pointer;
            }
            li-button {
                margin: 0 4px;
                font-size: 12px;
            }
        `;
    }

    render() {
        return html`
            <li-minesweeper-title></li-minesweeper-title>
            <div class="clock">
                <li-button radius=50% back=${this.level === 1 ? 'lightgray' : ''} @click=${() => this.setLevel(1)}>1</li-button>
                <li-button radius=50% back=${this.level === 2 ? 'lightgray' : ''} @click=${() => this.setLevel(2)}>2</li-button>
                <li-timer-circle type="hour" size=40 height=60></li-timer-circle>
                <li-timer-circle type="min" size=40 height=60></li-timer-circle>
                <li-timer-circle type="sec" size=40 height=60></li-timer-circle>
                <li-timer-circle size=40 height=60></li-timer-circle>
                <li-button radius=50% back=${this.level === 3 ? 'lightgray' : ''} @click=${() => this.setLevel(3)}>3</li-button>
                <li-button radius=50% back=${this.level === 4 ? 'lightgray' : ''} @click=${() => this.setLevel(4)}>4</li-button>
            </div>
            ${this.isReady ? html`
                <li-minesweeper-field class="field"></li-minesweeper-field>
            ` : html``}
            <div class="smile ${this.endGame ? 'show' : 'hide'}" @click=${this.init}>
                <svg viewbox="0 0 120 120">
                    <g transform='translate(60 60)'>
                        <circle cx="0" cy="0" r="50" stroke="#000000" stroke-width="2" fill="transparent" class=${this.endGame === 'lose' ? 'smile-lose' : this.endGame === 'win' ? 'smile-win' : ''}/>
                        <circle cx="-20" cy="-10" r="5" fill="#000000"/>
                        <circle cx="20" cy="-10" r="5" fill="#000000"/>
                        <g>
                            <path fill="none" stroke="#000000" stroke-width="3" stroke-linecap="round" d=${'M-25,20 Q0,' + this.smileQY + ' 25,20'}/>
                        </g>
                    </g>
                </svg>
            </div>
        `
    }

    static get properties() {
        return {
            game: { type: Object, default: {}, local: true },
            model: { type: Array, default: [] },
            cols: { type: Number, default: 10, save: true },
            rows: { type: Number, default: 10, save: true },
            mineCount: { type: Number, default: 15, save: true },
            babyMode: { type: Number, default: false, save: true },
            cellSize: { type: Number, default: 48 },
            cellSizeDefault: { type: Number, default: 48 },
            endGame: { type: String, default: '' },
            smileQY: { type: Number, default: 25 },
            hideLabel: { type: Boolean, default: false },
            end: { type: Number, default: 0, local: true },
            today: { type: Number, default: 0, local: true },
            isReady: { type: Boolean, default: false },
            level: { type: Number, default: 4, save: true },
        }
    }
    get _url() { return this.$url.replace('minesweeper.js', '') }

    constructor() {
        super();
        this.game = this;
        this.game._winAudio = new Audio(this._url + '/win.mp3');
        this.game._winAudio.volume = .2;
        this.game._errAudio ||= new Audio(this._url + '/err.mp3');
        this.game._errAudio.volume = 0.2;
        window.addEventListener('contextmenu', e => e.preventDefault(), false);
    }
    async firstUpdated() {
        super.firstUpdated();
        window.addEventListener('resize', () => LI.throttle('_resize', () => this._resize(), 300), false);
        await new Promise((r) => setTimeout(r, 0));
        this.init();
    }

    setLevel(level) {
        this.level = level;
        switch (level) {
            case 1:
                this.rows = this.cols = 10;
                this.mineCount = 1000;
                break;
            case 2:
                this.rows = this.cols = 15;
                this.mineCount = 1000;
                break;
            case 3:
                this.rows = this.cols = 20;
                this.mineCount = 1000;
                break;
            case 4:
                let h = this.offsetParent?.offsetHeight - 110;
                this.rows = Math.floor(h / this.cellSizeDefault);
                let w = this.offsetParent?.offsetWidth - 30;
                this.cols = Math.floor(w / this.cellSizeDefault);
                this.mineCount = 1000;
                break;
        }
        this.init();
    }
    _cellSize() {
        let h = this.offsetParent?.offsetHeight - 110;
        h = (h / this.rows) > this.cellSizeDefault ? this.cellSizeDefault : h / this.rows;
        let w = this.offsetParent?.offsetWidth - 30;
        w = (w / this.cols) > this.cellSizeDefault ? this.cellSizeDefault : w / this.cols;
        return Math.min(h, w);
    }
    _resize() {
        this.cellSize = this._cellSize();
        this.hideLabel = this.offsetParent?.offsetWidth < 600;
        this.$update();
    }
    generateModel() {
        const model = [];
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                model.push({ x, y })
            }
        }
        for (let i = 0; i < this.mineCount; i++) {
            let pos;
            do {
                pos = Math.floor(Math.random() * model.length);
            } while (model[pos].mine);
            model[pos].mine = true;
        }
        this.model = model;
        this.$update();
        this.isReady = true;
    }
    init() {
        this.endGame = '';
        this._confetti && clearInterval(this._confetti);
        this.end = this.today = 0;
        this.clearTimerStartInterval();
        if (!this.firstInit) {
            const url = new URL(document.location.href);
            this.rows = url.searchParams.get('rows') || this.rows;
            this.cols = url.searchParams.get('cols') || this.cols;
            this.mineCount = url.searchParams.get('mine') || this.mineCount;
            const babyMode = url.searchParams.get('baby');
            if (babyMode)
                this.babyMode = babyMode !== 'false' ? true : false;
            this.firstInit = true;
        }
        const max = 50;
        this.rows = this.rows < 3 ? 3 : this.rows > max ? max : this.rows;
        this.cols = this.cols < 3 ? 3 : this.cols > max ? max : this.cols;
        this.mineCount = this.mineCount < 1 ? 1 : this.mineCount > (this.rows * this.cols) / 5 ? (this.rows * this.cols) / 5 : this.mineCount;
        this.mineCount = Math.floor(this.mineCount);
        this._resize();
        LI.throttle('_init', () => this.generateModel(), 500, true);  
    }
    clearTimerStartInterval() {
        this.timerStartInterval && clearInterval(this.timerStartInterval);
        this.timerStartInterval = undefined;
    }
    bang(isWin) {
        if (this.endGame) return;
        this.clearTimerStartInterval();
        this.model.forEach(i => {
            i.status = (i.status === 'locked' && i.mine) ? 'locked' : (i.status === 'locked' && !i.mine) ? 'error' : (i.mine ? 'bang' : 'opened');
        })
        this.smileQY = 25;
        let i = 1;
        if (isWin) {
            console.log('Это Победа !!!');
            this.game._winAudio.play();
            this.endGame = 'win';
            const randomInRange = (min, max) => { return Math.random() * (max - min) + min }
            this._confetti = setInterval(() =>
                confetti({
                    angle: randomInRange(30, 150), spread: randomInRange(50, 70),
                    particleCount: randomInRange(50, 100), origin: { y: .25 }
                }), 300);
            setTimeout(() => this._confetti && clearInterval(this._confetti), 3000);
        } else {
            i = -1;
            console.log('Повезет в следующий раз ...');
            this._errAudio.play();
            this.game.endGame = 'lose';
        }
        const sInt = setInterval(() => {
            this.smileQY += i;
            if (this.smileQY > 45 || this.smileQY < -5)
                clearInterval(sInt);
        }, 100);
    }
    checkStatus(opened) {
        let error = 0;
        let mine = this.mineCount;
        if (opened) {
            let error = 0;
            for (const i of this.model) {
                error += (i.status !== 'opened' && i.el.count) ? 1 : 0;
                if (error) return;
            }
            if (error === 0) this.bang(true);
        } else {
            for (const i of this.model) {
                mine -= (i.status === 'locked' && i.mine) ? 1 : 0;
                error += (i.status === 'locked' && !i.mine) ? 1 : 0;
                if (error) return;
            }
            if (error === 0 && mine === 0) this.bang(true);
        }
    }
})

customElements.define('li-minesweeper-title', class LiMinesweeperTitle extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                max-width: 100%;
                min-width: 100%;
                align-items: center;
                border-bottom: 1px solid lightgray;
                padding: 2px;
                z-index: 9;
                max-height: 44px;
                overflow: hidden;
                box-sizing: border-box;
                text-align: center;
            }
            li-button {
                margin: 0 4px;
            }
        `;
    }

    render() {
        return html`
            <li-button border="none" name="remove" size=24 @click=${() => { --this.game.rows; this._init() }}></li-button><div class="txt" title="rows">${this.game?.rows}</div><li-button border="none" name="add" size=24  @click=${() => { ++this.game.rows; this._init() }}></li-button>
            <li-button border="none" name="remove" size=24 @click=${() => { --this.game.cols; this._init() }}></li-button><div class="txt" title="columns">${this.game?.cols}</div><li-button border="none" name="add" size=24  @click=${() => { ++this.game.cols; this._init() }}></li-button>
            <div style="width: 100%;cursor: pointer" @click=${() => { this.game.init() }}>${this.game.hideLabel ? '' : 'li-minesweeper'}</div>
            <li-button border="none" name="face" size=24 @click=${() => this.game.babyMode = !this.game?.babyMode} title="baby mode" toggledClass='ontoggled' ?toggled=${this.game?.babyMode} ></li-button>
            <li-button border="none" name = "remove" size = 24 @click=${() => { --this.game.mineCount; this._init('mineCount') }}></li-button><div class="txt" title="level">${this.game?.mineCount}</div><li-button border="none" name="add" size=24  @click=${() => { ++this.game.mineCount; this._init('mineCount') }}></li-button>
            <li-button border="none" name="launch" size=24 @click=${this._share} title = "share" ></li-button>
        `
    }

    static get properties() {
        return {
            game: { type: Object, local: true }
        }
    }

    _init(e) {
        if (e !== 'mineCount') {
            this.game.mineCount = (this.game.rows * this.game.cols) / 5 - (this.game.rows * this.game.cols) / 20;
        }
        this.game.level = 0;
        this.game.init();
    }
    _share() {
        let url = this.game.$url.replace('minesweeper.js', 'index.html');
        url += `?rows=${this.game.rows}&cols=${this.game.cols}&mine=${this.game.mineCount}&baby=${this.game.babyMode}`;
        window.open(url, '_blank').focus();
    }
})

customElements.define('li-minesweeper-field', class LiMinesweeperField extends LiElement {
    static get styles() {
        return css`
            :host {
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
            }
        `;
    }

    render() {
        return html`
            <style>
                .field {
                     width: ${this.game?.cellSize * this.game?.cols}px;
                     max-height: ${this.game?.cellSize * this.game?.cols + 4}px;
                }
            </style >
            ${[...Array(+this.game?.rows || 0).keys()].map((row, rowIdx) => html`
                <div style = "display: flex; flex: 1">
                    ${[...Array(+this.game?.cols || 0).keys()].map((col, colIdx) => {
                        let idx = this.game.rows * colIdx + rowIdx;
                        return html`
                            <li-minesweeper-mine class="cell" .mine=${this.game.model[idx]} style="width: ${this.game?.cellSize}px; height: ${this.game?.cellSize}px"></li-minesweeper-mine>
                        `
                    })}
                </div >
            `)}
        `
    }

    static get properties() {
        return {
            game: { type: Object, local: true },
        }
    }
})

customElements.define('li-minesweeper-mine', class LiMinesweeperMine extends LiElement {
    static get styles() {
        return css`
            :host {
                position: relative;
                box-sizing: border-box;
                width: 100%;
                height: 100%;
                outline: 1px solid lightgray;
                outline-offset: 0px;
            }
            .btn {
                width: 100%;
                height: 100%;
                z-index: 9;
                box-sizing: border-box;
                background-color: darkgray;   
            }
            .floor {
                display: flex;
                align-items: center;
                justify-content: center;
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0px;
                align-items: center;
                z-index: -1;
            }
        `;
    }

    render() {
        return html`
            <style >
                .floor {
                    font-size: ${12 + ((this.game?.cellSize - 36) > 0 ? this.game?.cellSize - 36 : 0)}px;
                }
                .btn {
                    opacity: ${this.game.babyMode ? .8 : 1};
                    cursor: ${this.mine?.status === 'opened' ? 'default' : 'pointer'}
                }
                .btn:hover {
                    background-color: gray;
                }
            </style >
            ${this.count !== 0 ? html`
                <div class="floor" style="color: ${this.colors[this.count]}">${this.count}</div>
            ` : html``}
            ${this.mine?.status !== 'opened' ? html`
                <li-icon fill="red" name=${this.icon} class="btn" @click=${this.onTap} @pointerdown=${this.pointerdown} @pointerup=${this.pointerup} width="100%" height="100%" back="darkgray" radius=0 size=${this.game.cellSize} scale=.5></li-icon >
            ` : html``}
        `
    }

    static get properties() {
        return {
            game: { type: Object, local: true },
            colors: { type: Array, default: ['', 'blue', 'green', 'red', 'magenta', 'orange'] },
            mine: { type: Object },
            count: { type: Number }
        }
    }
    get icon() { return this.mine?.status === 'error' ? 'close' : this.mine?.status === 'locked' ? 'check' : this.mine?.status === 'bang' ? 'flare' : '' }

    async updated(e) {
        if (e.has('mine') && this.mine) {
            this.mine.el = this;
        }
    }

    get count() {
        if (!this.mine || this.mine?.mine) return 0;
        let count = 0;
        for (let x = (this.mine.x - 1); x <= (this.mine.x + 1); x++) {
            for (let y = (this.mine.y - 1); y <= (this.mine.y + 1); y++) {
                const item = this.game.model.find(i => (i.y === y && i.x === x))
                if (!item) continue;
                if (item === this.mine) continue;
                if (!item.mine) continue;
                count++;
            }
        }
       return count;
    }
    timerStart() {
        if (!this.game.timerStartInterval) {
            this.game.end = (new Date()).getTime();
            this.game.timerStartInterval = setInterval(() => {
                this.game.today = (new Date()).getTime();
            }, 48);
        }
    }
    pointerdown(e) {
        this.timerStart();
        this._startTime = new Date().getTime();
        if (e.button > 0) this.setLocked();
    }
    pointerup(e) {
        if (new Date().getTime() - this._startTime > 200) this.setLocked();
    }
    setLocked() {
        if (this.mine.status === 'locked') {
            this.mine.status = ''
            this._locked = true;
            setTimeout(() => this._locked = false, 0);
        } else {
            this.mine.status = 'locked';
        }
        this.game.checkStatus();
        this.$update();
    }
    onTap(e) {
        if (this._locked || this.mine.status === 'locked') return;
        if (this.mine.mine) {
            this.mine.error = true;
            this.game.bang();
        }
        else
            this.open();
        this.$update();
    }
    open() {
        if (this.mine.status === 'opened') return;
        if (this.mine.mine) return;
        this.mine.status = 'opened';
        if (this.count === 0) {
            for (let x = (this.mine.x - 1); x <= (this.mine.x + 1); x++) {
                for (let y = (this.mine.y - 1); y <= (this.mine.y + 1); y++) {
                    const item = this.game.model.find(i => (i.y === y && i.x === x))
                    if (!item) continue;
                    if (item === this.mine) continue;
                    item.el.open();
                }
            }
        }
        this.game.checkStatus(true);
    }
})
