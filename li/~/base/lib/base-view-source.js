import { LiElement, html, css } from '../../../../li.js';

import '../../../button/button.js';
import '../../../checkbox/checkbox.js';
import '../../../editor-ace/editor-ace.js';

customElements.define('li-base-view-source', class LiBaseViewSource extends LiElement {
    static get styles() {
        return css`
        `;
    }
    render() {
        return html`
            <li-editor-ace src=${this.src} theme="cobalt" mode="json" .options=${{ fontSize: 16, minLines: 100 }}></li-editor-ace>
        `
    }

    static get properties() {
        return {
            type: { type: String, default: 'source' },
            src: { type: String, default: '', global: true }
        }
    }

    firstUpdated() {
        super.firstUpdated();
    }
})
