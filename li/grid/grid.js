import { LiElement, html, css } from '../../li.js';

import '../splitter/splitter.js';

customElements.define('li-grid', class LiGrid extends LiElement {
    static get styles() {
        return css`
            :host: {
                height: 100%;
                width: 100%;
            }
            * {
                box-sizing: border-box;
            }
            .wrapper {
                display: flex;
                flex: 1;
                width: 100%;
                height: 100%; 
                border: 1px solid lightgray;

            }
            .panel-left, .panel-right, .panel-main  {
                display: flex;
                border: 1px solid darkgray;
                z-index: 1;
                overflow: auto;
            }
            .panel-main  {
                flex: 1;
            }
            .panel-left {
                background-color: #f0f0f0; 
                position: sticky;
                left: 0;
            }
            .panel-right {
                background-color: #f0f0f0; 
                position: sticky;
                right: 0;
            }
            li-grid-table {
                flex: 1;
            }
            li-splitter {
                z-index: 1;
            }
        `;
    }

    render() {
        return html`
            <div class="wrapper">
                <div class="panel-left" style="width: ${this.left}px">
                    <li-grid-table count=2></li-grid-table>
                </div>
                <li-splitter id="grid-splitter-left" color="lightgray" size="2px" use_px></li-splitter>
                <div class="panel-main">
                    <li-grid-table count=20></li-grid-table>
                </div>
                <li-splitter id="grid-splitter-right" color="lightgray" size="2px" use_px reverse></li-splitter>
                <div class="panel-right" style="width: ${this.right}px">
                    <li-grid-table count=2></li-grid-table>
                </div>
            </div>
        `;
    }

    static get properties() {
        return {
            data: { type: Object, local: true },
            left: { type: Number, default: '300', save: true },
            right: { type: Number, default: '300', save: true }
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
                <header>
                    <li-grid-header count=${this.count}></li-grid-header>
                </header>
                <div class="table" style="">
                
                </div>
                <footer></footer>
            </div>
        `;
    }

    static get properties() {
        return {
            count: { type: Number, default: 0 }
        }
    }

    constructor() {
        super();
    }

})

customElements.define('li-grid-header', class LiGridRow extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                height: 100%;
            }
            .cell {
                min-width: 100px;
                text-align: center;
            }
        `;
    }

    render() {
        return html`
            ${Array.from(Array(this.count).keys()).map(i => html`
                <div class="cell">Cell</div>
                <li-splitter use_px color="gray" size="1px"></li-splitter>
            `)}
        `;
    }

    static get properties() {
        return {
            count: { type: Number, default: 0 }
        }
    }

    constructor() {
        super();
    }

})

customElements.define('li-grid-row', class LiGridRow extends LiElement {
    static get styles() {
        return css`

        `;
    }

    render() {
        return html`

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

customElements.define('li-grid-cell', class LiGridCell extends LiElement {
    static get styles() {
        return css`

        `;
    }

    render() {
        return html`

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
