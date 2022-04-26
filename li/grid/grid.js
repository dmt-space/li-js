import { LiElement, html, css } from '../../li.js';

import '../splitter/splitter.js';

customElements.define('li-grid', class LiGrid extends LiElement {
    static get styles() {
        return css`
            :host: {
                max-height: 100%; 
            }
            .wrapper {
                display: flex; 
                width: 100%;
                height: 100%; 
                border: 1px solid lightgray;
            }
            .panel-left, .panel-right {
                display: flex;
                background-color: #f0f0f0; 
                border: 1px solid darkgray;
                width: 100%;
            }
            .panel-main, .panel-right {
                display: flex;
                flex: 1;
                border: 1px solid gray;
                width: 100%;
            }
            li-grid-table {
                flex: 1;
            }
        `;
    }

    render() {
        return html`
            <div class="wrapper">
                <div style="width: ${this.right}%">
                    <div style="display: flex; width: 100%; height: 100%">
                        <div class="panel-left" style="width: ${this.left}%">
                            <li-grid-table></li-grid-table>
                        </div>
                        <li-splitter id="grid-splitter-left" color="lightgray" size="2px"></li-splitter>
                        <div class="panel-main">
                            <li-grid-table></li-grid-table>
                        </div>
                    </div>
                </div>
                <li-splitter id="grid-splitter-right" color="lightgray" size="2px"></li-splitter>
                <div class="panel-right">
                    <li-grid-table></li-grid-table>
                </div>
            </div>
        `;
    }

    static get properties() {
        return {
            left: { type: Number, default: '80', save: true },
            right: { type: Number, default: '20', save: true }
        }
    }

    constructor() {
        super();
        this.listen('endSplitterMove', (e) => {
            if (e.detail.id === 'grid-splitter-right') this.right = e.detail.w;
            if (e.detail.id === 'grid-splitter-left') this.left = e.detail.w;
        })
    }

})

customElements.define('li-grid-table', class LiGridTable extends LiElement {
    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: lightgray; } ::-webkit-scrollbar-thumb {  background-color: gray; }            
            .wrapper {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                flex-wrap: nowrap;
            }
            .table {
                flex-grow: 1;
                overflow: auto;
                min-height: 2em;
            }
            header, footer {
                display: flex;
                flex: 1;
                align-items: center;
                min-width: 100%;
                flex-shrink: 0;
                max-height: 28px;
                background-color: #d0d0d0; 
                z-index: 1;
            }
            header {
                border-bottom: 1px solid gray;
            }
            footer {
                border-top: 1px solid gray;
            }
        `;
    }

    render() {
        return html`
        <div class="wrapper">
            <header></header>
            <div class="table">
            
            </div>
            <footer></footer>
        </div>
        `;
    }

    static get properties() {
        return {

        }
    }

    constructor() {
        super();
    }

})
