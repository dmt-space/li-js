import { LiElement, html, css } from '../../li.js';

import '../button/button.js';

customElements.define('li-tester-cell', class LiTesterCell extends LiElement {
    static get properties() {
        return {
            type: { type: String, default: 'text' },
            value: { type: String, default: '' },
            props: { type: Object, default: undefined }
        }
    }

    static get styles() {
        return css`
                .cell {
                    position: sticky;
                    top: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 2px;
                    background-color: gray;
                    filter: brightness(95%);
                }
                #input {
                    font-size: 1em;
                    color: white;
                    font-family: Arial;
                    text-align: center;
                    outline: none; 
                    background: transparent; 
                    border: none;
                    flex: 1;
                    min-width: 0px;
                }  
                .cells {
                    text-align: left;
                    background: #f7f7f7; 
                    padding: 4px 2px;
                    border:1px solid lightgray;
                    border-top: 0px;
                    cursor: pointer;
                    justify-content: left;
                    flex: 1;
                }
                .cells:hover {
                    transition: .3s;
                    filter: brightness(85%);
                }
                .list {
                    overflow: auto;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                    border: 1px solid darkgray;
                }
        `;
    }

    render() {
        return html`
            <div class="cell">
                <input id="input" type="${this.type}" value="${this.value}" @keydown="${e => this._change(e)}" ?readonly="${this.props && this.props.readOnly}"/>
                ${this.props && this.props.hideButton ? html`` : html`
                    <li-button name="check" size="16" @click="${this._tap}"></li-button>
                `}
            </div>
            <div class="list">
                ${this.props && this.props.list ? this.props.list.map(l => html`<div class="cells" @click="${this._tap}">${l}</div>`) : ``}
            </div>
        `;
    }

    updated() {
        if (this.type === 'checkbox') this.$id('input').checked = this.value;
    }

    _change(e) {
        if (e.keyCode === 13) this.value = this.type === 'checkbox' ? e.target.checked : e.target.value;
    }

    _tap(e) {
        let el = this.$id('input');
        this.value = this.type === 'checkbox' ? el.checked : e.target.className ? e.target.innerText : el.value;
        LI.fire(document, "dropdownDataChange", { target: this, value: this.value });
    }
});