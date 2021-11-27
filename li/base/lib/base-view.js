import { LiElement, html, css } from '../../../li.js';

import '../../button/button.js';
import '../../checkbox/checkbox.js';
import '../../editor-ace/editor-ace.js';
import '../../editor-monaco/editor-monaco.js';
import './base-view-desktop.js';
import './base-view-props.js';
import './base-view-source.js';
import './base-view-table.js';

customElements.define('li-base-view', class LiBaseView extends LiElement {
    static get styles() {
        return css`

        `;
    }
    render() {
        return html`
            ${this.baseView === 'desktop' ? html`<li-base-view-desktop></li-base-view-desktop>` : html`` }
            ${this.baseView === 'props' ? html`<li-base-view-props></li-base-view-props>` : html`` }
            ${this.baseView === 'source' ? html`<li-base-view-source></li-base-view-source>` : html`` }
            ${this.baseView === 'table' ? html`<li-base-view-table></li-base-view-table>` : html`` }
        `
    }

    static get properties() {
        return {
            baseView: { type: String, default: 'desktop', global: true },
        }
    }

    firstUpdated() {
        super.firstUpdated();
        // this.$update();
        // this.$id('ace').src = JSON.stringify(e.detail.liitem.doc, null, 4);
        LI.listen('dbAction', (e) => {
            console.log(e);
            console.log(e.detail.action);
            this.baseView = e.detail.action;
            this.$update();
        })
    }
})
