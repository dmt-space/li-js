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
                    flex: ${this.src?.open || this.src.opened ? 1 : 0};
                }
            </style>
            <div class="panel_header" @click=${this.opened}>
                ${(this.tabs || []).map((i, idx) => html`
                    ${this.src?.open || i.open || idx > 0 ? html`` : html`
                        <li-icon name="arrow-drop-down" rotate=${this.src.opened ? 0 : 270} size="18"></li-icon> 
                    `}
                    ${i.icon ? html`
                        <li-icon name=${i.icon || ''} size="16" @click=${(e) => this.tabclick(e, idx)} style="padding: 0 4px; opacity: ${this.idx === idx ? 1 : .3}"></li-icon>
                    ` : html``}
                    ${i.label ? html`
                        <span @click=${(e) => this.tabclick(e, idx)} style="padding: 0 4px 0 4px; opacity: ${this.idx === idx ? 1 : .3}">${i.label || ''}</span>
                    ` : html``}  
                    <div style="height: 100%; width: 1px; border-right: ${this.tabs.length > 1 ? '1px solid darkgray' : 'unset'};"></div>
                `)}
                <div style="flex: 1"></div>
                ${this.src?.open || this.src?.opened ? html`
                    ${(this.tabs[this.idx]?.btns || []).map(btn => html`
                        <li-button class="btn" size=18 width=${btn.width || 'auto'} name=${btn.icon} title=${btn.title || btn.label || btn.icon} @click=${this.btnclick} radius="2px" scale=.8
                            style="font-size: 14px">${btn.label || ''}</li-button>
                    `)}
                    <div style="width: 4px"></div>
                ` : html``}
            </div>
            ${this.src?.open || this.src?.opened ? html`
                <div class="panel_content" style="flex: 1; overflow: auto;">
                    <slot name=${this.tabs[this.idx].label}>${this.tabs[this.idx].content}</slot>
                </div>
            ` : html``}
        `
    }

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener("li-panel-simple-click", (e) => {
            const src = e?.detail?.src;
            if (e?.detail?.uuid === this.uuid && src?.single && src.single === this.src?.single) {
                this.src.opened = this.src === src;
            }
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener("li-panel-simple-click");
    }

    static get properties() {
        return {
            src: { type: Object, default: {} },
            uuid: { type: Object, local: true },
            idx: { type: Number, default: 0 }
        }
    }
    get tabs() { return this.src?.tabs || (this.src ? [this.src] : []) }

    opened() {
        if (this.src?.single) {
            document.dispatchEvent(new CustomEvent("li-panel-simple-click", {
                detail: { src: this.src, uuid: this.uuid }
            }))
        } else {
            this.src.opened = !this.src?.opened;
        }
        this.$update();
    }
    btnclick(e) {
        e.stopPropagation();
        this.fire('li-panel-simple-click', { uuid: this.uuid, btn: e.target.title, src: this.src });
    }
    tabclick(e, idx) {
        e.stopPropagation();
        if (this.tabs.length > 1) {
            this.idx = idx;
            this.src.opened = true;
            this.$update();
        } else {
            this.opened();
        }
    }
})
