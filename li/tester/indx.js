let url = import.meta.url;
url = url.replace('/tester/indx.js', '');

export const indx = {

    'li-icon': { label: 'li-icon', props: { name: 'refresh', fill: 'red', speed: 1, blink: 1, size: 128 } },
    icon: [{ label: 'index', url: url + '/icon' }],

    'li-icons': { label: 'li-icons' },
    icons: [{ label: 'index', url: url + '/icons' }],

    'li-checkbox': { label: 'li-checkbox', props: { size: 64, fill: 'lightblue' } },
    checkbox: [{ label: 'index', url: url + '/checkbox' }],

    'li-button': { label: 'li-button', props: { name: 'android', fill: 'green', width: 'auto', label: 'Test button', size: 64 } },
    button: [{ label: 'index', url: url + '/button' }, { label: 'index-2', url: url + '/button/index-2.html' }],

    'li-color-input': { label: 'li-color-input' },
    'color-input': [{ label: 'index', url: url + '/color-input' }],

    'li-color-picker': { label: 'li-color-picker' },
    'color-picker': [{ label: 'index', url: url + '/color-picker' }],

    'li-calendar': { label: 'li-calendar' },
    'calendar': [{ label: 'index', url: url + '/calendar' }],

    'li-accordion': { label: 'li-accordion', props: { iframe: '../accordion/index.html' } },
    accordion: [{ label: 'index', url: url + '/accordion' }, { label: 'index-2', url: url + '/accordion/index-2.html' }],

    'li-dropdown': { label: 'li-dropdown', props: { iframe: '../dropdown/index-3.html' } },
    dropdown: [{ label: 'index', url: url + '/dropdown' }, { label: 'index-2', url: url + '/dropdown/index-2.html' }, { label: 'index-3', url: url + '/dropdown/index-3.html' }],

    'li-cell': {
        label: 'li-cell', props: {
            type: 'text', value: "I'm li-cell", left: [{ name: 'button', args: { name: 'android', border: 'none', fill: 'green', size: 42 } }],
            right: [{ name: 'button', args: { name: 'add', size: 32, fill: 'blue' } }, { name: 'button', args: { name: 'close', size: 32, fill: 'red' } }]
        }
    },
    cell: [{ label: 'index', url: url + '/cell' }],

    'li-table': { label: 'li-table', props: { iframe: '../table/index.html' } },
    table: [{ label: 'index', url: url + '/table' }, { label: 'calorie table', url: url + '/table/index2.html' }],

    'li-tabulator': {
        label: 'li-tabulator', props: {
            options: {
                maxHeight: "99%",
                minHeight: 400,
                height: "100%",
                layout: "fitColumns",
                data: [
                    { id: 1, name: "Oli Bob", age: 12, col: "red", dob: "", rating: 2 },
                    { id: 2, name: "Mary May", age: 13, col: "blue", dob: "14/05/1982", rating: 0 },
                    { id: 3, name: "Christine Lobowski", age: 42, col: "green", dob: "22/05/1982", rating: 4 },
                    { id: 4, name: "Brendon Philips", age: 81, col: "orange", dob: "01/08/1980", rating: 5 },
                    { id: 5, name: "Margret Marmajuke", age: 16, col: "yellow", dob: "31/01/1999", rating: 3 },
                    { id: 6, name: "Oli Bob", age: 27, col: "red", dob: "", rating: 1 },
                    { id: 7, name: "Mary May", age: 31, col: "blue", dob: "14/05/1982", rating: 4 },
                    { id: 8, name: "Christine Lobowski", age: 57, col: "green", dob: "22/05/1982", rating: 2 },
                    { id: 9, name: "Brendon Philips", age: 63, col: "orange", dob: "01/08/1980", rating: 4 },
                    { id: 10, name: "Margret Marmajuke", age: 99, col: "yellow", dob: "31/01/1999", rating: 5 },
                ],
                columns: [
                    { label: "id", field: "id", width: 150, bottomCalc: "sum", hozAlign: "center" },
                    { label: "Name", field: "name", width: 150 },
                    { label: "Age", field: "age", hozAlign: "center", bottomCalc: "avg" },
                    { label: "Favourite Color", field: "col" },
                    { label: "Date Of Birth", field: "dob", sorter: "date", hozAlign: "center" },
                    { label: "Rating", field: "rating", formatter: "star" }
                ]
            }
        }
    },
    tabulator: [{ label: 'index', url: url + '/tabulator' }],

    'li-tabs': {
        label: 'li-tabs',
        props: {
            vertical: true,
            horizontal: true,
            item: [
                { label: 'tab-001', icon: 'android' },
                { label: 'tab-002' },
                { label: 'tab-003' },
                { label: 'tab-004' },
                { label: 'tab-005' },
                { label: 'tab-000000005', icon: 'refresh' },
            ]
        }
    },
    tabs: [{ label: 'index', url: url + '/tree' }],

    'li-tree': {
        label: 'li-tree', props: {
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
        label: 'li-layout-designer', props: {
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

    'li-layout-designer-2': { label: 'li-layout-designer-2', props: { iframe: '../layout-designer-2/index.html' } },
    'layout-designer-2': [{ label: 'index', url: url + '/layout-designer-2' }],

    'li-dashboard': { label: 'li-dashboard', props: { iframe: '../dashboard/index.html' } },
    dashboard: [{ label: 'index', url: url + '/dashboard' }],
    
    'li-layout-grid': { label: 'li-layout-grid' },
    'layout-grid': [{ label: 'index', url: url + '/layout-grid' }],

    'li-layout-scheme': { label: 'li-scheme-designer', props: { iframe: '../layout-scheme/index-3.html' } },
    'layout-scheme': [{ label: 'demo-1', url: url + '/layout-scheme' },
    { label: 'demo-2', url: url + '/layout-scheme/index-2.html' }, { label: 'demo-3', url: url + '/layout-scheme/index-3.html' }],

    'li-layout-app': { label: 'li-layout-app' },
    'layout-app': [{ label: 'demo-1', url: url + '/layout-app' }, { label: 'demo-2', url: url + '/layout-app/demo.html' }, { label: 'demo-3', url: url + '/layout-app/demo2.html' }],

    'li-editor-ace': { label: 'li-editor-ace', props: { theme: 'dracula', mode: 'javascript', src: 'console.log(this.properties) // description' } },
    'editor-ace': [{ label: 'index', url: url + '/editor-ace' }],

    'li-editor-html': {
        label: 'li-editor-html', props: {
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

    'li-live-wysiwyg': {
        label: 'li-live-wysiwyg', props: {
            src: '<h1 style="color: red;">li-live-html-editor with Preview</h1>' }
    },
    'live-wysiwyg': [{ label: 'index', url: url + '/live-wysiwyg' }, { label: 'index2', url: url + '/live-wysiwyg/index-2.html' }],

    'li-live-html': {
        label: 'li-live-html', props: {
            lzs: `DwZwLgngNgpgfAKAJACMD2ATCACA3s1AQwGMBrAcwCc0BXAOwwFoBLAW0PJgC5sCkpmdGIUqMqhDMxh0wACgAsAVgwxyAGmwBiGDuwAmRQFINYSoTogADiOlh9Rk2YvXKt7AHYHWnTA9ftugCMAAzBhgCUanwCQiJiZpK2CsqqGgG+BsbYAO4AFsxgGV55Bb6eWel+FT7YIWHhANwEKCQU1PRMlmggBcxodDzBlgAe2EPDGorj2FMjTUhEZFS0DIw9AF7ctaEj2+MN2IdHh8gAvgjAAPTg0PAI98CSAG7YN7AAvABExGhQaJQ8VwYA4AM36YDWzE2PAAzHoRp9EPxmIwBE8YIxcmBWFBsAAFVxPKTZC6XZ6IIA` }
    },
    'live-html': [{ label: 'index', url: url + '/live-html' }, { label: 'index2', url: url + '/live-html/index-2.html' }],

    'li-viewer-md': { label: 'li-viewer-md', props: { src: url + '/viewer-md/sample.md' } },
    'viewer-md': [{ label: 'index', url: url + '/viewer-md' }],

    'li-qr-code': { label: 'li-qr-code', props: { value: 'https://resu062.github.io/li-site/li/tester/' } },
    'qr-code': [{ label: 'index', url: url + '/qr-code' }],

    'li-monitor': { label: 'li-monitor (fps-memory)', props: { iframe: '../monitor/index.html' } },
    monitor: [{ label: 'index', url: url + '/monitor' }],

    'li-tester': { label: 'li-tester' },
    tester: [{ label: 'index', url: url + '/tester' }, { label: 'index2', url: url + '/tester/index-2.html' }],

    'li-property-grid': {
        label: 'li-property-grid',
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

    'li-chart': {
        label: 'li-chart (chart.js)', props: {
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

    'li-chart-apex': { label: 'li-chart-apex', props: { iframe: '../chart-apex/index.html' } },
    'chart-apex': [{ label: 'index', url: url + '/chart-apex' }],

    'li-three-meshline': { label: 'meshLine (three.js)' },
    'three-meshline': [{ label: 'index', url: url + '/three-meshline' }],

    'li-three-line2': { label: 'line2 (three.js)' },
    'three-line2': [{ label: 'index', url: url + '/three-line2' }],

    'li-life': { label: 'Games of Life' },
    'life': [{ label: 'life (canvas opt2)', url: url + '/life/index-on-canvas.html' },
    { label: 'life (svg opt2)', url: url + '/life/index-on-svg.html' }, { label: 'life (svg opt1)', url: url + '/life' }],

    'li-life-webgl': { label: 'Games of Life (webgl)', props: { id: 'life-webgl-tester' } },
    'life-webgl': [{ label: 'index', url: url + '/life-webgl' }],

    'li-tetris': { label: 'TETRIS', props: { iframe: '../tetris/index.html' } },
    'tetris': [{ label: 'index', url: url + '/tetris' }],

    'li-valuta': { label: 'Курсы валют', props: { iframe: '../valuta/index.html' } },
    'credit-valuta': [{ label: 'index', url: url + '/valuta' }],

    'li-credit-calc': { label: 'Кредитный калькулятор', props: { iframe: '../credit-calc/index.html' } },
    'credit-calc': [{ label: 'index', url: url + '/credit-calc' }],

    'li-l-system': { label: 'L-System', props: { iframe: '../l-system/index.html' } },
    'l-system': [{ label: 'index', url: url + '/l-system/index.html' }],

    'li-dbmon': { label: 'DBMON li-benchmark', props: { iframe: '../dbmon/index.html' } },
    'dbmon': [{ label: 'index', url: url + '/dbmon/index.html' }],

    'li-gallery': { label: 'image gallery', props: { iframe: '../gallery/index.html' } },
    'gallery': [{ label: 'index', url: url + '/gallery/index.html' }],

    'li-app': { label: 'li-app' },
    app: [{ label: 'index', url: url + '/app' }],

    'li-wiki': { label: 'li-wiki (prototype)', props: { iframe: '../wiki/index.html' } },
    wiki: [{ label: 'index', url: url + '/wiki' }],

    'li-editor-ecard': { label: 'ecard', props: { iframe: '../editor-ecard/index.html' } },
    'editor-ecard': [{ label: 'index', url: url + '/editor-ecard' }],

    'li-diary': { label: 'li-diary', props: { iframe: '../diary/index.html' } },
    'diary': [{ label: 'index', url: url + '/diary' }],

    'li-lzstring': { label: 'li-lzstring', props: { iframe: '../lzstring/index.html' } },
    'lzstring': [{ label: 'index', url: url + '/lzstring/index.html' }],
}