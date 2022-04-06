let url = import.meta.url;
url = url.replace('/tester/indx.js', '');

export const indx = {

    'li-icon': { type: 'comp', label: 'li-icon', props: { name: 'refresh', fill: 'red', speed: 1, blink: 1, size: 128 } },
    icon: [{ label: 'index', url: url + '/icon' }],

    'li-icons': { type: 'comp', label: 'li-icons' },
    icons: [{ label: 'index', url: url + '/icons' }],

    'li-checkbox': { type: 'comp', label: 'li-checkbox', props: { size: 64, fill: 'lightblue' } },
    checkbox: [{ label: 'index', url: url + '/checkbox' }],

    'li-button': { type: 'comp', label: 'li-button', props: { name: 'android', fill: 'green', width: 'auto', label: 'Test button', size: 64 } },
    button: [{ label: 'index', url: url + '/button' }, { label: 'index-2', url: url + '/button/index-2.html' }],

    'li-color-input': { type: 'comp', label: 'li-color-input' },
    'color-input': [{ label: 'index', url: url + '/color-input' }],

    'li-color-picker': { type: 'comp', label: 'li-color-picker' },
    'color-picker': [{ label: 'index', url: url + '/color-picker' }],

    'li-calendar': { type: 'comp', label: 'li-calendar' },
    'calendar': [{ label: 'index', url: url + '/calendar' }],

    'li-splitter': { type: 'comp', label: 'li-splitter', props: { iframe: '../splitter/index.html' } },
    splitter: [{ label: 'index', url: url + '/splitter' }],

    'li-panel-simple': { type: 'comp', label: 'li-panel-simple', props: { iframe: '../panel-simple/index.html' } },
    'panel-simple': [{ label: 'index', url: url + '/panel-simple' }],

    'li-accordion': { type: 'comp', label: 'li-accordion', props: { iframe: '../accordion/index.html' } },
    accordion: [{ label: 'index', url: url + '/accordion' }, { label: 'index-2 (mutipanel)', url: url + '/accordion/index-2.html' }],

    'li-dropdown': { type: 'comp', label: 'li-dropdown', props: { iframe: '../dropdown/index-3.html' } },
    dropdown: [{ label: 'index', url: url + '/dropdown' }, { label: 'index-2', url: url + '/dropdown/index-2.html' }, { label: 'index-3', url: url + '/dropdown/index-3.html' }],

    'li-cell': {
        type: 'comp', label: 'li-cell', props: {
            type: 'text', value: "I'm li-cell", left: [{ name: 'button', args: { name: 'android', border: 'none', fill: 'green', size: 42 } }],
            right: [{ name: 'button', args: { name: 'add', size: 32, fill: 'blue' } }, { name: 'button', args: { name: 'close', size: 32, fill: 'red' } }]
        }
    },
    cell: [{ label: 'index', url: url + '/cell' }],

    'li-table': { type: 'comp', label: 'li-table', props: { iframe: '../table/index.html' } },
    table: [{ label: 'index', url: url + '/table' }, { label: 'calorie table', url: url + '/table/index2.html' }],

    'li-tree': {
        type: 'comp', label: 'li-tree', props: {
            allowCheck: true,
            item: {
                label: 'main', items: [
                    { label: 1 },
                    { label: 2, items: [{ label: '2.1' }, { label: '2.2' }, { label: '2.3' }, { label: '2.4' }, { label: '2.5' }, { label: '2.6' }] },
                    { label: 3 },
                    { label: 4 },
                    { label: 5 },
                    { label: 6 },
                    { label: 7 },
                    { label: 8 },
                    { label: 9 },
                    { label: 10 },
                    { label: 11 },
                    { label: 12, items: [{ label: '12.1' }, { label: '12.2' }, { label: '12.3' }, { label: '12.4' }, { label: '12.5' }, { label: '12.6' }] },
                    { label: 13 },
                    {
                        label: 14, items: [
                            { label: '14.1' },
                            {
                                label: '14.2', items: [
                                    {
                                        label: '14.2.1',
                                        items: [
                                            { label: '14.2.1.1', items: [{ label: '14.2.1.1.1' }, { label: '14.2.1.1.2' }] },
                                            { label: '14.2.1.2', items: [{ label: '14.2.1.2.1' }, { label: '14.2.1.2.2' }] },
                                            { label: '14.2.1.3' },
                                            { label: '14.2.1.4', items: [{ label: '14.2.1.4.1' }, { label: '14.2.1.4.2', items: [{ label: '14.2.1.4.2.1' }, { label: '14.2.1.4.2.2' }, { label: '14.2.1.4.2.3' }, { label: '14.2.1.4.2.4' }] }] },
                                            { label: '14.2.1.5' },
                                        ]
                                    },
                                    { label: '14.2.2' },
                                    { label: '14.2.3' },
                                    { label: '14.2.4' },
                                    { label: '14.2.5' }],

                            },
                            { label: '14.3' },
                            { label: '14.4' },
                            { label: '14.5' },],
                    },
                    { label: 15 },
                    { label: 16 },
                    { label: 17 },
                    { label: 18 },
                    { label: 19 },
                    { label: 20 },
                ]
            }
        }
    },
    tree: [{ label: 'index', url: url + '/tree' }],

    'li-layout-designer': {
        type: 'comp', label: 'li-layout-designer', props: {
            keyLabel: 'name',
            keyItems: 'fields',
            keyID: 'name',
            id: 'layout',
            item: {
                id: 'layout',
                fields: [
                    { name: 1 },
                    { name: 2, fields: [{ name: '2.1' }, { name: '2.2' }, { name: '2.3' }, { name: '2.4' }, { name: '2.5' }, { name: '2.6' }] },
                    { name: 3 },
                    { name: 4 },
                    { name: 5 },
                    { name: 6 },
                    { name: 7 },
                    { name: 8 },
                    { name: 9 },
                    { name: 10 },
                    { name: 11 },
                    { name: 12, fields: [{ name: '12.1' }, { name: '12.2' }, { name: '12.3' }, { name: '12.4' }, { name: '12.5' }, { name: '12.6' }] },
                    { name: 13 },
                    {
                        name: 14, fields: [
                            { name: '14.1' },
                            {
                                name: '14.2', fields: [
                                    {
                                        name: '14.2.1',
                                        fields: [
                                            { name: '14.2.1.1', fields: [{ name: '14.2.1.1.1' }, { name: '14.2.1.1.2' }] },
                                            { name: '14.2.1.2', fields: [{ name: '14.2.1.2.1' }, { name: '14.2.1.2.2' }] },
                                            { name: '14.2.1.3' },
                                            { name: '14.2.1.4', fields: [{ name: '14.2.1.4.1' }, { name: '14.2.1.4.2', fields: [{ name: '14.2.1.4.2.1' }, { name: '14.2.1.4.2.2' }, { name: '14.2.1.4.2.3' }, { name: '14.2.1.4.2.4' }] }] },
                                            { name: '14.2.1.5' },
                                        ]
                                    },
                                    { name: '14.2.2' },
                                    { name: '14.2.3' },
                                    { name: '14.2.4' },
                                    { name: '14.2.5' }],

                            },
                            { name: '14.3' },
                            { name: '14.4' },
                            { name: '14.5' },],
                    },
                    { name: 15 },
                    { name: 16 },
                    { name: 17 },
                    { name: 18 },
                    { name: 19 },
                    { name: 20 },
                ]
            }
        }
    },
    'layout-designer': [{ label: 'index', url: url + '/layout-designer' }],

    'li-layout-designer-2': { type: 'comp', label: 'li-layout-designer-2', props: { iframe: '../layout-designer-2/index.html' } },
    'layout-designer-2': [{ label: 'index', url: url + '/layout-designer-2' }],

    'li-editor-ace': { type: 'comp', label: 'li-editor-ace', props: { theme: 'dracula', mode: 'javascript', src: 'console.log(this.properties) // description' } },
    'editor-ace': [{ label: 'index', url: url + '/editor-ace' }],

    'li-editor-monaco': { type: 'comp', label: 'li-editor-monaco', props: { src: 'console.log(this.properties) // description' } },
    'editor-monaco': [{ label: 'index', url: url + '/editor-monaco' }],

    'li-editor-html': {
        type: 'comp', label: 'li-editor-html', props: {
            src: `
            <div style="display:flex;flex-direction:column;color: blue;">
                <h3>HTML editor:</h3>
                <iframe width="560" height="315" src="https://www.youtube.com/embed/LSWlHKvlnZ8" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>        <div>
            <div>
            <br>
            <span style="color:gray">...</span>
        ` }
    },
    'editor-html': [{ label: 'index', url: url + '/editor-html' }],

    'li-viewer-md': { type: 'comp', label: 'li-viewer-md', props: { src: url + '/viewer-md/sample.md' } },
    'viewer-md': [{ label: 'index', url: url + '/viewer-md' }],

    'li-qr-code': { type: 'comp', label: 'li-qr-code', props: { value: 'https://resu062.github.io/li-site/li/tester/' } },
    'qr-code': [{ label: 'index', url: url + '/qr-code' }],

    'li-monitor': { type: 'comp', label: 'li-monitor (fps-memory)', props: { iframe: '../monitor/index.html' } },
    monitor: [{ label: 'index', url: url + '/monitor' }],

    'li-property-grid': {
        type: 'comp', label: 'li-property-grid',
        props: {
            io: {
                name: 'User1',
                _note: 'Hidden note...',
                nestedObject1: [
                    {
                        itemId: 1,
                        itemDetails: {
                            name: "C",
                            caregory: "Programming Language",
                            price: 500,
                        },
                        itemCategory: "Basic",
                    },
                    {
                        itemId: 2,
                        itemDetails: {
                            name: "C++",
                            caregory: "Programming Language",
                            price: 700,
                        },
                        itemCategory: "Beginner",
                    },
                    {
                        itemId: 1,
                        itemDetails: {
                            name: "Java Script",
                            caregory: "Web Development",
                            price: 1500,
                        },
                        itemCategory: "Advanced",
                    }
                ],
            }
        }
    },
    'property-grid': [{ label: 'index', url: url + '/property-grid' }],

    'li-layout-app': { type: 'comp', label: 'li-layout-app' },
    'layout-app': [{ label: 'demo-1', url: url + '/layout-app' }, { label: 'demo-2', url: url + '/layout-app/demo.html' }],



    'li-wikis': { type: 'apps', label: 'Wikis (li-jupyter version)', props: { iframe: '../wikis/index.html' } },
    wikis: [{ label: 'index', url: url + '/wikis' }],

    'li-jupyter': { type: 'apps', label: 'li-jupyter notebook', props: { iframe: '../jupyter/index.html' } },
    'jupyter': [{ label: 'index', url: url + '/jupyter/index.html' }],

    'li-wiki': { type: 'apps', label: 'Wiki (old version)', props: { iframe: '../wiki/index.html' } },
    wiki: [{ label: 'index', url: url + '/wiki' }],

    'li-diary': { type: 'apps', label: 'Мой дневник', props: { iframe: '../diary/index.html' } },
    'diary': [{ label: 'index', url: url + '/diary' }],

    'li-valuta': { type: 'apps', label: 'Курсы валют', props: { iframe: '../valuta/index.html' } },
    'valuta': [{ label: 'index', url: url + '/valuta' }],

    'li-credit-calc': { type: 'apps', label: 'Кредитный калькулятор', props: { iframe: '../credit-calc/index.html' } },
    'credit-calc': [{ label: 'index', url: url + '/credit-calc' }],

    'li-dma': { type: 'apps', label: 'Расчёт DMA' },
    'dma': [{ label: 'index', url: url + '/dma' }],

    'li-timer': { type: 'apps', label: 'Timer' },
    'timer': [{ label: 'index', url: url + '/timer' }],

    'li-tetris': { type: 'apps', label: 'TETRIS', props: { iframe: '../tetris/index.html' } },
    'tetris': [{ label: 'index', url: url + '/tetris' }],

    'li-flips': { type: 'apps', label: 'FLIPS' },
    'flips': [{ label: 'index', url: url + '/flips' }, { label: 'index2', url: url + '/flips/index2.html' }],

    'li-l-system': { type: 'apps', label: 'L-System', props: { iframe: '../l-system/index.html' } },
    'l-system': [{ label: 'index', url: url + '/l-system/index.html' }],

    'li-live-wysiwyg': {
        type: 'apps', label: 'li-live-wysiwyg', props: {
            src: '<h1 style="color: red;">li-live-html-editor with Preview</h1>'
        }
    },
    'live-wysiwyg': [{ label: 'index', url: url + '/live-wysiwyg' }, { label: 'index2', url: url + '/live-wysiwyg/index-2.html' }],

    'li-live-html': {
        type: 'apps', label: 'li-live-html', props: {
            lzs: `DwZwLgngNgpgfAKAJACMD2ATCACA3s1AQwGMBrAcwCc0BXAOwwFoBLAW0PJgC5sCkpmdGIUqMqhDMxh0wACgAsAVgwxyAGmwBiGDuwAmRQFINYSoTogADiOlh9Rk2YvXKt7AHYHWnTA9ftugCMAAzBhgCUanwCQiJiZpK2CsqqGgG+BsbYAO4AFsxgGV55Bb6eWel+FT7YIWHhANwEKCQU1PRMlmggBcxodDzBlgAe2EPDGorj2FMjTUhEZFS0DIw9AF7ctaEj2+MN2IdHh8gAvgjAAPTg0PAI98CSAG7YN7AAvABExGhQaJQ8VwYA4AM36YDWzE2PAAzHoRp9EPxmIwBE8YIxcmBWFBsAAFVxPKTZC6XZ6IIA`
        }
    },
    'live-html': [{ label: 'ace', url: url + '/live-html' }, { label: 'ace-demo', url: url + '/live-html/index-2.html' },
    { label: 'monaco', url: url + '/live-html-monaco/index.html' }, { label: 'monaco-demo', url: url + '/live-html-monaco/index-2.html' }],

    'li-lzstring': { type: 'apps', label: 'li-lzstring', props: { iframe: '../lzstring/index.html' } },
    'lzstring': [{ label: 'index', url: url + '/lzstring/index.html' }],

    'li-editor-ecard': { type: 'apps', label: 'ecard', props: { iframe: '../editor-ecard/index.html' } },
    'editor-ecard': [{ label: 'index', url: url + '/editor-ecard' }],

    'li-tester': { type: 'apps', label: 'li-tester' },
    'tester': [{ label: 'index', url: url + '/tester' }, { label: 'index2', url: url + '/tester/index-2.html' }],





    'li-dbmon': { type: 'demo', label: 'DBMON li-benchmark', props: { iframe: '../dbmon/index.html' } },
    'dbmon': [{ label: 'index', url: url + '/dbmon/index.html' }],

    'li-gallery': { type: 'demo', label: 'image gallery', props: { iframe: '../gallery/index.html' } },
    'gallery': [{ label: 'index', url: url + '/gallery/index.html' }],

    'li-dashboard': { type: 'demo', label: 'li-dashboard', props: { iframe: '../dashboard/index.html' } },
    dashboard: [{ label: 'index', url: url + '/dashboard' }],

    'li-layout-grid': { type: 'demo', label: 'li-layout-grid' },
    'layout-grid': [{ label: 'index', url: url + '/layout-grid' }],

    'li-layout-grid-new': { type: 'demo', label: 'li-layout-grid (infinite scroll)', props: { iframe: '../layout-grid-new/index.html' } },
    'layout-grid-new': [{ label: 'index', url: url + '/layout-grid-new' }],

    'li-layout-scheme': { type: 'demo', label: 'li-scheme-designer', props: { iframe: '../layout-scheme/index-3.html' } },
    'layout-scheme': [{ label: 'demo-1', url: url + '/layout-scheme' },
    { label: 'demo-2', url: url + '/layout-scheme/index-2.html' }, { label: 'demo-3', url: url + '/layout-scheme/index-3.html' }],

    'li-chart': {
        type: 'demo', label: 'li-chart (chart.js)', props: {
            type: 'bar',
            data: {
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [...[{
                    label: '# of Votes',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        }
    },
    'chart': [{ label: 'index', url: url + '/chart' }],

    'li-chart-apex': { type: 'demo', label: 'li-chart-apex', props: { iframe: '../chart-apex/index.html' } },
    'chart-apex': [{ label: 'index', url: url + '/chart-apex' }],

    'li-leaflet': {
        type: 'demo', label: 'leaflet map', props: {
            showPositionOnClick: true,
            latitude: 54.630627,
            longitude: 39.739861,
            zoom: 13,
            markers: [
                {
                    latitude: 54.630627,
                    longitude: 39.739861,
                    bindPopup: '<b>Hello world !!!</b><br>I am a Ryazan city.'
                }
            ],
            polygons: [
                {
                    polygons: [
                        [54.666187, 39.733772],
                        [54.664499, 39.736862],
                        [54.669662, 39.767418],
                        [54.680183, 39.7542],
                        [54.674129, 39.738235]
                    ],
                    bindPopup: 'I am a Lukovsky forest.'
                }
            ],
            circles: [
                {
                    latitude: 54.630627 - 0.02,
                    longitude: 39.739861 - 0.01,
                    args: {
                        color: 'red',
                        fillColor: '#f03',
                        fillOpacity: 0.5,
                        radius: 500
                    },
                    bindPopup: 'I am a Central Park of Culture and Leisure.'
                }
            ],
            polylines: [
                {
                    polylines: [[54.630627, 39.739861], [54.610627, 39.729861]],
                    bindPopup: 'I am a distance.',
                    args: { color: 'orange' },
                }
            ]
        }
    },
    'leaflet': [{ label: 'index', url: url + '/leaflet' }],

    'li-three-meshline': { type: 'demo', label: 'meshLine (three.js)' },
    'three-meshline': [{ label: 'index', url: url + '/three-meshline' }],

    'li-three-line2': { type: 'demo', label: 'line2 (three.js)' },
    'three-line2': [{ label: 'index', url: url + '/three-line2' }],

    'li-webgl-box': { type: 'demo', label: 'li-webgl-box', props: { iframe: '../webgl-box/index.html' } },
    'webgl-box': [{ label: 'index', url: url + '/webgl-box/index.html' }],

    'li-webgl-box4': { type: 'demo', label: 'li-webgl-box4', props: { iframe: '../webgl-box4/index.html' } },
    'webgl-box4': [{ label: 'index', url: url + '/webgl-box4/index.html' }],

    'li-life': { type: 'demo', label: 'Games of Life' },
    'life': [{ label: 'life (canvas opt2)', url: url + '/life/index-on-canvas.html' },
    { label: 'life (svg opt2)', url: url + '/life/index-on-svg.html' }, { label: 'life (svg opt1)', url: url + '/life' }],

    'li-life-webgl': { type: 'demo', label: 'Games of Life (webgl)', props: { id: 'life-webgl-tester' } },
    'life-webgl': [{ label: 'index', url: url + '/life-webgl' }],

}
