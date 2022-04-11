class liRouter {
    constructor() {
        window.addEventListener('popstate', e => this.callback(e.state?.path || location.hash));
    }
    create(callback) {
        this.callback = callback;
    }
    go(path) {
        window.history.pushState({ path }, null, path);
        this.callback(path);
    }
}
LI.router = new liRouter();
