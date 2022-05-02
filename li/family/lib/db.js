export class ITEM {
    constructor(doc = {}, props = {}) {
        this.doc = doc;
        this.doc.type = doc.type || props.type || 'items';
        if (doc.label || props.label) this.doc.label = doc.label || props.label;
        else if (this.doc.type === 'items') this.doc.label = 'new item';
        const ulid = LI.ulid();
        this.doc._id = doc._id || this.doc.type + ':' + ulid;
        this.doc.ulid = doc.ulid || ulid;
        this.doc.created = doc.created || LI.dates(new Date(), true);
        this.items = [];
        Object.keys(props).forEach(key => this[key] = props[key]);
    }
    get _id() { return this.doc._id }
    get ulid() { return this.doc.ulid }
    get created() { return this.doc.created }
    get partsId() { return this.doc.partsId || [] }
    get label() { return this.doc.label }
    set label(v) { this.doc.label = v }
    get parentId() { return this.doc.parentId || '' }
    set parentId(v) { this.doc.parentId = v }
    get partsId() { return this.doc.partsId || [] }
    set partsId(v) { this.doc.partsId = v }
    get _deleted() { return this.doc._deleted }
    set _deleted(v) {
        if (v) {
            this
            this.doc._deleted = v;
        } else {
            delete this.doc._deleted;
        }
    }
}
export const firstInit = (self) => {
    self._dbName = window.location.href.split('#')?.[1];
    self.listen('changed', (e) => {
        if ((e.detail.type === 'setTreeLabel' || e.detail.type === 'setTreeItem' || e.detail.type === 'moveTreeItem') && e.detail.item) {
            // console.log(e.detail.item)
            self.changedItemsID ||= [];
            self.changedItems ||= {};
            self.changedItemsID.add(e.detail.item._id);
            self.changedItems[e.detail.item._id] = e.detail.item;
        }
    })
    self.listen('li-panel-simple-click', (e) => {
        btnClick(self, e.detail);
    })
    setTimeout(async () => {
        if (self._dbName && self._dbName !== self.name) self.replication = false;
        self.name = self._dbName || self.name;
        if (self.name) {
            const prefix = self.prefix || 'lfdb_';
            self.dbLocal = new PouchDB(prefix + self.name);
            self.dbRemote = new PouchDB(self.url + prefix + self.name);
            if (self.replication) self.replicationHandler = self.dbLocal.sync(self.dbRemote, { live: true });
            init(self);
        }
    }, 100);
}
export const init = async (self) => {
    try { self.rootItem = await self.dbLocal.get('$db:items') } catch (error) { }
    if (!self.rootItem) {
        await self.dbLocal.put(new ITEM({ _id: '$db:items', type: 'items', label: self.rootLabel || 'db-items' }).doc);
        self.rootItem = await self.dbLocal.get('$db:items');
    }
    self.rootItem = new ITEM({ ...self.rootItem });
    self.items = [self.rootItem];
    try { self.dbLocalStore = await self.dbLocal.get('_local/store') } catch (error) { };
    self.dbLocalStore ||= {};
    self.flatItems = await getflatItems(self);
    self.selectedItem = self.flatItems[self.dbLocalStore['selected-item']] || self.items[0];
    self.starItem = self.flatItems[self.dbLocalStore['star-item']] || undefined;
    self.sortItems = getSortItems(self);
    self.$update();
}
export const getflatItems = async (self, type = 'items') => {
    const items = await self.dbLocal.allDocs({ include_docs: true, startkey: 'items', endkey: 'items' + '\ufff0' });
    if (!items.rows) return;
    const flat = {};
    let toDelete;
    items.rows.forEach(i => flat[i.doc._id] = new ITEM({ ...i.doc }));
    Object.values(flat).forEach(f => {
        if (f.doc['parentId'] === '$db:items') {
            f.parent = self.items[0];
            self.items[0].items.push(f);
        } else {
            const i = flat[f.doc['parentId']];
            if (i) {
                i.items = i.items || [];
                f.parent = i;
                i.items.push(f);
            } else {
                if (!toDelete) {
                    toDelete = new ITEM({ _id: '$todelete:items', label: 'No parent (to delete ?)', parenID: '$db:items' }, { expanded: true });
                    self.items[0].items.push(toDelete);
                    self.deletedItemsID.add('$todelete:items');
                }
                f.doc['parentId'] = '$todelete:items';
                f.parent = toDelete;
                toDelete.items.push(f);
                f._deleted = true;
                self.deletedItemsID.add(f._id);
            }
        }
    });
    flat['$db:items'] = self.items[0];
    if (toDelete) flat['$todelete:items'] = toDelete;
    self.dbLocalStore['expanded-items']?.forEach(k => flat[k] ? flat[k].expanded = true : '');
    return flat;
}
export const getSortItems = (self) => {
    const rows = [];
    Object.keys(self.flatItems).sort((a, b) => a.ulid > b.ulid ? 1 : -1).forEach(k => {
        const item = self.flatItems[k];
        if (item.partsId?.length) {
            item.name = item.label;
            rows.push(item);
        }
    })
    // rows.shift();
    return {
        options: {
            lazy: true,
            headerService: true,
            headerServiceText: 'sort by last add',
            footerHidden: true,
            footerService: true,
            footerServiceTotal: true,
            rowHeight: 50,
            fontSize: '.9rem',
            searchColumns: ['name'],
            readOnly: true
        },
        columns: [{ label: '№', name: '$idx', width: 50 }, { label: self.sortLabel || 'items', name: 'name', textAlign: 'left', alignItems: 'flex-start', showTitle: true }],
        rows: rows
    }
}
export const updateSelectedItem = async (self) => {
    // const fn = (e, item) => {
    //     if (self.readOnly) return;
    //     e.forEach((value, key) => {
    //         if (key === '_deleted' && value) {
    //             self.deletedItemsID.add(item._id);
    //             self.deletedItems[item._id] = item;
    //         } else {
    //             item.doc[key] = value;
    //             self.changedItemsID.add(item._id);
    //             self.changedItems[item._id] = item;
    //         }
    //     });
    //     self.$update();
    // }
    // self.notebook = undefined;
    // self.selectedItem._items = [];
    // self.selectedItem.notebook = { cells: icaro([]) };
    const parts = await self.dbLocal.allDocs({ keys: self.selectedItem.partsId || [], include_docs: true });
    parts.rows.map((i, idx) => {
        if (i.doc) {
            // let lzs = LZString.decompressFromUTF16((i.doc.lzs || ''))
            // let doc = lzs ? lzs = JSON.parse(lzs) : i.doc;
            // const item = new ITEM(doc, { type: 'editors', isUse: true });
            // self.selectedItem._items.push(item);
            // const cell = icaro({
            //     _id: item._id,
            //     label: doc.label,
            //     cell_name: doc.cell_name || doc.name,
            //     source: doc.source || doc.value || '',
            //     cell_h: doc.cell_h || doc.h,
            //     cell_w: doc.cell_w >= 0 ? doc.cell_w : doc.w || '',
            //     cell_type: doc.cell_type,
            //     sourceHTML: doc.sourceHTML || (doc.label === 'iframe' ? doc.value : ''),
            //     sourceJS: doc.sourceJS || '',
            //     sourceCSS: doc.sourceCSS || '',
            //     sourceJSON: doc.sourceJSON || '{}',
            //     useJson: doc.useJson || false,
            //     'li-editor-ace': doc['li-editor-ace'] || '',
            //     'li-editor-monaco': doc['li-editor-monaco'] || ''
            // })
            // self.selectedItem.notebook.cells.push(cell);
            // cell.listen(e => fn(e, item));
        }
    })
    // self.selectedItem.notebook.cells.listen((e) => {
    //     if (self.readOnly) return;
    //     self.selectedItem.doc.partsId = [];
    //     self.selectedItem.notebook.cells.map((i, idx) => {
    //         if (!i._id) {
    //             const name = i.cell_name || (i.cell_type === 'markdown' ? 'showdown'
    //                 : i.cell_type === 'html' || i.cell_type === 'html-cde' || i.cell_type === 'code' ? 'html'
    //                     : i.cell_type === 'html-executable' ? 'iframe' : 'showdown');
    //             const item = new ITEM({ name, h: i.cell_h, cell_type: i.cell_type, label: i.label }, { type: 'editors' });
    //             self.selectedItem._items.push(item);
    //             i._id = item._id
    //             i = icaro({ ...{}, ...i });
    //             i.listen(e => fn(e, item));
    //             self.selectedItem.notebook.cells[idx] = i;
    //             self.changedItemsID.add(item._id);
    //             self.changedItems[item._id] = item;
    //         }
    //         self.selectedItem.doc.partsId.add(i._id);
    //     })
    //     self.changedItemsID.add(self.selectedItem._id)
    //     self.changedItems[self.selectedItem._id] = self.selectedItem
    // })
    // setTimeout(() => {
    //     if (self.selectedItem.notebook) {
    //         self.notebook = self.selectedItem.notebook;
    //         self.$update();
    //     }
    // }, 100)
}
export const save = async (self) => {
    if (self.changedItemsID?.length) {
        const items = await self.dbLocal.allDocs({ keys: self.changedItemsID, include_docs: true });
        const res = [];
        items.rows.map(i => {
            if (i.doc) {
                if (i.doc._id.startsWith('editors')) {
                    let lzs = LZString.compressToUTF16(JSON.stringify(self.changedItems[i.doc._id].doc));
                    res.add({ _id: i.doc._id, _rev: i.doc._rev, lzs })
                } else {
                    res.add({ ...i.doc, ...self.changedItems[i.key].doc });
                }
                self.changedItemsID.remove(i.key);
                if (self.changedItems[i.key] !== self.selectedItem && self.changedItems[i.key].notebook) {
                    self.changedItems[i.key]._items = self.changedItems[i.key].cells = self.changedItems[i.key].notebook = undefined;
                }
            }
        })
        self.changedItemsID.forEach(i => {
            let doc = { ...self.changedItems[i].doc };
            if (doc._id.startsWith('editors')) {
                let lzs = LZString.compressToUTF16(JSON.stringify(doc));
                res.add({ _id: doc._id, lzs })
            } else {
                res.add(doc);
            }
        })
        await self.dbLocal.bulkDocs(res);
        self.changedItemsID = [];
        self.changedItems = {};
    }
    if (self.deletedItemsID?.length) {
        const items = await self.dbLocal.allDocs({ keys: self.deletedItemsID, include_docs: true });
        const res = [];
        items.rows.map(async i => {
            if (i.doc) {
                i.doc._deleted = true;
                res.add(i.doc);
                if (i.doc.partsId) {
                    const parts = await self.dbLocal.allDocs({ keys: i.doc.partsId, include_docs: true });
                    // console.log(parts.rows);
                    parts.rows.map(e => {
                        if (e.doc) {
                            e.doc._deleted = true;
                            res.add(e.doc);
                        }
                    })
                }
            }
        })
        await self.dbLocal.bulkDocs(res);
        self.deletedItemsID = [];
        self.deletedItems = {};
        init();
    }
}

