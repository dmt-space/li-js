import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../layout-app/layout-app.js';

customElements.define('li-wiki', class LiWiki extends LiElement {
    static get properties() {
        return {
            data: {
                type: Array,
                default: [
                    { label: '000', order: 0 },
                    { label: '001', order: 1 },
                    { label: '002', order: 2 },
                    { label: '003', order: 3 },
                    { label: '004', order: 4 },
                ]
            }
        }
    }

    static get styles() {
        return css`
            .header {
                font-weight: 700;
            }
            .panel {
                padding:4px;
            }
            .main {
                display: flex;
                height: 100%;
            }
            .main-panel {
                margin: 4px;
                flex: 1;
                border: 1px solid lightgray;
            }
            .main-left {
                display: flex;
                flex-direction: column;
                padding: 4px;
            }
            [draggable] {
                user-select: none;
            }
        `;
    }

    render() {
        return html`
            <li-layout-app outside>
                <div slot="app-top" class="header">
                    li-wiki
                </div>
                <div slot="app-left" class="panel">
                    left-panel
                </div>
                <div slot="app-right" class="panel">
                    right-panel
                </div>
                <div slot="app-main" class="main">
                    <div class="main-panel main-left">
                        ${(this.data || []).map(i => html`
                            <li-wiki-box label="${i.label}" order="${i.order}"></li-wiki-box>
                        `)}
                    </div>
                    <div class="main-panel">

                    </div>
                </div>
            </li-layout-app>
        `;
    }

});

customElements.define('li-wiki-box', class LiWikiBox extends LiElement {
    static get properties() {
        return {
            label: { type: String, default: '' },
            order: { type: Number, default: 0 }
        }
    }

    static get styles() {
        return css`
                :host {
                    /* order: {{order}}; */
                    width: 100%;
                }
                .box {
                    border: 1px solid #666;
                    background-color: #ddd;
                    border-radius: .5em;
                    padding: 10px;
                    cursor: move;
                    margin: 2px;
                    height: 20px;
                }
                .box.over {
                    border: 3px dotted #666;
                }
                [draggable] {
                    user-select: none;
                }
        `;
    }

    render() {
        return html`
            <div draggable="true" class="box" 
                    @dragstart="${this.handleDragStart}" 
                    @dragend="${this.handleDragEnd}" 
                    @dragover="${this.handleDragOver}">
                ${this.label}
            </div>
        `;
    }

    handleDragStart(e) {
        e.target.style.opacity = '0.4';
    }
    handleDragEnd(e) {
        e.target.style.opacity = '1';
        this.order = 99;
    }
    handleDragOver(e) {
        e.preventDefault();
    }
});