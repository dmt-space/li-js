import { LiElement, html, css } from '../../../li.js';

import '../../button/button.js';
import '../../checkbox/checkbox.js';

customElements.define('li-base-view-desktop', class LiBaseViewDesktop extends LiElement {
    static get styles() {
        return css`

        `;
    }
    render() {
        return html`
            <div>desktop</div>
        `
    }

    static get properties() {
        return {
            type: { type: String, default: 'desktop' }
        }
    }
})
