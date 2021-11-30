import { LiElement, html, css } from '../../li.js';

import '../button/button.js';
import * as L from '../../lib/leaflet/leaflet-src.esm.js';

const iconRetinaUrl = '../../lib/leaflet/images/marker-icon-2x.png';
const iconUrl = '../../lib/leaflet/images/marker-icon.png';
const shadowUrl = '../../lib/leaflet/images/marker-shadow.png';
const iconDefault = L.icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

customElements.define('li-leaflet', class liLeaflet extends LiElement {
    static get styles() {
        return css`
            :host {
                display:block;
                height: 100%;
            }
        `;
    }

    render() {
        return html`
            <link rel="stylesheet" href="../../lib/leaflet/leaflet.css">
            <div id="mapid" style="height: 100%"></div>
        `;
    }

    static get properties() {
        return {
            latitude: { type: Number },
            longitude: { type: Number },
            zoom: { type: Number, default: 13 },
            minZoom: { type: Number, default: 3 },
            markers: { type: Array, default: [] },
            polygons: { type: Array, default: [] },
            circles: { type: Array, default: [] },
            polylines: { type: Array, default: [] }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        this._map = L.map(this.$id('mapid'));
        this._map.setView([this.latitude, this.longitude], this.zoom);
        let urlTemplate = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
        this._map.addLayer(L.tileLayer(urlTemplate, { minZoom: this.minZoom }));

        this.markers.forEach(i => {
            if (i.latitude && i.longitude) {
                let el = L.marker([i.latitude, i.longitude]).addTo(this._map);
                if (i.bindPopup)
                    el.bindPopup(i.bindPopup);
            }
        });
        this.polygons.forEach(i => {
            if (i.polygons?.length) {
                let el = L.polygon([i.polygons]).addTo(this._map);
                if (i.bindPopup) el.bindPopup(i.bindPopup);
            }
        });
        this.circles.forEach(i => {
            if (i.latitude && i.longitude) {
                let el = L.circle([i.latitude, i.longitude], { ...i.args }).addTo(this._map);
                if (i.bindPopup) el.bindPopup(i.bindPopup);
            }
        });
        this.polylines.forEach(i => {
            if (i.polylines?.length) {
                let el = L.polyline([i.polylines], { ...i.args }).addTo(this._map);
                if (i.bindPopup) el.bindPopup(i.bindPopup);
            }
        });
    }
    updated(e) {
        if (e.has('latitude') || e.has('longitude') || e.has('zoom')) {
            this._map.setView([this.latitude, this.longitude], this.zoom);
        }
    }
});
