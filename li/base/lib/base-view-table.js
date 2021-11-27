import { LiElement, html, css } from '../../../li.js';

import '../../button/button.js';
import '../../checkbox/checkbox.js';
import '../../table/table.js';

customElements.define('li-base-view-table', class LiBaseViewTable extends LiElement {
    static get styles() {
        return css`

        `;
    }
    render() {
        return html`
            <li-table id="table"></li-table>
        `
    }

    static get properties() {
        return {
            type: { type: String, default: 'table' }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        setTimeout(() => {
            this.$id('table').data = {};
    
            this.$id('table').data.options = {
                lazy: true,
                // width: 1200,
                //headerVertical: true,
                headerService: true,
                headerColor: `hsla(210, 50%, 50%, .1)`,
                headerHeight: 36,
                footerColor: `hsla(210, 50%, 50%, .1)`,
                rowHeight: 36,
                // headerService: true,
                footerService: true,
                footerServiceText: '100 000 rows',
                //headerHidden: true,
                //footerHidden: true,
                // disableResizeColumns: true
                searchColumns: ['c1', 'c2', 'c3', 'c4', 'c5', 'c2'],
            }
    
            this.$id('table').data.rows = [];
            for (let i = 0; i < 10; i++) {
                this.$id('table').data.rows.push(
                    {
                        c1: 'row-' + i + ', col-001', c2: 'row-' + i + ', col-002',
                        c3: 'row-' + i + ', col-003', c4: 'row-' + i + ', col-004', c5: 'row-' + i + ', col-005'
                    },
                );
            }
            this.$id('table').data.columns = [
                { label: '№', name: '$idx', width: 60 },
                { label: 'col-001', name: 'c1', width: 150 },
                { label: 'col-002', name: 'c2', width: 250 },
                { label: 'col-003', name: 'c3' },
                { label: 'col-004', name: 'c4' },
                { label: 'col-005', name: 'c5', width: 120 },
                { label: '', name: '' },
            ]
        }, 300);
    }
})
