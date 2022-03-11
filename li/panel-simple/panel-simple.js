import { LiElement, html, css } from '../../li.js';

import '../button/button.js';
import '../icon/icon.js';

customElements.define('li-panel-simple', class LiPanelSimple extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                position: relative;
                overflow: hidden;
                min-height: 32px;
            }
            .panel_header {
                display: flex;
                flex: 1;
                align-items: center;
                overflow: hidden;
                max-height: 28px;
                min-height: 28px;
                margin: 1px;
                border: 1px solid grey;
                cursor: pointer; 
                background-color: lightgray;
            }
            .panel_content {
                flex: 1; 
                overflow: hidden;
                margin: 1px;
                border: 1px solid darkgrey; 
            }
        `;
    }

    render() {
        return html`
            <style>
                :host {
                    flex: ${this.src?.open || this.src?.opened ? 1 : 0};
                }
            </style>
            <div class="panel_header" @click=${this.onopened}>
                ${this.src?.open ? html`` : html`
                    <li-icon name="arrow-drop-down" rotate=${this.src?.opened ? 0 : 270} size="18"></li-icon> 
                `}
                ${this.src?.icon ? html`
                    <li-icon name=${this.src?.icon} size="16" style="padding-left: 4px;"></li-icon>
                ` : html``}  
                <span style="padding-left: 8px">${this.src?.label || 'li-panel-simple'}</span>
                <div class="flex"></div>
                ${Object.keys(this.src?.btns || {}).map(key => html`
                    <li-button class="btn" name=${this.src?.btns[key]} size="16" title=${key}></li-button>
                `)}
            </div>
            ${this.src?.open || this.src?.opened ? html`
                <div class="panel_content">
                    <slot>${this.src.content}</slot>
                </div>
            ` : html``}
        `
    }

    constructor() {
        super();
    }
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener("li-panel-simple-click", (e) => {
            const src = e?.detail?.src;
            if (e?.detail?.uuid === this.uuid && src?.oneShow && src.oneShow === this.src.oneShow) {
                this.src.opened = this.src === src;
            }
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener("li-panel-simple-click");
    }
    firstUpdated() {
        super.firstUpdated();
    }
    updated(changedProperties) {
        if (changedProperties.has('')) { };
    }

    static get properties() {
        return {
            src: { type: Object, default: {} },
        }
    }

    onopened() {
        if (this.src.oneShow) {
            document.dispatchEvent(new CustomEvent("li-panel-simple-click", {
                detail: { src: this.src, uuid: this.uuid }
            }))
        } else {
            this.src.opened = !this.src.opened;
            this.$update();
            console.log(this.src.opened)
        }
    }
})
