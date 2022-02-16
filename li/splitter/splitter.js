import { LiElement, html } from '../../li.js';

customElements.define('li-splitter', class extends LiElement {
    render() {
        return html`
            <style>
                :host {
                    height: ${this.direction === 'vertical' ? '100%' : this.size || '2px'};
                    width: ${this.direction === 'vertical' ? this.size || '2px' : '100%'};
                    cursor: ${this.direction === 'vertical' ? 'ew-resize' : 'ns-resize'};
                    background-color: ${this.color || 'lightgray'};
                }
            </style>
        `
    }

    static get properties() { 
        return { 
            direction: { type: String, default: 'vertical' },
            size: { type: String, default: '4px' },
            color: { type: String, default: 'lightgray' }
        } 
    }

    constructor() {
        super();
        const splitter = this,
            prevSibling = this.previousElementSibling,
            nextSibling = this.nextElementSibling;

        let x = 0,
            y = 0,
            prevSiblingHeight = 0,
            prevSiblingWidth = 0;

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
            const dx = e.clientX - x;
            const dy = e.clientY - y;

            if (this.direction === 'vertical') {
                const w = ((prevSiblingWidth + dx) * 100) / this.parentNode.getBoundingClientRect().width;
                prevSibling.style.width = `${w}%`;
            } else {
                const h = ((prevSiblingHeight + dy) * 100) / this.parentNode.getBoundingClientRect().height;
                prevSibling.style.height = `${h}%`;
            }

            const cursor = this.direction === 'vertical' ? 'col-resize' : 'row-resize';
            splitter.style.cursor = cursor;
            document.body.style.cursor = cursor;

            prevSibling.style.userSelect = 'none';
            prevSibling.style.pointerEvents = 'none';
            nextSibling.style.userSelect = 'none';
            nextSibling.style.pointerEvents = 'none';
        }

        const upHandler = () => {
            splitter.style.removeProperty('cursor');
            document.body.style.removeProperty('cursor');

            prevSibling.style.removeProperty('user-select');
            prevSibling.style.removeProperty('pointer-events');
            nextSibling.style.removeProperty('user-select');
            nextSibling.style.removeProperty('pointer-events');

            document.removeEventListener('pointermove', this._moveHandler);
            document.removeEventListener('pointerup', this._upHandler);
        }
        splitter.addEventListener('pointerdown', downHandler);
    }
})
