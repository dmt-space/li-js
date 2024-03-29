import { LiElement, html, css } from '../../li.js';

import '../editor-html/editor-html.js';
import '../button/button.js';
import { LZString } from '../../lib/lz-string/lz-string.js';

customElements.define('li-live-wysiwyg', class LiLiveWysiwyg extends LiElement {
    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; }
            ::-webkit-scrollbar-track { background: lightgray; }
            ::-webkit-scrollbar-thumb { background-color: gray; }
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
            ${this._full ? html`
                <div id="main" style="height: 100%;">
                    <iframe id="iframe" .srcdoc=${this.src || ''} style="width: 100%; border: none; height: -webkit-fill-available;"></iframe>
                </div>
            ` : html`
                <div class="btns">
                    <li-button name="filter-2" @click="${() => this._resize(0)}" style="margin-right:8px" border="none"></li-button>
                    <li-button name="more-vert" @click="${() => this._resize(this.$id('main').offsetWidth / 2)}" style="margin-right:4px" border="none"></li-button>
                    <li-button name="filter-1" @click="${() => this._resize(this.$id('main').offsetWidth)}" style="margin-right:4px" border="none"></li-button>
                    <li-button name="launch" @click=${this._open} title="open in new window" style="margin-right:8px" border="none"></li-button>
                    <li-button name="fullscreen" @click=${this._openFull} size="32" title="open in new window" style="margin-right:4px" border="none"></li-button>
                    <label style="margin-right: auto; padding-left: 4px; color: gray">li-live-wisywyg Preview</label>
                </div>
                <div id="main">
                    <div class="main-panel ${this._widthL <= 0 ? 'hidden' : ''}" style="width:${this._widthL}px">
                        <li-editor-html id="editor" @change=${() => this._change()}></li-editor-html>
                    </div>
                    <div class="splitter ${this._action === 'splitter-move' ? 'splitter-move' : ''}" @pointerdown="${this._pointerdown}"></div>
                    <div class="main-panel ${this._widthL >= this.$id('main')?.offsetWidth ? 'hidden' : ''}" style="flex: 1;">
                        <iframe id="iframe" class="${this._action === 'splitter-move' ? 'iframe-pe' : ''}" .srcdoc=${this.src || ''} style="width: 100%; border: none; height: -webkit-fill-available;" .hidden=${!this._ready}></iframe>
                    </div>
                </div>
            `}
        `
    }

    static get properties() {
        return {
            _widthL: { type: Number, default: 0 },
            src: { type: String, default: '' },
            lzs: { type: String, default: '' },
            _ready: { type: Boolean },
            _full: { type: Boolean, default: true }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        this._location = window.location.href;
        let _s = this._location.split('?')[1];
        let arr = _s ? _s.split('&') : [];
        _s = arr[0] || this.lzs;
        this._full = arr[1]?.includes('_full');
        const int = setInterval(() => {
            if (this._full) {
                this.src = _s ? LZString.decompressFromEncodedURIComponent(_s) : this.src;
                clearInterval(int);
                this._change();
            } else if (this.$id('editor')?.editor) {
                this.$id('editor').value = _s ? LZString.decompressFromEncodedURIComponent(_s) : this.src;
                clearInterval(int);
                this._change();
            }
        }, 100);
    }

    _change() {
        LI.debounce('_change', () => {
            if (!this._full)
                this.src = cssIframe + this.$id('editor').value;
            this.$update;
            this._ready = true;
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
        let url = this.$url.replace('live-wysiwyg.js', 'index.html#?') + LZString.compressToEncodedURIComponent(this.$id('editor')?.value);
        window.open(url, '_blank').focus();
    }
    _openFull() {
        let url = this.$url.replace('live-wysiwyg.js', 'index.html#?') + LZString.compressToEncodedURIComponent(this.$id('editor')?.value) + '&_full';
        window.open(url, '_blank').focus();
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
    /* body { font-family: Roboto, Noto, sans-serif; line-height: 1.5; } */
    ::-webkit-scrollbar { width: 4px;  height: 4px; }
    ::-webkit-scrollbar-track { -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); }
    ::-webkit-scrollbar-thumb { border-radius: 3px; background: rgba(0,0,0,0.2); -webkit-box-shadow: inset 0 0 3px rgba(0,0,0,0.2); }
    ::-webkit-scrollbar-thumb:hover { background: gray; width: 12px; }
</style>
`
