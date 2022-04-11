import { LiElement, html, css } from '../../li.js';

import '../property-grid/property-grid.js';
import '../layout-app/layout-app.js';
import '../button/button.js';
import '../icon/icons/icons.js';
import { indx } from './indx.js';
import '../router/router.js';

customElements.define('li-tester', class LiTester extends LiElement {
    static get properties() {
        return {
            label: { type: String, default: '' },
            component: { type: Object, default: undefined },
            _focused: { type: String, default: '', save: true },
            _tabs: { type: String, default: 'apps', save: true }
        }
    }

    get _localName() { return this._locName || this.component?.localName || 'li-tester' }
    get hide() { return this.component?.localName === 'iframe' ? 'r' : '' }

    static get styles() {
        return css`
            :host {
                color: gray;
                font-family: Arial;
                position: relative;
            }
        `;
    }

    render() {
        return html`
            <li-layout-app sides="300,300" fill="#9f731350" id="li-layout-app-tester" hide=${this.hide}>
                <div slot="app-top">
                    <div>${this._focused}</div>
                </div>
                <div slot="app-main" ref="main">
                    <slot @slotchange=${this.slotchange} id="slot"></slot>
                    <slot name="app-test"></slot>
                </div>
                <div slot="app-left" style="display: flex; flex-direction: column;">
                    <div style="displa: flex; padding: 4px;"><a href="https://github.com/resu062/li-js" target="_blank">https://github.com/resu062/li-js</a></div>
                    <div style="display: flex; flex-wrap: wrap; width: 100%; border-top: 1px solid gray; border-bottom: 1px solid gray; margin-bottom: 8px; padding: 2px; position: sticky; top: 0; background-color: lightyellow; justify-content: left">    
                        <li-button name="apps" width="70" @click=${() => this._tabs = 'apps'} back=${this._tabs === 'apps' ? '#e0e0e0' : ''}>Apps</li-button>
                        <li-button name="extension" width="70" @click=${() => this._tabs = 'demo'} back=${this._tabs === 'demo' ? '#e0e0e0' : ''}>Demo</li-button>
                        <li-button name="settings" width="144" @click=${() => this._tabs = 'comp'} back=${this._tabs === 'comp' ? '#e0e0e0' : ''}>Components</li-button>
                    </div>
                    <div style="padding-left:4px;display:flex;flex-direction:column; align-items: left; justify-content: center; overflow: auto">
                        ${Object.keys(indx).map(key => indx[key].type !== this._tabs ? html`` : html`
                            <li-button style="border-radius:4px" .indx=${indx[key]} .label2="${key}" label=${indx[key].label} width="auto" @click=${(e) => this._tap(e, key)}
                                back=${this._focused === key ? '#e0e0e0' : ''}></li-button>
                            <div style="display: flex;font-size:10px;flex-wrap:wrap">${indx[key.replace('li-', '')].map(i => html`
                                <li-button height="12" border="none" padding="2px" .indx=${i} label=${i.label} width="auto" @click=${this._openUrl}></li-button>`)}
                            </div>  
                        `)}
                    </div>
                </div>
                <li-property-grid slot="app-right" id="li-layout-app-tester" .io=${this.component} label="${this._focused}"></li-property-grid>
            </li-layout-app>
        `;
    }

    constructor() {
        super();
        LI.router.create(hash => {
            hash = hash.replaceAll('#', '');
            this._go(hash);
        });
    }
    firstUpdated() {
        super.firstUpdated();
        this._focused = this._focused === 'li-tester' ? '' : this._focused;
        if (this._focused) {
            this._tap(null, this._focused);
        }
    }

    slotchange(updateComponent = false) {
        if (!(updateComponent === true && this.component)) this.component = this.shadowRoot.querySelectorAll('slot')[0].assignedElements()[0];
    }
    _tap(e, key) {
        key = this._locName = e?.target?.label2 || e?.target?.label || key;
        LI.router.go("#" + key);
    }
    async _go(key) {
        if (this.component)
            this.removeChild(this.component);
        if (!this._wasRemoved) this.$refs('main').removeChild(this.$id('slot'));
        this._wasRemoved = true
        this._focused = key;
        let props = { ...indx[key].props, _partid: this.partid };
        if (props.iframe && props.iframe !== 'noiframe') {
            this.component = document.createElement("iframe");
            this.component.src = props.iframe;
            this.component.style.border = 'none';
        } else {
            this.component = await LI.createComponent(key, props);
        }
        this.component.setAttribute('slot', 'app-test');
        this.appendChild(this.component);
        this.slotchange(true);
    }

    _openUrl(e) {
        window.open(e.target.indx.url, 'li-url');
    }
});
