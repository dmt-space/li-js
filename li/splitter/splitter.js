import { LiElement, html } from '../../li.js';

customElements.define('li-splitter', class extends LiElement {
    render() {
        return html`
            <style>
                :host {
                    height: ${this.direction === 'vertical' ? '100%' : (this.size ? this.size + 'px' : '2px')};
                    min-height: ${this.size};
                    width: ${this.direction === 'vertical' ? (this.size ? this.size + 'px' : '2px') : '100%'};
                    min-width: ${this.size};
                    cursor: ${this.direction === 'vertical' ? 'ew-resize' : 'ns-resize'};
                    background-color: ${this.color || 'lightgray'};
                }
            </style>
        `
    }

    static get properties() {
        return {
            direction: { type: String, default: 'vertical' },
            size: { type: Number, default: 2 },
            color: { type: String, default: 'lightgray' },
            resize: { type: Boolean },
            use_px: { type: Boolean },
            reverse: { type: Boolean }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        const splitter = this,
            prevSibling = this.reverse ?  this.nextElementSibling : this.previousElementSibling,
            nextSibling = this.reverse ?  this.previousElementSibling : this.nextElementSibling;

        let x = 0, y = 0, h = 0, w = 0, prevSiblingHeight = 0, prevSiblingWidth = 0;

        const downHandler = (e) => {
            x = e.clientX;
            y = e.clientY;
            const rect = prevSibling.getBoundingClientRect();
            prevSiblingHeight = rect.height;
            prevSiblingWidth = rect.width;
            document.addEventListener('pointermove', this._moveHandler = this._moveHandler || moveHandler.bind(this));
            document.addEventListener('pointerup', this._upHandler = this._upHandler || upHandler.bind(this));
        }

        const moveHandler = (e) => {
            let dx = e.clientX - x;
            let dy = e.clientY - y;
            if (this.reverse) {
                dx = dx * -1;
                dy = dy * -1;
            }

            if (this.direction === 'vertical') {
                if (this.use_px) {
                    w = prevSiblingWidth + dx;
                    prevSibling.style.width = `${w}px`;
                } else {
                    w = ((prevSiblingWidth + dx) * 100) / this.parentNode.getBoundingClientRect().width;
                    prevSibling.style.width = `${w}%`;
                }
            } else {
                if (this.resize) {
                    h = prevSiblingHeight + dy;
                    this.parentNode.style.height = `${h}px`;
                } else {
                    if (this.use_px) {
                        h = prevSiblingHeight + dy;
                        prevSibling.style.height = `${h}px`;
                    } else {
                        h = ((prevSiblingHeight + dy) * 100) / this.parentNode.getBoundingClientRect().height;
                        prevSibling.style.height = `${h}%`;
                    }
                }
            }

            const cursor = this.direction === 'vertical' ? 'col-resize' : 'row-resize';
            splitter.style.cursor = cursor;
            document.body.style.cursor = cursor;

            if (prevSibling) {
                prevSibling.style.userSelect = 'none';
                prevSibling.style.pointerEvents = 'none';
            }
            if (nextSibling) {
                nextSibling.style.userSelect = 'none';
                nextSibling.style.pointerEvents = 'none';
            }

            LI.debounce('splitterMove', () => window.dispatchEvent(new Event('resize')), 50);
        }

        const upHandler = () => {
            splitter.style.removeProperty('cursor');
            document.body.style.removeProperty('cursor');

            if (prevSibling) {
                prevSibling.style.removeProperty('user-select');
                prevSibling.style.removeProperty('pointer-events');
            }
            if (nextSibling) {
                nextSibling.style.removeProperty('user-select');
                nextSibling.style.removeProperty('pointer-events');
            }

            document.removeEventListener('pointermove', this._moveHandler);
            document.removeEventListener('pointerup', this._upHandler);
            this.fire('endSplitterMove', { direction: this.direction, h, w, id: this.id });
        }
        splitter.addEventListener('pointerdown', downHandler);
    }
})
