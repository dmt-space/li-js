import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../table/table.js';
import '../layout-app/layout-app.js';
import '../button/button.js';
import '../icon/icons/icons.js';
import { indx } from './indx.js';

customElements.define('li-tester', class LiTester extends LiElement {
    static get properties() {
        return {
            options: { type: Object, default: undefined },
            label: { type: String, default: '' },
            component: { type: Object, default: undefined }
        }
    }

    get _columns() {
        return [
            { title: 'Name', field: 'name', width: 150, bottomCalc: 'count' },
            {
                title: 'Value', field: 'value', hozAlign: 'center', width: '100%', responsive: true,
                cellClick: async (e, cell, el = this.component) => {
                    var editor = document.createElement("input");
                    let type = cell.getData().type.name.toLowerCase();
                    switch (type) {
                        case 'number':
                            type = 'number';
                            break;
                        case 'boolean':
                            type = 'checkbox';
                            break;
                        default:
                            type = 'text';
                            break;
                    }
                    editor.setAttribute('type', type);
                    editor.value = cell.getValue()
                    let value = cell.getValue(),
                        name = cell.getData().name,
                        props = this.component.$props.get(name),
                        hFactor = props.list ? props.list.length + 1 : 1;

                    try {
                        let val = await LI.show('dropdown', 'tester-cell', { type, value, props }, { parent: e.target, useParent: true, intersect: true, hFactor })
                        cell.setValue(val.value)
                        el[cell.getData().name] = val.value;
                    } catch (err) { }
                }
            },
        ]
    }

    get localName() {
        return this.component && this.component.localName || 'li-tester'
    }

    static get styles() {
        return css`
            :host {
                color: gray;
                font-family: Arial;
            }
        `;
    }

    render() {
        return html`
            <li-layout-app sides="300,300" fill="#9f731350">
                <div slot="app-top">
                    <div>${this.localName}</div>
                </div>
                <div slot="app-main">
                    <slot @slotchange=${this.slotchange} id="slot"></slot>
                    <slot name="app-test"></slot>
                </div>
                <div slot="app-left" style="padding-left:4px;display:flex;flex-direction:column; align-items: left; justify-content: center">
                    ${Object.keys(indx).map(key => html`
                        ${key.startsWith('li-')
                ? html`<li-button style=" border-radius:4px;" .indx="${indx[key]}" label="${key}" width="auto" @click="${this._tap}"></li-button>`
                : html`<div style="display: flex;font-size:10px;flex-wrap:wrap">

                            ${indx[key].map(i => 
                                html`<li-button height="12" border="none" padding="2px" .indx="${i}" label="${i.label}" width="auto" @click="${this._openUrl}"></li-button>`
                            )}
                        </div>`}`
        )}
                </div>
                <div slot="app-right" style="padding-right:4px;padding-top:4px;height: 99%;">
                    <li-table id="prg" .options="${this.options}"></li-table>
                </div>
            </li-layout-app>
        `;
    }

    slotchange(updateComponent = false) {
        this.options = {
            maxHeight: '100%',
            minHeight: '100%',
            height: '30%',
            //data: [{ name: '001', value: '002' }, { name: '001', value: '002' }],
            layout: 'fitColumns',
            columns: this._columns,
            layout: "fitDataStretch"
        };
        let el = {};
        if (updateComponent && this.component) el = this.component;
        else el = this.component = this.shadowRoot.querySelectorAll('slot')[0].assignedElements()[0];
        setTimeout(async () => {
            let _info = undefined;
            try {
                _info = el.$urlInfo ? await import(el.$urlInfo) : undefined;
            } catch (error) { }
            const _list = _info && _info.list || undefined;
            let data = [];
            let id = 0;
            if (!el.$props) return;
            for (const k of el.$props.keys()) {
                if (k.startsWith('_')) continue;
                const prop = el.$props.get(k)

                if (_list) {
                    Object.keys(_list).map(i => {
                        if (!i.startsWith('_') && _list[i] && _list[i].includes(k)) {
                            let list = [];
                            if (i === 'icon' && !_list[`_${i}`]) Object.keys(icons).map(i => list.push(i));
                            else {
                                if (_list[`_${i}`]) list = _list[`_${i}`];
                            }
                            if (list.length) prop.list = list;
                        }
                    })
                }

                el.$props.set(k, prop);
                data.push({ id, name: k, value: el[k] || prop.default, type: prop.type, list: prop.list });
                id++;
            }
            this.options = { ...{}, ...this.options, ...{ data: data } };
            el._setTabulatorData = (prop, val) => {
                this.$id.prg.options.data.forEach(d => {
                    if (d.name === prop) {
                        d.value = val;
                        this.$id.prg.$table.updateData([{ ...d }]);
                        //this.$id.prg.$table.setData(this.$id.prg.$table.options.data);
                    }
                })
            }
            this.requestUpdate();
        });
    }

    async _tap(e) {
        if (this.component) this.removeChild(this.component);
        //this.component = undefined;
        this.$id.slot.name = "?";
        let el = e.target.label;
        let props = { ...indx[el].props };
        this.component = await LI.createComponent(el, props);
        this.component.setAttribute('slot', 'app-test');
        this.appendChild(this.component);
        this.slotchange(true);
    }

    _openUrl(e) {
        //console.dir(e)
        window.open(e.target.indx.url, 'li-url');
    }
});
