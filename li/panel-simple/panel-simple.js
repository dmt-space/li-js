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
            }
            .panel_header {
                display: flex;
                flex: 1;
                align-items: center;
                overflow: hidden;
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
                    min-height: ${this.iconSize + 14}px;
                }
                .panel_header {
                    max-height: ${this.iconSize + 10}px;
                    min-height: ${this.iconSize + 10}px;
                }
            </style>
            <div class="panel_header" @click=${this.opened}>
                ${(this.tabs || []).map((i, idx) => html`
                    ${this.src?.open || i.open || idx > 0 ? html`` : html`
                        <li-icon name="arrow-drop-down" rotate=${this.src.opened ? 0 : 270} size=${this.iconSize}></li-icon> 
                    `}
                    ${i.icon ? html`
                        <li-icon name=${i.icon || ''} size=${this.iconSize - 2} @click=${(e) => this.tabclick(e, idx)} style="padding: 0 4px; opacity: ${this.idx === idx ? 1 : .3}" title=${i.title || i.label}></li-icon>
                    ` : html``}
                    ${i.label && !i.labelOnSelected || i.labelOnSelected && idx === this.idx ? html`
                        <span @click=${(e) => this.tabclick(e, idx)} style="padding: 0 4px 0 4px; opacity: ${this.idx === idx ? 1 : .3}; font-size: ${this.fontSize || 14}px;">${i.label || ''}</span>
                    ` : html``}  
                    <div style="height: 100%; width: 1px; border-right: ${this.tabs.length > 1 ? '1px solid darkgray' : 'unset'};"></div>
                `)}
                <div style="flex: 1"></div>
                ${this.src?.open || this.src?.opened ? html`
                    ${(this.tabs[this.idx]?.btns || []).map(btn => html`
                        <li-button class="btn" size=${this.iconSize} width=${btn.width || 'auto'} name=${btn.icon} title=${btn.title || btn.label || btn.icon} @click=${this.btnclick} radius="2px" scale=.8 toggledClass=${btn.toggledClass || ''} notoggledClass=${btn.notoggledClass || ''}><span style="font-size: ${this.fontSize ? this.fontSize - 2 : 14}px">${btn.label || ''} </span></li-button>
                    `)}
                    <div style="width: 2px"></div>
                ` : html``}
            </div>
            ${(this.src?.open || this.src?.opened) && (this.tabs[this.idx]?.btns_left?.length || this.tabs[this.idx]?.btns_right?.length) ? html`
                <div class="panel_buttons" style="display: flex; padding: 2px; border: 1px solid lightgray; margin: 0 1px 1px 1px; background-color: #f0f0f0">
                    ${(this.tabs[this.idx]?.btns_left || []).map(btn => html`
                        <li-button class="btn" size=${this.iconSize - 4} width=${btn.width || 'auto'} name=${btn.icon} title=${btn.title || btn.label || btn.icon} @click=${this.btnclick} radius="2px" scale=.8 toggledClass=${btn.toggledClass || ''} notoggledClass=${btn.notoggledClass || ''}><span style="font-size: ${this.fontSize ? this.fontSize - 2 : 14}px;">${btn.label || ''}</span></li-button>
                    `)}
                    <div style="flex: 1"></div>
                    ${(this.tabs[this.idx]?.btns_right || []).map(btn => html`
                        <li-button class="btn" size=${this.iconSize - 4} width=${btn.width || 'auto'} name=${btn.icon} title=${btn.title || btn.label || btn.icon} @click=${this.btnclick} radius="2px" scale=.8 toggledClass=${btn.toggledClass || ''} notoggledClass=${btn.notoggledClass || ''}><span style="font-size: ${this.fontSize ? this.fontSize - 2 : 14}px">${btn.label || ''}</span></li-button>
                    `)}
                </div>
            ` : html``}
            ${this.src?.open || this.src?.opened ? html`
                <div class="panel_content" style="flex: 1; overflow: auto;">
                    <slot name=${this.src?.tabs ? this.tabs[this.idx].label : ''}>${this.tabs[this.idx].content}</slot>
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
            idx: { type: Number, default: 0 },
            iconSize: { type: Number, default: 18},
            fontSize: { type: Number, default: 16}
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
        this.fire('li-panel-simple-click', { uuid: this.uuid, btn: e.target.title, src: this.src });
    }
})
