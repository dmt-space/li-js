import { LiElement, html, css } from '../../li.js';

import '../editor-iframe/editor-iframe.js';

customElements.define('li-run-html', class LiRunHTML extends LiElement {
    static get properties() {
        return {
            _widthL: { type: Number, default: 600, save: true },
            src: { type: String, default: '' }
        }
    }

    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; }
            ::-webkit-scrollbar-track { background: lightgray; }
            ::-webkit-scrollbar-thumb { background-color: gray; }
            #main {
                display: flex;
                height: 100%;
                color: #505050;
            }
            .main-panel {
                margin: 4px;
                border: 1px solid lightgray;
                overflow: auto;
                min-width: 0;
            }
            .splitter {
                max-width: 4px;
                min-width: 4px;
                cursor: col-resize;
                z-index: 9;
            }
            .splitter:hover, .splitter-move {
                background-color: lightgray;
            }
            .iframe-pe {
                pointer-events: none;
            }
        `;
    }

    render() {
        return html`
            <div id="main">
                <div class="main-panel" style="width:${this._widthL}px">
                    <li-editor-iframe id="editor" @change=${() => this.$update()} .src=${this.src}></li-editor-iframe>
                </div>
                <div class="splitter ${this._action === 'splitter-move' ? 'splitter-move' : ''}" @pointerdown="${this._pointerdown}"></div>
                <div class="main-panel" style="flex: 1">
                    <iframe class="${this._action === 'splitter-move' ? 'iframe-pe' : ''}" .srcdoc=${this.$id('editor')?.value || ''} style="width: 100%; border: none; height: 100%"></iframe>
                </div>
            </div>
        `
    }

    _pointerdown(e) {
        e.stopPropagation();
        e.preventDefault();
        this._action = 'splitter-move';
        document.addEventListener("pointermove", this.__move = this.__move || this._move.bind(this), false);
        document.addEventListener("pointerup", this.__up = this.__up || this._up.bind(this), false);
        document.addEventListener("pointercancel", this.__up = this.__up || this._up.bind(this), false);
    }
    _up() {
        this._action = '';
        document.removeEventListener("pointermove", this.__move, false);
        document.removeEventListener("pointerup", this.__up, false);
        document.removeEventListener("pointercancel", this.__up, false);
        this.$update();
    }
    _move(e) {
        e.preventDefault();
        if (this._action = 'splitter-move') {
            this._widthL = this._widthL + e.movementX;
            this._widthL = this._widthL <= 0 ? 0 : this._widthL >= this.$id('main')?.offsetWidth ? this.$id('main').offsetWidth : this._widthL;
        }
    }
})
