import { LiElement, html, css } from '../../li.js';

import '../layout-app/layout-app.js';

customElements.define('li-my-diary', class LiMyDiary extends LiElement {

    static get styles() {
        return css`
            ::-webkit-scrollbar {
                width: 4px;
                height: 4px;
            }
            ::-webkit-scrollbar-track {
                background: lightgray;
            }
            ::-webkit-scrollbar-thumb {
                background-color: gray;
            }
            #app-main {
                display: flex;
                height: calc(100% - 10px);
                margin: 4px 4px 4px 0;
                /* border: 1px solid lightgray; */
                flex-wrap: wrap;
            }
            .panel {
                border: 1px solid gray;
                min-width: 200px;
                flex: 1 1 auto;
                height: calc(100% - 6px);
                margin: 2px;

            }
        `;
    }

    render() {
        return html`
            <li-layout-app hide="r" outside>
                <div slot="app-top" class="header">
                    <div style="flex:1"></div><b>my diary</b><div style="flex:1"></div>
                </div>
                <div slot="app-left" style="padding-left:4px;">
                    leftPanel
                </div>
                <div slot="app-main" id="app-main">
                    <div class="panel">001</div>
                    <div class="panel">002</div>
                    <div class="panel" style="display: flex; flex-direction: column;border: none">
                        <div class="panel">003</div>
                        <div class="panel">004</div>
                        <div class="panel">005</div>
                        <div class="panel" style="display: flex; border: none; flex-wrap: wrap;">
                            <div class="panel">006</div>
                            <div class="panel">007</div>
                        </div>
                    </div>
                </div>
            </li-layout-app>
        `;
    }

});
