import { LiElement, html, css } from '../../../li.js';

import '../../button/button.js';
import '../../checkbox/checkbox.js';
import '../../property-grid/property-grid.js';

customElements.define('li-base-view-props', class LiBaseViewProps extends LiElement {
    static get styles() {
        return css`

        `;
    }
    render() {
        return html`
            <li-property-grid></li-property-grid>
        `
    }

    static get properties() {
        return {
            type: { type: String, default: 'props' }
        }
    }
})