export const btnClick = (self, detail) => {
    const id = detail.btn;
    const action = {
        'collapse': () => {
            LIUtils.arrSetItems(self.selectedItem, 'expanded', false);
        },
        'expand': () => {
            LIUtils.arrSetItems(self.selectedItem, 'expanded', true);
        },
        'set selected as root': () => {
            if (self.starItem) {
                // self.selectedItem = self.starItem;
                self.starItem = undefined;
            } else if (self.selectedItem?.items?.length) {
                self.starItem = self.selectedItem;
            }
        },
        'save tree state': async () => {
            const expanded = [];
            Object.keys(self.flatItems).map(key => { if (self.flatItems[key]?.expanded) expanded.push(key) });
            let _ls = {};
            try {
                _ls = await self.dbLocal.get('_local/store')
            } catch (error) { }
            _ls._id = '_local/store';
            _ls['selected-item'] = self.selectedItem?._id || '';
            _ls['expanded-items'] = expanded;
            _ls['star-item'] = self.starItem?._id || '';
            await self.dbLocal.put(_ls);
            self.dbLocalStore = await self.dbLocal.get('_local/store');

        },
        'add new item': () => {
            let item = new ITEM({ parentId: self.selectedItem._id }, { parent: self.selectedItem, changed: true, isNew: true });
            self.selectedItem.items.splice(self.selectedItem.items.length, 0, item);
            self.selectedItem.expanded = true;
            self.flatItems[item._id] = item;
            self.changedItemsID ||= [];
            self.changedItemsID.add(item._id);
            self.changedItems ||= {};
            self.changedItems[item._id] = item;
            self.$update();
        },
        'delete item': () => {
            self.deletedItemsID ||= [];
            self.items[0].checked = false;
            const itemToDelete = LIUtils.arrFindItem(self.items[0], 'checked', true);
            if (!itemToDelete || (confirm && !window.confirm(`Do you really want delete selected and all children items?`))) return;
            Object.keys(self.flatItems).forEach(key => {
                const item = self.flatItems[key];
                if (item.checked) {
                    item.checked = false;
                    item._deleted = true;
                    self.deletedItemsID.add(key);
                    item._partsId?.forEach(i => self.deletedItemsID.add(i));
                    item.partsId?.forEach(i => self.deletedItemsID.add(i));
                }
            })
        },
        'clear deleted': () => {
            Object.keys(self.flatItems).forEach(key => { if (self.flatItems[key]._deleted) self.flatItems[key]._deleted = false })
            self.deletedItemsID = [];
            self.$update();
        }
    }
    action[id] && action[id]();
    self.$update();
}
