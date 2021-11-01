import { LiElement, html, css } from '../../li.js';

customElements.define('li-rating', class LiRating extends LiElement {

    static get styles() {
        return css`
            .rating {
                display: inline-block;
                font-size: 0;
                cursor: pointer;
                padding: 2px;
            }
            .rating span {
                padding: 0;
                line-height: 1;
                color: lightgrey;
            }
            .rating > span:before {
                content: '★';
            }
            .rating > span.active {
                color: gold;
            }
        `;
    }

    render() {
        return html`
            <div class="rating" style="font-size: ${this.size}px">
                ${[...Array(this.length).keys()].map((i, idx) => html`
                    <span class=${idx < (this._over ? this._value : this.value) ? 'active' : ''} 
                        @click=${() => this._click(idx)} 
                        @pointerover=${() => this._pointerover(idx)}
                        @pointerout=${this._pointerout}
                    ></span>
                `)}
            </div>
        `
    }

    static get properties() {
        return {
            value: { type: Number, default: 0 },
            length: { type: Number, default: 5 },
            size: { type: Number, default: 16 }
        }
    }

    _click(idx) {
        this.value = this.value === idx + 1 ? idx : idx  + 1;
        this.fire('change', this.value);
    }
    _pointerover(idx) {
        this._over = true;
        this._value = idx + 1;
        this.$update();
    }
    _pointerout() {
        this._over = false;
        this.$update();
    }

});
