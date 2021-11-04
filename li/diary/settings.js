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
            lazy: true,
            rowHeight: 36,
            headerService: true,
            headerServiceText: 'eating',
            sum: ['num2', 'prot2', 'fats2', 'carb2', 'kcal2'],
            sortColumns: ['date', 'time'],
            searchColumns: ['date', 'time', 'eating', 'name', 'tags'],
        },
        columns: [
            { name: '$idx', label: '№', width: 50 },
            { name: 'date', label: 'дата', width: 100 },
            { name: 'time', label: 'время (*:*)', width: 100 },
            { name: 'eating', label: 'прием пищи', width: 140 },
            { name: 'name', label: 'наименование', textAlign: 'left', showTitle: true, minWidth: 200 },
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
            { name: 'tags', label: 'теги', textAlign: 'left', width: 140 },
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
            { name: 'note', label: 'примечание', textAlign: 'left', minWidth: 100 },
        ],
        rows: [

        ]
    },
    'walking': {
        options: {
            sum: ['dur', 'dist', 'kcal2', 'step'],
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
            { name: 'step', label: 'шаги', width: 60 },
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
            { name: 'note', label: 'примечание', textAlign: 'left', minWidth: 100 },
        ],
        rows: [

        ]
    },
    'sport': {
        options: {
            headerService: true,
            headerServiceText: 'sport',
            searchColumns: ['typeName', 'note'],
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
            { name: 'note', label: 'примечание', textAlign: 'left', minWidth: 100 },
        ],
        rows: [

        ]
    },
    'dream': {
        options: {
            sum: ['dur', 'durH', 'kcal2'],
            sortColumns: ['date', 'start']
        },
        columns: [
            { name: '$idx', label: '№', width: 50 },
            { name: 'date', label: 'дата', width: 100 },
            { name: 'start', label: 'старт (*:*)', width: 100 },
            { name: 'end', label: 'окончание', width: 100 },
            {
                name: 'durH', label: 'время (ч)', width: 100,
                calc: (e) => {
                    if (!e.end || !e.start || e.end === e.start) return '';
                    try {
                        let s2 = e.end.split(':'), s1 = e.start.split(':');
                        let res = (Number(s2[0]) * 60 + Number(s2[1]) - Number(s1[0]) * 60 - Number(s1[1])) / 60;
                        if (res > 0) {
                            return res;
                        }
                        res = (Number(23 - s1[0]) * 60 + Number(60 - s1[1]) + Number(s2[0]) * 60 + Number(s2[1])) / 60;
                        return res;
                    } catch (error) {
                        return '';
                    }
                }
            },
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
            { name: 'rating', label: 'качество сна', typeColumn: 'rating', width: 120 },
            { name: 'note', label: 'примечание', textAlign: 'left', minWidth: 100 },
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
            { name: 'note', label: 'примечание', textAlign: 'left', minWidth: 100 },
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
            { name: 'шея', label: 'шея', minWidth: 35 },
            { name: 'грудь', label: 'грудь', minWidth: 35 },
            { name: 'под грудью', label: 'под грудью', minWidth: 35 },
            { name: 'бицепс', label: 'бицепс', minWidth: 35 },
            { name: 'талия', label: 'талия', minWidth: 35 },
            { name: 'предплечье', label: 'предплечье', minWidth: 35 },
            { name: 'запястье', label: 'запястье', minWidth: 35 },
            { name: 'живот', label: 'живот', minWidth: 35 },
            { name: 'бедра', label: 'бедра', minWidth: 35 },
            { name: 'бедро', label: 'бедро', minWidth: 35 },
            { name: 'над коленом', label: 'над коленом', minWidth: 35 },
            { name: 'голень', label: 'голень', minWidth: 35 },
            { name: 'щиколотка', label: 'щиколотка', minWidth: 35 }
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
            searchColumns: ['category', 'name', 'sort', 'tags'],
            actions: ['dblClickTableCell'],
            sortColumns: ['sort']
        },
        columns: [
            { name: '$idx', label: '№', width: 50 },
            { name: 'sort', label: 'категория (↑↓)', width: 200 },
            { name: 'category', label: 'категория', width: 200 },
            { name: 'name', label: 'наименование', textAlign: 'left', showTitle: true, minWidth: 200  },
            { name: 'num', label: 'кол', width: 50 },
            { name: 'ed', label: 'изм', width: 50 },
            { name: 'prot', label: 'б', width: 60 },
            { name: 'fats', label: 'ж', width: 60 },
            { name: 'carb', label: 'у', width: 60 },
            { name: 'kcal', label: 'ккал', width: 60 },
            { name: 'tags', label: 'теги', textAlign: 'left', width: 140 },
        ],
        rows: [

        ]
    }
}
