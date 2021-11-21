import '../../../li.js';
import '../../../lib/pouchdb/pouchdb.js';

export class ChangesMap {
    #map = new Map();
    constructor(db) {
        this.db = db;
    }
    get map() { return this.#map }
    get size() { return this.#map.size }
    get name() { return this.db?.name }
    has(item) { return this.#map.has(item._id) }
    get(item) { return this.#map.get(item._id) }
    set(item) { this.#map.set(item._id, item) }
    delete(item) { this.#map.delete(item._id) }
    clear() { this.#map = new Map() }
    async save() {
        if (this.#map.size) {
            const map = new Map();
            const res = [];
            this.map.forEach(i => map.set(i._id, i.doc));
            const saves = await this.db.allDocs({ keys: [...map.keys()], include_docs: true });
            saves.rows.map(i => {
                let doc = map.get(i.key);
                if (i.doc) doc = {...i.doc, ...doc};
                if (i.value?.rev) doc._rev = i.value.rev;
                res.push(doc);
            })
            await this.db.bulkDocs(res);
            console.log('save - ', this.#map.size);
            this.clear();
        }
    }
}

export class LIITEM {
    #doc = LI.icaro({});
    hasChanged = false;
    #fnListen = (e) => {
        const changes = [];
        e?.forEach(i => changes.push({ [i]: this.doc[i] }));
        if (changes.length) {
            const res = { type: 'changes', _id: this.doc._id || this.doc.ulid, self: this, changes };
            LI.fire(document, 'change', res);
            this.changed(res);
        }
    }
    changed(res) {
        if (this.changesMap) {
            this.changesMap.set(this);
            console.log('..... this.changesMap: ', this.changesMap);
        }
        this.hasChanged = true;
    }
    constructor(db, parent, doc, isLoad = false) {
        if (db) {
            this.$db = db;
            this.localDB = db.localDB;
            this.changesMap = db.changesMap;
        }
        if (doc) {
            this.$doc = doc;
            this.doc = LI.icaro({ ...this.doc, ...doc });
        }
        this.doc.ulid ??= LI.ulid();
        this.doc.type ??= 'li-item';
        this.doc._id ??= this.doc.type + ':' + this.doc.ulid;
        this.doc.label ??= '...';
        if (!this.doc.created) {
            let ds = LI.dates(LI.ulidToDateTime(this.doc.ulid));
            this.doc.created = { utc: ds.utc, local: ds.local };
        }
        if (parent) {
            this.$parent = parent;
            parent.doc.items ||= [];
            parent.doc.items.add(this._id);
            parent.items ||= [];
            parent.items.add(this);
            parent.expanded = true;
            if (!isLoad)
                parent.changed();
        }
        this.doc.listen(this.#fnListen);
    }
    get doc() { return this.#doc }
    set doc(v) { this.#doc = v }
    get _id() { return this.doc._id }
    get _ref() { return this.doc._ref }
    get ulid() { return this.doc.ulid }
    get type() { return this.doc.type }
    get created() { return this.doc.created }
    get date() { return this.doc.created.local }
    get utc() { return this.doc.created.utc }
    //get hasChanged() { return this.#hasChanged }
    get label() { return this.doc.label }
    set label(v) { this.doc.label = v }
    get dbName() { return this.localDB?.name }
    clearChanges() {
        this.hasChanged = false;
        if (this.changesMap) {
            this.changesMap.delete(this);
            console.log('..... delete from Map: ', this._id);
        }
    }

    async save(db = this.localDB) {
        db.get(this.doc._id).then(doc => {
            doc = { ...doc, ...this.doc };
            return db.put(doc);
        }).then(() => {
            return db.get(this.doc._id);
        }).then(doc => {
            this.doc = doc;
            console.log('..... save - result update - ', doc);
        }).catch(err => {
            db.put(this.doc).then(() => {
                return db.get(this.doc._id);
            }).then(doc => {
                this.doc = doc;
                console.log('..... save - result new save: ', doc);
            }).catch(err => {
                console.log('..... save - result error: ', err);
            });
        });
    }
    load(db = this.localDB) {
        db.get(this._id).then(doc => {
            console.log('..... load ok: ', doc);
            return this.doc;
        }).catch(err => {
            console.log('..... load error: ', err);
            return undefined;
        });
    }
}
