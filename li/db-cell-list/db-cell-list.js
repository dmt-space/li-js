import { LiElement, html, css } from '../../li.js';

import '../db-cell/db-cell.js';

customElements.define('li-db-cell-list', class LiDbCellList extends LiElement {
    static get properties() {
        return {
            list: { type: Array, default: [] },
            width: { type: String, default: 'auto' }
        }
    }

    static get styles() {
        return css`
            .db-list {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: stretch;
                border: 1px solid gray;
                flex: 1;
                padding: 2px;
                background-color: #eeeeee;
                box-sizing: border-box;
            }
        `;
    }

    render() {
        return html`
            <div class="db-list" style="width: ${this.width}">
                ${this.list.map(i => html`<li-db-cell icon="${i.icon}" label="${i.label}" action="${i.action}" .callback="${i.callback}" hideIcons="${i.hideIcons}"></li-db-cell>`)}
            </div>
        `;
    }

});