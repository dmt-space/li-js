import { LiElement, html, css } from '../../li.js';

import '../button/button.js';
import { LZString } from '../../lib/lz-string/lz-string.js';

customElements.define('li-lzstring', class lzString extends LiElement {
    static get styles() {
        return css`
            .panel {
                display: flex; 
                flex-direction: column;
                height: 100vh; 
                max-width: 50vw;
            }
            .txtarea {
                flex: 1;
                margin: 2px;
                padding: 2px;
                border: 1px solid lightgray;
                width: 50vw;
                height: calc(100vh - 6px);
            }
            .focused {
                color: red;
            }
        `;
    }

    render() {
        return html`
            <div style="display: flex;">
                <div class="panel">
                    <div class="btns">
                        <div style="display: flex; justify-content: space-between; padding: 2px;">
                            <a href="https://pieroxy.net/blog/pages/lz-string/index.html" target="_blank">lz-string:</a>
                            <label>length = ${this.$id('txt1')?.value.length || 0}</label>
                        </div>
                        ${this.comm.map(i => html`
                            <li-button width="auto" .back="${!i.includes('deco') ? 'lightyellow' : '#FFF5EE'}">
                                <span style="padding: 4px" @click=${() => this._lzString(i, 'txt1', 'txt2')} class="${this._focused_txt1 === i ? 'focused' : ''}">
                                    ${i}
                                </span>
                            </li-button>
                        `)}
                        <li-button name="close" @click=${() => { this._focused_txt1  = this.$id('txt1').value = ''; this.$update() }}></li-button>
                    </div>
                    <textarea class="txtarea" id="txt1" @input=${() => this.$update()}></textarea>
                </div>
                <div class="panel">
                    <div class="btns">
                        <div style="display: flex; justify-content: space-between; padding: 2px;">
                            <a href="https://github.com/pieroxy/lz-string/" target="_blank">lz-string:</a>
                            <label>length = ${this.$id('txt2')?.value.length || 0}</label>
                        </div>
                        ${this.comm.map(i => html`
                            <li-button width="auto" .back="${!i.includes('deco') ? 'lightyellow' : '#FFF5EE'}">
                                <span style="padding: 4px" @click=${() => this._lzString(i, 'txt2', 'txt1')} class="${this._focused_txt2 === i ? 'focused' : ''}">
                                    ${i}
                                </span>
                            </li-button>
                        `)}
                        <li-button name="close" @click=${() => { this._focused_txt2 = this.$id('txt2').value = ''; this.$update() }}></li-button>
                    </div>
                    <textarea class="txtarea" id="txt2"></textarea>
                </div>
            </div>
            
        `;
    }

    static get properties() {
        return {
            comm: {
                type: Array, default: ['compress', 'decompress', 'compressToUTF16', 'decompressFromUTF16',
                    'compressToBase64', 'decompressFromBase64', 'compressToEncodedURIComponent', 'decompressFromEncodedURIComponent',
                    'encodeURIComponent - JS', 'decodeURIComponent - JS']
            },
            _focused_txt1: { type: String },
            _focused_txt2: { type: String }
        }
    }

    _lzString(_comm, _in, _out) {
        if (!this.$id(_in).value) return;
        this['_focused_' + _in] = _comm;
        if (this['_focused_' + _in] === 'encodeURIComponent - JS') this['_focused_' + _out] = 'decodeURIComponent - JS';
        else if (this['_focused_' + _in] === 'decodeURIComponent - JS') this['_focused_' + _out] = 'encodeURIComponent - JS';
        else this['_focused_' + _out] = _comm.startsWith('de') ? _comm.replace('de', '').replace('From', 'To') : 'de' + _comm.replace('To', 'From');
         try {
            if (_comm.includes('- JS')) {
                this.$id(_out).value = _comm === 'encodeURIComponent - JS' ? encodeURIComponent(this.$id(_in).value) : decodeURIComponent(this.$id(_in).value);
            } else {
                this.$id(_out).value = LZString[_comm](this.$id(_in).value);
            }
        } catch (error) {
            this.$id(_out).value = 'error...';
            console.log(error);
        }
        this.$update();
    }
});
