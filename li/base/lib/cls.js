import '../../../li.js';
import '../../../lib/pouchdb/pouchdb.js';

class ChangeMap {
    #map = new Map();
    constructor(db) {
        this.db = db;
    }
    get map() { return this.#map }
    add(item) { this.map.set(item._id, item.doc) }
    delete(item) { this.map.delete(item._id) }
    clear() { this.#map = new Map() }
    save() {

    }
}

class LIITEM {
    #doc = LI.icaro({});
    #hasChanged = false;
    #fnListen = (e) => {
        const changes = [];
        e?.forEach(i => changes.push({ [i]:this.doc[i] }));
        if (changes.length) {
            const res = { type: 'changes', _id: this.doc._id || this.doc.ulid, self: this, changes };
            LI.fire(document, 'change', res);
            this.changed(res);
        }
    }
    changed(res) {
        if (changeMap) {
            changeMap.add(this);
            console.log('..... changeMap: ', changeMap);
        }
        this.#hasChanged = true;
    }
    constructor(doc) {
        if (doc) this.#doc = LI.icaro({ ...this.#doc, ...doc });
        this.doc.ulid = this.doc.ulid ?? LI.ulid();
        this.doc.type = this.doc.type ?? 'li-item';
        this.doc._id = this.doc._id ?? this.doc.type + ':' + this.doc.ulid;
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
    clearChanges() { 
        this.#hasChanged = false;
        if (changeMap) {
            changeMap.delete(this);
            console.log('..... delete from Map: ', this._id);
        }
    }

    async save(db = dbLocal) {
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
    load(db = dbLocal) {
        db.get(this._id).then(doc => {
            console.log('..... load ok: ', doc);
            return this.doc;
        }).catch(err => {
            console.log('..... load error: ', err);
            return undefined;
        });
    }
}
