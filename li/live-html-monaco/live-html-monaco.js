import { LiElement, html, css } from '../../li.js';

import '../editor-iframe-monaco/editor-iframe-monaco.js';
import '../button/button.js';
import { LZString } from '../../lib/lz-string/lz-string.js';

customElements.define('li-live-html-monaco', class LiLiveHTMLMonaco extends LiElement {
    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: lightgray; } ::-webkit-scrollbar-thumb { background-color: gray; }
            #main {
                position: relative;
                display: flex;
                height: calc(100% - 28px);
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
            .btns {
                display: flex;
                flex-direction: row-reverse;
                align-items: center;
            }
            .hidden {
                display: none;
            }
        `;
    }

    render() {
        return html`
            <div class="btns">
                <li-button name="filter-2" @click="${() => this._resize(0)}" style="margin-right:8px" border="none"></li-button>
                <li-button name="more-vert" @click="${() => this._resize(this.$id('main').offsetWidth / 2)}" style="margin-right:4px" border="none"></li-button>
                <li-button name="filter-1" @click="${() => this._resize(this.$id('main').offsetWidth)}" style="margin-right:4px" border="none"></li-button>
                <li-button name="launch" @click=${this._open} title="open in new window" style="margin-right:8px" border="none"></li-button>
                <li-button name="refresh" @click="${this._reload}" title="reload page" style="margin-right:4px" border="none"></li-button>
                <label style="margin-right: auto; padding-left: 4px; color: gray">li-live-html Preview</label>
            </div>
            <div id="main">
                <div class="main-panel ${this._widthL <= 0 ? 'hidden' : ''}" style="width:${this._widthL}px; overflow: hidden">
                    <li-editor-iframe-monaco id="editor" @change=${this._change} src=${this.src} mode="html"></li-editor-iframe-monaco>
                </div>
                <div class="splitter ${this._action === 'splitter-move' ? 'splitter-move' : ''}" @pointerdown="${this._pointerdown}"></div>
                <div class="main-panel ${this._widthL >= this.$id('main')?.offsetWidth ? 'hidden' : ''}" style="flex: 1">
                    <iframe id="iframe" class="${this._action === 'splitter-move' ? 'iframe-pe' : ''}" .srcdoc=${this.srcIframe || ''} style="width: 100%; border: none; height: -webkit-fill-available" .hidden=${!this._ready}></iframe>
                </div>
            </div>
        `
    }

    static get properties() {
        return {
            _widthL: { type: Number, default: 600, save: true },
            src: { type: String, default: '' },
            srcIframe: { type: String, default: '' },
            lzs: { type: String, default: '' },
            _ready: { type: Boolean }
        }
    }
    get editor() {
        return this.$qs('#editor')?.editor;
    }

    async firstUpdated() {
        super.firstUpdated();
        await new Promise((r) => setTimeout(r, 0));
        this._location = window.location.href;
        let _s = this._location.split('?')[1];
        _s = _s || this.lzs;
        this.src = _s ? LZString.decompressFromEncodedURIComponent(_s) : this.lzs || this.src;
        this.srcIframe = cssIframe + this.src;
        this._ready = true;
        this.$update();
    }

    _change(e) {
        LI.debounce('_change', () => {
            this.editorValue = e?.detail?.value || e?.detail;
            this.srcIframe = cssIframe + (this.editorValue || '');
            this.$update;
        }, 500);
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
            this.fire('resize');
        }
    }
    _open() {
        let url = this.$url.replace('live-html-monaco.js', 'index.html#?') + LZString.compressToEncodedURIComponent(this.editorValue);
        window.open(url, '_blank').focus();
    }
    _reload() {
        document.location.href = this.$url.replace('live-html-monaco.js', 'index.html#?') + LZString.compressToEncodedURIComponent(this.editorValue);
        setTimeout(() => {
            window.location.reload();
        }, 100);
    }
    _resize(v) {
        this._widthL = v;
        requestAnimationFrame(() => {
            this.fire('resize');
            this.$update();
        });
    }
})

const cssIframe = `
<style>
    body { font-family: Roboto, Noto, sans-serif; line-height: 1.5; }
    ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: lightgray; } ::-webkit-scrollbar-thumb { background-color: gray; }
</style>
`
