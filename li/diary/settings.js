export const sets = {
    types: [
        { icon: 'dining', name: 'eating', label: 'еда' },
        { icon: 'account-box', name: 'favorites', label: 'избранное' },
        { icon: 'water_drop', name: 'water', label: 'вода' },
        { icon: 'hiking', name: 'walking', label: 'шаги' },
        { icon: 'sports_volleyball', name: 'sport', label: 'спорт' },
        { icon: 'bedroom_parent', name: 'dream', label: 'сон' },
        { icon: 'monitor_weight', name: 'weighing', label: 'вес' },
        { icon: 'accessibility_new', name: 'measurements', label: 'измерения' },
        { icon: 'auto_stories', name: 'wiki', label: 'wiki', hideLabel: true },
        { icon: 'flatware', name: 'calorie', label: 'таблица калорийности' },
    ],
    measurementsPos: [
        { name: 'шея', x: 104, y: 119, x1: 419, y1: 90, use: true, val: '', val: '' },
        { name: 'грудь', x: 104, y: 177, x1: 420, y1: 176, use: true, val: '' },
        { name: 'под грудью', x: 104, y: 191, x1: 420, y1: 189, use: true, val: '' },
        { name: 'бицепс', x: 163, y: 182, x1: 348, y1: 175, use: true, val: '' },
        { name: 'талия', x: 101, y: 222, x1: 422, y1: 213, use: true, val: '' },
        { name: 'предплечье', x: 166, y: 232, x1: 342, y1: 225, use: true, val: '' },
        { name: 'запястье', x: 147, y: 265, x1: 338, y1: 274, use: true, val: '' },
        { name: 'живот', x: 90, y: 267, x1: 405, y1: 245, use: true, val: '' },
        { name: 'бедра', x: 79, y: 297, x1: 414, y1: 275, use: true, val: '' },
        { name: 'бедро', x: 117, y: 332, x1: 377, y1: 327, use: true, val: '' },
        { name: 'над коленом', x: 134, y: 392, x1: 361, y1: 382, use: true, val: '' },
        { name: 'голень', x: 166, y: 458, x1: 364, y1: 446, use: true, val: '' },
        { name: 'щиколотка', x: 180, y: 510, x1: 362, y1: 513, use: true, val: '' },
    ],
    'wiki': [],
    'eating': {
        options: {

        }, 
        columns: [
            { name: 'дата', width: 120 },
            { name: 'время', width: 100 },
            { name: 'трапеза' },
            { name: 'количество', width: 100 },
            { name: 'кал.', width: 80 },
            { name: 'бел.', width: 80 },
            { name: 'жир.', width: 80 },
            { name: 'угл.', width: 80 },
            // { name: 'примечание' },
        ],
        rows: [

        ]
    },
    'water': {
        options: {

        }, 
        columns: [
            { name: 'дата' },
            { name: 'время приема' },
            { name: 'количество' },
            // { name: 'примечание' },
        ],
        rows: [
            
        ]
    },
    'walking': {
        options: {

        }, 
        columns: [
            { name: 'дата' },
            { name: 'старт' },
            { name: 'длительность' },
            { name: 'расстояние' },
            { name: 'кал.' },
            // { name: 'примечание' },
        ],
        rows: [
            
        ]
    },
    'sport': {
        options: {

        }, 
        columns: [
            { name: 'дата' },
            { name: 'тип' },
            { name: 'старт' },
            { name: 'параметры' },
            { name: 'кал.' },
            // { name: 'примечание' },
        ],
        rows: [
            
        ]
    },
    'dream': {
        options: {

        }, 
        columns: [
            { name: 'дата' },
            { name: 'старт' },
            { name: 'длительность' },
            { name: 'кал.' },
            // { name: 'примечание' },
        ],
        rows: [
            
        ]
    },
    'weighing': {
        options: {
            footerHidden: true
        },
        columns: [
            { name: 'дата' },
            { name: 'время измерения' },
            { name: 'вес' },
            // { name: 'примечание' },
        ],
        rows: [
            
        ]
    },
    'measurements': {
        options: {
            footerHidden: true
        },
        columns: [
            { name: 'дата' },
            { name: 'шея' },
            { name: 'грудь' },
            { name: 'под грудью' },
            { name: 'бицепс' },
            { name: 'талия' },
            { name: 'предплечье' },
            { name: 'запястье' },
            { name: 'живот' },
            { name: 'бедра' },
            { name: 'бедро' },
            { name: 'над коленом' },
            { name: 'голень' },
            { name: 'щиколотка' },
        ],
        rows: [
            
        ]
    },
    'favorites': {
        options: {
            lazy: true,
            headerService: true,
            headerServiceText: 'header service panel',
            footerService: true,
            footerServiceText: 'footer service panel',
            headerHeight: 36,
            rowHeight: 36,
            searchColumns: ['category', 'name']
        },
        columns: [
            { name: '_idx', label: '№', width: 50 },
            { name: 'category', label: 'категория', width: 200 },
            { name: 'name', label: 'наименование', textAlign: 'left', showTitle: true },
            { name: 'num', label: 'кол', width: 50 },
            { name: 'ed', label: 'изм', width: 50 },
            { name: 'prot', label: 'б', width: 60 },
            { name: 'fats', label: 'ж', width: 60 },
            { name: 'carb', label: 'у', width: 60 },
            { name: 'kcal', label: 'ккал', width: 60 },
        ],
        rows: [
            
        ]
    }
}
