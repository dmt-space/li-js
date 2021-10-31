export const sets = {
    types: [
        { icon: 'dining', name: 'eating', label: 'еда' },
        { icon: 'water_drop', name: 'water', label: 'вода' },
        { icon: 'hiking', name: 'walking', label: 'шаги' },
        { icon: 'sports_volleyball', name: 'sport', label: 'спорт' },
        { icon: 'bedroom_parent', name: 'dream', label: 'сон' },
        { icon: 'monitor_weight', name: 'weighing', label: 'вес' },
        { icon: 'accessibility_new', name: 'measurements', label: 'измерения' },
        { icon: 'auto_stories', name: 'wiki', label: 'wiki', hideLabel: true },
        { icon: 'account-box', name: 'favorites', label: 'избранное' },
        { icon: 'flatware', name: 'calorie', label: 'таблица калорийности' },
    ],
    measurementsPos: [
        { name: 'шея', x: 104, y: 119, x1: 419, y1: 90, use: true, val: '' },
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
            sum: ['num2', 'prot2', 'fats2', 'carb2', 'kcal2'],
            sortColumns: ['date', 'time']
        },
        columns: [
            { name: '$idx', label: '№', width: 50 },
            { name: 'date', label: 'дата', width: 100 },
            { name: 'time', label: 'время (*:*)', width: 100 },
            { name: 'eating', label: 'прием пищи', width: 140 },
            { name: 'name', label: 'наименование', textAlign: 'left', showTitle: true },
            { name: 'num', label: '_кол', width: 50, hidden: true },
            { name: 'num2', label: 'кол', width: 50 },
            { name: 'ed', label: 'изм', width: 50, readonly: true },
            { name: 'prot', label: '_б', width: 60, hidden: true },
            { name: 'prot2', label: 'б', width: 60, calc: (e) => (+e.prot) / (+e.num) * (+e.num2) },
            { name: 'fats', label: '_ж', width: 60, hidden: true },
            { name: 'fats2', label: 'ж', width: 60, calc: (e) => (+e.fats) / (+e.num) * (+e.num2) },
            { name: 'carb', label: '_у', width: 60, hidden: true },
            { name: 'carb2', label: 'у', width: 60, calc: (e) => (+e.carb) / (+e.num) * (+e.num2) },
            { name: 'kcal', label: '_ккал', width: 60, hidden: true },
            { name: 'kcal2', label: 'ккал', width: 60, calc: (e) => (+e.kcal) / (+e.num) * (+e.num2) },
        ],
        rows: [

        ]
    },
    'water': {
        options: {
            sum: ['num'],
            sortColumns: ['date', 'time']
        },
        columns: [
            { name: '$idx', label: '№', width: 50 },
            { name: 'date', label: 'дата', width: 100 },
            { name: 'time', label: 'время (*:*)', width: 100 },
            { name: 'num', label: 'количество (л)', width: 120 },
            { name: 'note', label: 'примечание' },
        ],
        rows: [

        ]
    },
    'walking': {
        options: {
            sum: ['dur', 'dist', 'kcal2'],
            sortColumns: ['date', 'start']
        },
        columns: [
            { name: '$idx', label: '№', width: 50 },
            { name: 'date', label: 'дата', width: 100 },
            { name: 'start', label: 'старт (*:*)', width: 100 },
            { name: 'end', label: 'окончание', width: 100 },
            {
                name: 'dur', label: 'время (мин)', width: 100,
                calc: (e) => {
                    if (!e.end || !e.start) return '';
                    try {
                        let s2 = e.end.split(':'), s1 = e.start.split(':');
                        return Number(s2[0]) * 60 + Number(s2[1]) - Number(s1[0]) * 60 - Number(s1[1]);
                    } catch (error) {
                        return '';
                    }
                }
            },
            { name: 'dist', label: 'расстояние (км)', width: 120 },
            { name: 'kcal', label: 'ккал / мин', width: 100 },
            {
                name: 'kcal2', label: 'Итого (ккал)', width: 100, calc: (e) => {
                    if (!e.end || !e.start) return '';
                    try {
                        let s2 = e.end.split(':'), s1 = e.start.split(':');
                        return (Number(s2[0]) * 60 + Number(s2[1]) - Number(s1[0]) * 60 - Number(s1[1])) * e.kcal;
                    } catch (error) {
                        return '';
                    }
                }
            },
            { name: 'note', label: 'примечание' },
        ],
        rows: [

        ]
    },
    'sport': {
        options: {
            sum: ['dur', 'kcal2'],
            sortColumns: ['date', 'start']
        },
        columns: [
            { name: '$idx', label: '№', width: 50 },
            { name: 'date', label: 'дата', width: 100 },
            { name: 'typeName', label: 'тип занятия', width: 180 },
            { name: 'start', label: 'старт (*:*)', width: 100 },
            { name: 'end', label: 'окончание', width: 100 },
            {
                name: 'dur', label: 'время (мин)', width: 100,
                calc: (e) => {
                    if (!e.end || !e.start || e.end === e.start) return '';
                    try {
                        let s2 = e.end.split(':'), s1 = e.start.split(':');
                        return Number(s2[0]) * 60 + Number(s2[1]) - Number(s1[0]) * 60 - Number(s1[1]);
                    } catch (error) {
                        return '';
                    }
                }
            },
            { name: 'kcal', label: 'ккал / мин', width: 100 },
            { name: 'povtor', label: 'повтор', width: 100 },
            { name: 'kcalPovtor', label: 'ккал / повтор', width: 100 },
            {
                name: 'kcal2', label: 'итого (ккал)', width: 100, calc: (e) => {
                    if (+e.povtor && +e.kcalPovtor) return +e.povtor * +e.kcalPovtor;
                    if (!e.end || !e.start) return '';
                    try {
                        let s2 = e.end.split(':'), s1 = e.start.split(':');
                        return (Number(s2[0]) * 60 + Number(s2[1]) - Number(s1[0]) * 60 - Number(s1[1])) * e.kcal;
                    } catch (error) {
                        return '';
                    }
                }
            },
            { name: 'note', label: 'примечание' },
        ],
        rows: [

        ]
    },
    'dream': {
        options: {
            sum: ['dur', 'kcal2'],
            sortColumns: ['date', 'start']
        },
        columns: [
            { name: '$idx', label: '№', width: 50 },
            { name: 'date', label: 'дата', width: 100 },
            { name: 'start', label: 'старт (*:*)', width: 100 },
            { name: 'end', label: 'окончание', width: 100 },
            {
                name: 'dur', label: 'время (мин)', width: 100,
                calc: (e) => {
                    if (!e.end || !e.start || e.end === e.start) return '';
                    try {
                        let s2 = e.end.split(':'), s1 = e.start.split(':');
                        const res = Number(s2[0]) * 60 + Number(s2[1]) - Number(s1[0]) * 60 - Number(s1[1]);
                        if (res > 0) return res;
                        return Number(23 - s1[0]) * 60 + Number(60 - s1[1]) + Number(s2[0]) * 60 + Number(s2[1]);
                    } catch (error) {
                        return '';
                    }
                }
            },
            { name: 'kcal', label: 'ккал / мин', width: 100 },
            {
                name: 'kcal2', label: 'итого (ккал)', width: 100, calc: (e) => {
                    if (!e.end || !e.start || e.end === e.start) return '';
                    try {
                        let s2 = e.end.split(':'), s1 = e.start.split(':');
                        const res = (Number(s2[0]) * 60 + Number(s2[1]) - Number(s1[0]) * 60 - Number(s1[1])) * e.kcal;
                        if (res > 0) return res;
                        return (Number(23 - s1[0]) * 60 + Number(60 - s1[1]) + Number(s2[0]) * 60 + Number(s2[1])) * e.kcal;
                    } catch (error) {
                        return '';
                    }
                }
            },
            { name: 'note', label: 'примечание' },
        ],
        rows: [

        ]
    },
    'weighing': {
        options: {
            // footerHidden: true,
            sortColumns: ['date', 'time']
        },
        columns: [
            { name: '$idx', label: '№', width: 50 },
            { name: 'date', label: 'дата', width: 100 },
            { name: 'time', label: 'время (*:*)', width: 100  },
            { name: 'val', label: 'вес (кг)',  width: 100 },
            { name: 'note', label: 'примечание' },
        ],
        rows: [

        ]
    },
    'measurements': {
        options: {
            // footerHidden: true,
            sortColumns: ['date']
        },
        columns: [
            { name: '$idx', label: '№', width: 50 },
            { name: 'date', label: 'дата', width: 100 },
            { name: 'шея', label: 'шея' },
            { name: 'грудь', label: 'грудь' },
            { name: 'под грудью', label: 'под грудью' },
            { name: 'бицепс', label: 'бицепс' },
            { name: 'талия', label: 'талия' },
            { name: 'предплечье', label: 'предплечье' },
            { name: 'запястье', label: 'запястье', label: 'запястье' },
            { name: 'живот', label: 'живот' },
            { name: 'бедра', label: 'бедра' },
            { name: 'бедро', label: 'бедро' },
            { name: 'над коленом', label: 'над коленом' },
            { name: 'голень', label: 'голень' },
            { name: 'щиколотка', label: 'щиколотка' },
        ],
        rows: [

        ]
    },
    'favorites': {
        options: {
            lazy: true,
            headerService: true,
            headerServiceText: 'favorites',
            footerHidden: true,
            footerService: true,
            footerServiceTotal: true,
            headerHeight: 36,
            rowHeight: 36,
            searchColumns: ['category', 'name', 'sort'],
            actions: ['dblClickTableCell'],
            sortColumns: ['sort']
        },
        columns: [
            { name: '$idx', label: '№', width: 50 },
            { name: 'sort', label: 'сортировка', width: 140 },
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
