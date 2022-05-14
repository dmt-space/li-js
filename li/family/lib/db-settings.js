import { LiElement, html, css } from '../../../li.js';
import { LZString } from '../../../lib/lz-string/lz-string.js';

const rowPanelCSS = css` .row-panel { display: flex; border-bottom: 1px solid lightgray; padding: 4px 2px; margin-bottom: 2px; }`;
const scrollCSS = css`::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: lightgray; } ::-webkit-scrollbar-thumb {  background-color: gray; }`;

customElements.define('li-db-settings', class LiDbSettings extends LiElement {
    static get styles() {
        return [scrollCSS, rowPanelCSS, css`
            :host {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            input {
                border: none; 
                outline: none; 
                width: 100%; 
                color: blue; 
                opacity: 0.7;
                font-size: 18;
            }
        `]
    }
    render() {
        return html`
            <div style="flex-direction: column; overflow: auto; padding-top: -4px;">
                <div class="row-panel" style="display: flex; align-items: center; margin-bottom: 4px"><div style="width: 100px;">db name:</div><input .value="${this.name}" @change="${this.setDbName}"></div>
                <div style="color: gray; opacity: 0.7; text-decoration: underline; padding: 4px 2px 6px 0;">Couchdb settings:</div>
                <div style="display: flex; align-items: center; margin-bottom: 4px"><div style="width: 100px">db  url:</div><input .value="${this.url}" @change="${this.setdbURL}"></div>
                <div style="display: flex; align-items: center;"><li-checkbox @change="${this.setReplication}" .toggled="${this.replication}"></li-checkbox>
                    Auto replication local and remote db</div>
                <div class="row-panel"></div>
                ${!this.readOnly && this.dbLocal ? html`
                    <div class="row-panel" style="display: flex; flex-direction: column;">
                        <li-button id="compacting" @click="${this.btnClick}" height="auto" width="auto" padding="4px">Compacting current database</li-button>
                        <div style="display: flex; align-items: center;"><li-checkbox id="also-delete-remote"></li-checkbox>Also delete remoteDB</div>
                        <li-button id="delete" @click="${this.btnClick}" height="auto" width="auto" padding="4px">Delete current localDB</li-button>
                    </div>
                ` : html``}
                ${this.allowExport && this.dbLocal ? html`
                    <div class="row-panel" style="display: flex; flex-direction: column;">
                        <div style="color:gray; opacity: 0.7; text-decoration: underline; padding: 4px 2px 6px 0;">Export database:</div>
                        <div style="display: flex; align-items: center;"><li-checkbox id="focused-export"></li-checkbox>Export checked in focused article</div>
                        <li-button id="export" height="auto" width="auto" padding="4px" @click=${this.btnClick}>Export db (or focused) to file</li-button>
                    </div>
                ` : html``}
                ${this.allowImport && this.dbLocal ? html`
                    <div class="row-panel" style="display: flex; flex-direction: column;">
                        <div style="color:gray; opacity: 0.7; text-decoration: underline; padding: 4px 2px 6px 0;">Import database:</div>
                        <div style="display: flex; align-items: center;"><li-checkbox id="focused-import"></li-checkbox>Import to focused article</div>
                        <li-button for="import" height="auto" width="auto" padding="4px" @click=${() => { this.$id('import').click() }}>Импорт db</li-button>
                        <input id="import" type="file" id="import" @change=${this.btnClick} style="display: none"/>
                    </div>
                ` : html``}
                <div class="row-panel" style="display: flex; flex-direction: column;">
                    <div style="color:gray; opacity: 0.7; text-decoration: underline; padding: 4px 2px 6px 0;">Copy to new compress database:</div>
                    <div class="row-panel" style="display: flex; align-items: center; margin-bottom: 4px"><div style="width: 100px;">db name:</div><input .value="${this.newName}" @change="${this.setNewDbName}"></div>
                    <div style="display: flex; align-items: center;"><li-checkbox id="copy-replicate"></li-checkbox>Replicate to new remote db</div>
                    <div style="display: flex; align-items: center;"><li-checkbox id="copy-selected"></li-checkbox>Copy checked in focused article</div>
                    <li-button id="copy" height="auto" width="auto" padding="4px" @click=${this.btnClick}>Copy to new db</li-button>
                </div>
            </div>
        `
    }

    static get properties() {
        return {
            name: { type: String, local: true },
            url: { type: String, local: true, },
            prefix: { type: String, local: true },
            replication: { type: Boolean, local: true },
            readOnly: { type: Boolean, local: true },
            allowImport: { type: Boolean, local: true },
            allowExport: { type: Boolean, local: true },
            dbLocal: { type: Object, local: true },
            dbRemote: { type: Object, local: true },
            replicationHandler: { type: Object, local: true },
            selectedItem: { type: Object, local: true }
        }
    }
    get newName() { return this._newName || this.name + '_copy' }
    set newName(v) { this._newName = v }

    setDbName(e) {
        this.name = e.target.value;
        if (!this.name) this.name = 'db';
        this.replication = false;
        window.location.href = window.location.href.split('#')?.[0] + '#' + this.name;
        location.reload();
    }
    setdbURL(e) {
        this.url = e.target.value;
        this.$update();
    }
    setReplication(e) {
        this.replication = e.detail;
        if (this.replication) {
            this.replicationHandler = this.dbLocal.sync(this.dbRemote, { live: true });
        } else {
            this.replicationHandler.cancel();
            this.replicationHandler = undefined;
        }
        this.$update();
    }
    setNewDbName(e) {
        this._newName = e.target.value;
    }
    btnClick(e) {
        const id = e.target.id;
        const action = {
            compacting: () => {
                if (!window.confirm(`Do you really want compacting current localDB ?`)) return;
                this.dbLocal.compact().then(function(info) {
                    console.log('Local compaction complete');
                }).catch(function(err) {
                    return console.log(err); f
                });
            },
            delete: () => {
                if (!window.confirm(`Do you really want delete current localDB ${this.$qs('#also-delete-remote').toggled ? 'and remoteDB' : ''} ?`)) return;
                this.replication = false;
                this.name = '';
                if (this.$qs('#also-delete-remote').toggled) {
                    this.dbRemote.destroy((err, response) => {
                        if (err) {
                            return console.log(err);
                        } else {
                            console.log("Remote CouchDB Database Deleted");
                        }
                    });
                }
                this.dbLocal.destroy((err, response) => {
                    if (err) {
                        return console.log(err);
                    } else {
                        console.log("Local Database Deleted");
                    }
                });
                setTimeout(() => {
                    let url = window.location.href.split('#')?.[0];
                    window.open(url, '_parent');
                }, 500);
            },
            export: async (e) => {
                let saveFile = async (json, name) => {
                    let str = JSON.stringify(json, null, 4);
                    if (!str || !name) return;
                    const blob = new Blob([str], { type: "text/plain" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = name + '.json';
                    a.click();
                    this.$update();
                }
                if (!this.$qs('#focused-export').toggled) {
                    await this.dbLocal.allDocs({ include_docs: true }, (error, doc) => {
                        if (error) console.error(error);
                        else saveFile(doc.rows.map(({ doc }) => doc), this.name);
                    })
                } else {
                    const
                        keys = [],
                        root = '$db:items',
                        parent = this.selectedItem._id,
                        arr = LIUtils.arrAllChildren(this.selectedItem);
                    keys.add(parent);
                    (this.selectedItem.doc.partsId || []).map(id => keys.add(id));
                    arr.map(i => {
                        if (i.checked) {
                            keys.add(i._id);
                            (i.doc.partsId || []).map(id => keys.add(id));
                        }
                    })
                    await this.dbLocal.allDocs({ include_docs: true, keys }, (error, doc) => {
                        if (error) console.error(error);
                        else {
                            doc.rows.map(({ doc }) => {
                                if (doc?.parentId === parent) doc.parentId = root;
                                if (doc?._id === parent) doc._id = root;
                            })
                            saveFile(doc.rows.map(({ doc }) => doc), this.selectedItem.label);
                        }
                    })
                }
            },
            import: async () => {
                const file = e.target.files[0];
                const importToFocused = this.$qs('#focused-import').toggled;
                if (importToFocused && !window.confirm(`Do you really want import to focused article ?`)) return;
                if (!importToFocused && !window.confirm(`Do you really want rewrite current Database ?`)) return;
                this.replication = false;
                this.replicationHandler?.cancel();
                this.replicationHandler = undefined;
                if (file) {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        let result = JSON.parse(e.target.result);
                        if (importToFocused) {
                            const ulid = LI.ulid();
                            result.forEach(i => {
                                if (i._id === '$db:items') {
                                    i._id = 'items:' + ulid;
                                    i.ulid = LI.ulid();
                                    i.parentId = this.selectedItem._id;
                                }
                                if (i.parentId === '$db:items') i.parentId = 'items:' + ulid;
                            })
                        }
                        if (!importToFocused) {
                            this.dbLocal = new PouchDB('lfdb_' + this.name);
                            this.dbRemote = new PouchDB(this.url + 'lfdb_' + this.name);
                            if (this.replication) this.replicationHandler = this.dbLocal.sync(this.dbRemote, { live: true });
                        }
                        await this.dbLocal.bulkDocs(
                            result,
                            { new_edits: false },
                            (...args) => {
                                console.log('DONE', args)
                                this.$update();
                                setTimeout(() => document.location.reload(), 500);
                            }
                        )
                    };
                    reader.readAsText(file);
                }
            },
            copy: async () => {
                const prefix = this.prefix || 'lfdb_';
                const dbLocalNew = new PouchDB(prefix + this.newName);
                if (this.$qs('#copy-replicate').toggled) {
                    const dbRemoteNew = new PouchDB(this.url + prefix + this.newName);
                    this.replicationHandlerNew = dbLocalNew.sync(dbRemoteNew, { live: true });
                }
                let items;
                const copy_selected = this.$qs('#copy-selected').toggled;
                const parent = this.selectedItem._id;
                if (copy_selected) {
                    const keys = [];
                    const arr = LIUtils.arrAllChildren(this.selectedItem);
                    keys.add(parent);
                    (this.selectedItem.doc.partsId || []).map(id => keys.add(id));
                    arr.map(i => {
                        if (i.checked) {
                            keys.add(i._id);
                            (i.doc.partsId || []).map(id => keys.add(id));
                        }
                    })
                    items = await this.dbLocal.allDocs({ keys, include_docs: true });
                } else {
                    items = await this.dbLocal.allDocs({ include_docs: true });
                }
                const res = [];
                const root = '$db:items'
                items.rows.map(i => {
                    if (i.doc) {
                        if (copy_selected) {
                            if (i.doc.parentId === parent) i.doc.parentId = root;
                            if (i.doc._id === parent) i.doc._id = root;
                        }
                        delete i.doc._rev;
                        if (!i.doc._id.startsWith('items') && !i.doc._id.startsWith('$db')) {
                            let lzs = LZString.decompressFromUTF16((i.doc.lzs || ''))
                            let doc = lzs ? JSON.parse(lzs) : i.doc;
                            lzs = LZString.compressToUTF16(JSON.stringify(doc, null, 4));
                            res.add({ _id: i.doc._id, lzs })
                        } else {
                            res.add({ ...i.doc });
                        }
                    }
                })
                await dbLocalNew.bulkDocs(res);
                console.log('done copy');
            }
        }
        action[id] && action[id](e);
        this.$update();
    }
})
