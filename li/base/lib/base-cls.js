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
    set(item) { this.#map.set(item._id, item.doc) }
    delete(item) { this.#map.delete(item._id) }
    clear() { this.#map = new Map() }
    async save() {
        if (this.#map.size) {
            const res = [];
            this.map.forEach(i => res.push(i));
            await this.db.bulkDocs(res);

            this.clear();
            console.log('save')
        }
    }
}

export class LIITEM {
    #doc = LI.icaro({});
    #hasChanged = false;
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
        this.#hasChanged = true;
    }
    constructor(db, item, doc) {
        if (db) {
            this.$db = db;
            this.dbLocal = db.local;
            this.changesMap = db.changesMap;
            if (item) {
                item.items ||= [];
                item.items.push(this);
                item.expanded = true;
            } else {
                db.items ||= [];
                db.items.push(this);
            }
        }
        if (doc) {
            this.$doc = doc;
            this.#doc = LI.icaro({ ...this.#doc, ...doc });
        }
        this.doc.ulid ??= LI.ulid();
        this.doc.type ??= 'li-item';
        this.doc._id ??= this.doc.type + ':' + this.doc.ulid;
        this.doc.label ??= '...';
        if (!this.doc.created) {
            let ds = LI.dates(LI.ulidToDateTime(this.doc.ulid));
            this.doc.created = { utc: ds.utc, local: ds.local };
        }
        this.#doc.listen(this.#fnListen);
    }
    get doc() { return this.#doc }
    set doc(v) { this.#doc = v }
    get _id() { return this.#doc._id }
    get _ref() { return this.#doc._ref }
    get ulid() { return this.#doc.ulid }
    get type() { return this.#doc.type }
    get created() { return this.#doc.created }
    get date() { return this.#doc.created.local }
    get utc() { return this.#doc.created.utc }
    get hasChanged() { return this.#hasChanged }
    get label() { return this.#doc.label }
    set label(v) { this.#doc.label = v }
    get items() { return this.#doc.items }
    set items(v) { this.#doc.items ||= []; this.#doc.items.push(v) }
    get dbName() { return this.dbLocal?.name }
    clearChanges() {
        this.#hasChanged = false;
        if (this.changesMap) {
            this.changesMap.delete(this);
            console.log('..... delete from Map: ', this._id);
        }
    }

    async save(db = this.dbLocal) {
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
    load(db = this.dbLocal) {
        db.get(this._id).then(doc => {
            console.log('..... load ok: ', doc);
            return this.doc;
        }).catch(err => {
            console.log('..... load error: ', err);
            return undefined;
        });
    }
}
