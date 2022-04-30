import { LiElement, html, css } from '../../li.js';

import '../icon/icon.js'
import '../button/button.js'
import '../splitter/splitter.js';

customElements.define('li-grid', class LiGrid extends LiElement {
    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 0px; height: 2px; } ::-webkit-scrollbar-track { background: lightgray; margin-top: -20px} ::-webkit-scrollbar-thumb {  background-color: black }    

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
                    <li-grid-table .columns=${this.colLeft} type="left"></li-grid-table>
                </div>
                <li-splitter id="grid-splitter-left" color="lightgray" size="2px" use_px></li-splitter>
                <div class="panel-main">
                    <li-grid-table .columns=${this.colMain} type="main"></li-grid-table>
                </div>
                <li-splitter id="grid-splitter-right" color="lightgray" size="2px" use_px reverse></li-splitter>
                <div class="panel-right" style="width: ${this.right}px">
                    <li-grid-table .columns=${this.colRight} type="right"></li-grid-table>
                </div>
            </div>
        `;
    }

    static get properties() {
        return {
            data: { type: Object, local: true },
            left: { type: Number, default: 300, save: true },
            right: { type: Number, default: 300, save: true },
            headersLevel: { type: Number, default: 3.3, local: true }
        }
    }
    get colLeft() { return this.data?.columns?.filter(i => i.fix === 'left') }
    get colRight() { return this.data?.columns?.filter(i => i.fix === 'right') }
    get colMain() { return this.data?.columns?.filter(i => i.fix !== 'left' && i.fix !== 'right') }

    constructor() {
        super();
        this.listen('endSplitterMove', (e) => {
            if (e.detail.id === 'grid-splitter-right') this.right = e.detail.w;
            if (e.detail.id === 'grid-splitter-left') this.left = e.detail.w;
        })
        this.listen('changeLevels', () => this.setLevel());
    }

    setLevel() {
        const tables = this.$qsa('li-grid-table');
        let levels = [];
        tables.map(i => levels.push(i.level));
        //this.headersLevel = Math.max(...levels);
        this.$update();
    }
})

customElements.define('li-grid-table', class LiGridTable extends LiElement {
    static get styles() {
        return css`  
            * {
                box-sizing: border-box;
            }        
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
                /* display: flex; */
                align-items: center;
                min-width: 100%;
                /* flex-shrink: 0; */
                min-height: 32px;
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
                <header style="min-height: ${this.headersLevel * 32}px; max-height: ${this.headersLevel * 32}px">
                    <li-grid-header .columns=${this.columns} type=${this.type}></li-grid-header>
                </header>
                <div class="table" style="">
                
                </div>
                <footer></footer>
            </div>
        `;
    }

    static get properties() {
        return {
            columns: { type: Array },
            type: { type: String },
            headersLevel: { type: Number, local: true }
        }
    }
    get level() { return Math.ceil((this.$qs('li-grid-header').offsetHeight + this.$qs('li-grid-header').scrollHeight) / 32) }

    constructor() {
        super();
    }

})

customElements.define('li-grid-header', class LiGridRow extends LiElement {
    static get styles() {
        return css`
            :host::-webkit-scrollbar { width: 0px; height: 1px; } :host::-webkit-scrollbar-track { background: lightgray; } :host::-webkit-scrollbar-thumb {  background-color: black; }    

            * {
                box-sizing: border-box;
            }
            :host {
                display: flex;
                height: 100%;
                align-items: center;
                overflow-x: auto;
            }
            .cell {
                width: 100%;
                min-width: 100px;
                text-align: center;
                min-height: 32px;
            }
        `;
    }

    render() {
        return html`
            ${this.columns?.map(i => html`
                <li-grid-header-cell .item=${i} class="cell" style="width: ${i.width || 'unset'}; flex: ${i.hideSplitter ? '1' : 'unset'}; overflow: hidden" type=${this.type} level=${this.level}>${i.name || '...'}</li-grid-header-cell>
                ${i.hideSplitter ? html `` : html`
                    <li-splitter use_px color="gray" size="1px"></li-splitter>
                `}
            `)}
        `;
    }

    static get properties() {
        return {
            columns: { type: Array },
            type: { type: String },
            level: { type: Number, default: 1 }
        }
    }

    constructor() {
        super();
    }



})

customElements.define('li-grid-header-cell', class LiGridCell extends LiElement {
    static get styles() {
        return css`
            * {
                box-sizing: border-box;
            }
            :host {
                display: flex;
                flex-direction: column;
                justify-content: center;
                height: 100%;
                min-height: 32px;
            }
            .row {
                display: flex;
                /* flex-direction: column; */
                /* height: 100%; */
                align-items: center;
            }
            .cell {
                width: 100%;
                min-width: 100px;
                text-align: center;
                padding: 0 4px;
            }
        `;
    }

    render() {
        return html`
            <div class="row" style="border-bottom: ${this.item?.expanded ? '1px solid gray' : 'unset'}">
                ${this.item?.items?.length ? html`
                    <li-button back="transparent" name="chevron-right" border="0" toggledClass="right90" .toggled="${this.item?.expanded}" @click="${(e) => this._expanded(e)}" size="22"></li-button>
                ` : html``}
                <div class="cell" >${this.item?.name || '...'}</div>
            </div>
            ${this.item?.items?.length && this.item?.expanded ? html`
                <li-grid-header .columns=${this.item.items} type=${this.type} level=${this.level + 1}></li-grid-header>
            ` : html``}
        `;
    }

    static get properties() {
        return {
            item: { type: Object },
            type: { type: String },
            level: { type: Number }
        }
    }

    constructor() {
        super();
    }
    _expanded(e) {
        this.item.expanded = e.target.toggled;
        this.fire('changeLevels');
        console.log(this.type, this.level);
        this.$update();
    }

})

customElements.define('li-grid-row-cell', class LiGridRow extends LiElement {
    static get styles() {
        return css`
            :host {
                width: 100%;
                height: 100%;
                border: 1px solid red;
            }
        `;
    }

    render() {
        return html`
            <div>

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


