import { LiElement, html, css } from '../../li.js';

import '../layout-app/layout-app.js';
import '../wikis-db/wikis-db.js';
import '../panel-simple/panel-simple.js';
import '../jupyter/jupyter.js';
import '../button/button.js';

customElements.define('li-my-life', class LiMyLife extends LiElement {
    static get styles() {
        return css`
            .header {
                display: flex;
                align-items: center;
                color: gray;
                font-size: large;
            }
        `;
    }

    render() {
        return html`
            <li-layout-app>
                <div slot="app-top" class="header">
                    <div style="flex:1"></div>${this.name || 'my-life'}<div style="flex:1"></div>
                </div>
                <div slot="app-left">
                    <li-wikis-db name="my-life" rootLabel="my-life" sortLabel="persons" prefix="lfdb_"></li-wikis-db>
                </div>
                <div id="main" slot="app-main" style="display: flex; height: 100%;">
                    <li-panel-simple .src=${this.mainTabs}>
                        <li-jupyter slot="jupiter notebook"></li-jupyter>
                        <li-weeks slot="weeks"></li-weeks>
                        <li-family-tree slot="family tree" style="height: 100%:" style="display: ${this.selectedArticle?.items?.length ? 'none' : 'unset'}"></li-family-tree>
                    </li-panel-simple>
                </div>
                <div slot="app-right" slot="app-main" style="display: flex; height: 100%;">
                    <li-panel-simple .src=${this.rightTabs} style="height: 100%:">
                        <li-family-phase slot="phase"></li-family-phase>
                    </li-panel-simple>
                </div>
            </li-layout-app>
        `;
    }

    static get properties() {
        return {
            selectedArticle: { type: Object, local: true },
            mainTabs: {
                type: Object, default: {
                    open: true,
                    tabs: [
                        {
                            label: 'jupiter notebook', icon: 'edit',
                            btns: [
                                { icon: 'alarm' },
                                { icon: 'alarm-add' },
                                { icon: 'alarm-on' }
                            ],
                        },
                        {
                            label: 'weeks', icon: 'apps',
                            btns: [
                                { icon: 'auto_stories' }
                            ],
                        },
                        {
                            label: 'family tree', icon: 'tree-structure',
                            btns: [
                                { icon: 'arrow-back' },
                                { icon: 'arrow-forward' }
                            ],
                        }
                    ]
                }
            },
            rightTabs: {
                type: Object, default: {
                    open: true,
                    tabs: [
                        {
                            label: 'phase', icon: 'apps',
                            btns: [
                                { icon: 'add', title: 'add' }
                            ],
                        },
                        {
                            label: 'settings', icon: 'tree-structure',
                            btns: [
                                { icon: 'arrow-back' },
                                { icon: 'arrow-forward' }
                            ],
                        }
                    ]
                }
            },
        }
    }

    firstUpdated() {
        super.firstUpdated();
    }

})

customElements.define('li-weeks', class LiWeeks extends LiElement {
    static get styles() {
        return css`
            :host {
                width: 100%;
                display: flex;
                flex-direction: column;
                flex: 1;
                color: darkgray;
                font-size: 12px;
                text-align: center;
            }
            .year {
                display: flex;
                flex: 1;
            }
            .week {
                height: 20px;
                flex: 1;
                border: 1px solid lightgray;
                margin: 1px;
            }
        `;
    }
    
    render() {
        return html`
            <div class="year" style="position: sticky; top: 0px; ; background: white; z-index: 9; border-bottom: 1px solid darkgray; align-items: center">
                <div style="width: 14px"></div>
                ${this.arr(52).map(w => html`
                    <div style="height: 20px; flex: 1">${w + 1}</div>
                `)}
            </div>
            ${this.arr(99).map(y => html`
                <div style="display: flex; flex: 1; align-items: center;">
                    <div style="width: 14px">${y + 1}</div>
                    <div class="year">
                        ${this.arr(52).map(w => html`
                            <div class="week"></div>
                        `)}
                    </div>
                </div>
            `)}
        `
    }
    
    static get properties() {
        return {

        }
    }

    arr(count) {
        return [...Array(count).keys()];
    }
})

customElements.define('li-family-tree', class LiFamilyTree extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                flex: 1;
                color: red;
             }
        `;
    }
    
    render() {
        return html`
            <h3>${this.props}</h1>
        `
    }
    
    static get properties() {
        return {
            props: { type: String, default: 'li-family-tree' },
        }
    }
})

customElements.define('li-family-phase', class LiFamilyPhase extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                flex: 1;
                padding: 4px;
                color: gray;
             }
        `;
    }
    
    render() {
        return html`

        `
    }
    
    static get properties() {
        return {
            props: { type: String, default: 'li-phase' },
            
        }
    }
})

customElements.define('li-family-phase-row', class LiFamilyPhase extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                flex: 1;
                padding: 4px;
                color: gray;
             }
             input {
                border: none;
                border-bottom: 1px solid lightgray; 
                outline: none; 
                width: 100%; 
                color: blue; 
                font-size: 18;
                font-family: Arial;
            }
        `;
    }
    
    render() {
        return html`
            <span>birthday: </span><input type="datetime-local">
            <span>death date: </span><input type="datetime-local">
        `
    }
    
    static get properties() {
        return {
            props: { type: String, default: 'li-phase' },
            
        }
    }
})