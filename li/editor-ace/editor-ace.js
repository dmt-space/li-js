import { LiElement, html, css } from '../../li.js';

import './src/ace.js'

// https://github.com/beautify-web/js-beautify
import './src/beautify.js';
// import './src/beautify-css.js';
import './src/beautify-html.js';

let url = import.meta.url;

customElements.define('li-editor-ace', class LiAceEditor extends LiElement {
    static get styles() {
        return css`
            ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: lightgray; } ::-webkit-scrollbar-thumb { background-color: gray; }
        `;
    }
    render() {
        return html`
            <div id="editor"></div>
        `
    }

    static get properties() {
        return {
            src: { type: String, default: '' },
            mode: {
                type: String,
                default: 'html',
                list: [
                    'abap', 'abc', 'actionscript', 'ada', 'apache_conf', 'apex', 'applescript', 'aql', 'asciidoc', 'asl', 'assembly_x86',
                    'autohotkey', 'batchfile', 'bro', 'c9search', 'cirru', 'clojure', 'cobol', 'coffee', 'coldfusion',
                    'crystal', 'csharp', 'csound_document', 'csound_orchestra', 'csound_scope', 'csp', 'css', 'curly',
                    'c_cpp', 'd', 'dart', 'diff', 'django', 'dockerfile', 'dot', 'drools', 'edifact',
                    'eiffel', 'ejs', 'elixir', 'elm', 'erlang', 'forth', 'fortran', 'fsl', 'ftl', 'gcode', 'gherkin', 'gitignore',
                    'glsl', 'gobstones', 'golang', 'graphqlschema', 'groovy', 'haml', 'handlebars', 'haskell', 'haskell_cabal', 'haxe',
                    'hjson', 'html', 'html_elixir', 'html_ruby', 'ini', 'io', 'jack', 'jade', 'java', 'javascript', 'json', 'json5',
                    'jsoniq', 'jsp', 'jssm', 'jsx', 'julia', 'kotlin', 'latex', 'less', 'liquid', 'lisp', 'livescript', 'logtalk',
                    'live_script', 'logiql', 'lsl', 'lua', 'luapage', 'lucene', 'makefile', 'markdown', 'mask', 'matlab',
                    'maze', 'mel', 'mixal', 'mushcode', 'mysql', 'nix', 'nsis', 'objectivec', 'ocaml', 'pascal',
                    'perl', 'perl6', 'pgsql', 'php', 'php_laravel_blade', 'pig', 'plain_text', 'powershell', 'praat', 'prolog', 'properties',
                    'protobuf', 'puppet', 'python', 'r', 'razor', 'rdoc', 'red', 'redshift', 'rhtml', 'rst', 'ruby', 'rust', 'sass', 'scad', 'scala',
                    'scheme', 'scss', 'sh', 'sjs', 'slim', 'smarty', 'snippets', 'soy_template', 'space', 'sparql', 'sql', 'sqlserver',
                    'stylus', 'svg', 'swift', 'swig', 'tcl', 'tex', 'text', 'textile', 'toml', 'tsx', 'turtle', 'twig', 'typescript',
                    'vala', 'vbscript', 'velocity', 'verilog', 'vhdl', 'visualforce', 'wollok', 'xml', 'xquery', 'yaml', 'zeek'
                ]
            },
            theme: {
                type: String,
                default: 'chrome', // 'solarized_light',
                list: ['ambiance', 'chaos', 'chrome', 'clouds', 'clouds_midnight', 'cobalt', 'crimson_editor', 'dawn', 'dracula',
                    'dreamweaver', 'eclipse', 'github', 'gob', 'gruvbox', 'idle_fingers', 'iplastic', 'katzenmilch', 'kr_theme', 'kuroir',
                    'merbivore', 'merbivore_soft', 'monokai', 'mono_industrial', 'pastel_on_dark', 'solarized_dark',
                    'solarized_light', 'sqlserver', 'terminal', 'textmate', 'tomorrow', 'tomorrow_night', 'tomorrow_night_blue',
                    'tomorrow_night_bright', 'tomorrow_night_eighties', 'twilight', 'vibrant_ink', 'xcode'
                ]
            },
            options: { type: Object, default: {} }
        }
    }
    get value() {
        return this.editor?.getValue();
    }
    set value(v) {
        this.editor.setValue(v ?? '', -1);
        this.editor.session.selection.clearSelection();
    }

    constructor() {
        super();
        this._options = icaro({
            // mode: 'ace/mode/html',
            // theme: 'ace/theme/chrome', // 'solarized_light',
            highlightActiveLine: true,
            highlightSelectedWord: true,
            readOnly: false,
            cursorStyle: 'slim', // "ace" | "slim" | "smooth" | "wide"
            //mergeUndoDeltas: false | true | "always"
            //behavioursEnabled: boolean,
            //wrapBehavioursEnabled: boolean,
            autoScrollEditorIntoView: true,
            copyWithEmptySelection: false,
            useSoftTabs: false,
            navigateWithinSoftTabs: false,
            enableMultiselect: true,
            hScrollBarAlwaysVisible: false,
            vScrollBarAlwaysVisible: false,
            highlightGutterLine: false,
            animatedScroll: true,
            showInvisibles: false,
            showPrintMargin: true,
            printMarginColumn: 80,
            //printMargin: false | number
            fadeFoldWidgets: false,
            showFoldWidgets: true,
            showLineNumbers: true,
            showGutter: true,
            displayIndentGuides: true,
            fontSize: 20,
            //fontFamily: css font-family value
            maxLines: Infinity,
            minLines: 50,
            //scrollPastEnd: number | boolean // number of page sizes to scroll after document end (typical values are 0, 0.5, and 1)
            fixedWidthGutter: false,
            firstLineNumber: 1,
            //overwrite: boolean,
            //newLineMode: "auto" | "unix" | "windows"
            useWorker: false,
            //useSoftTabs: boolean,
            //tabSize: number,
            wrap: true,
            foldStyle: 'markbeginend' //"markbegin" | "markbeginend" | "manual",
        })
        this._options.listen((e) => {
            this.editor.setOptions(this._options);
            this.$update();
        })
    }
    firstUpdated() {
        super.firstUpdated();
        ace.config.set('basePath', url.replace('editor-ace.js', 'src/'));
        this.editor = ace.edit(this.$id('editor'));
        this.editor.renderer.attachToShadowRoot();
        this.editor.setTheme('ace/theme/' + this.theme);
        this.editor.getSession().setMode('ace/mode/' + this.mode);
        this.editor.setOptions(this._options);
        this.editor.setOptions(this.options);
        this.editor.commands.addCommand({
            name: 'format',
            bindKey: { win: "Ctrl-Q", mac: "Cmd-Q" },
            exec: () => {
                // https://github.com/beautify-web/js-beautify
                const
                    mode = this.editor.session.getMode().$id,
                    // fn = mode.includes('html') ? html_beautify : mode.includes('css') ? css_beautify : js_beautify,
                    fn = mode.includes('html') ? html_beautify : js_beautify,
                    session = this.editor.getSession();
                session.setValue(fn(session.getValue(), {
                    // "indent_size": 4,
                    // "indent_char": " ",
                    // "indent_with_tabs": false,
                    // "editorconfig": false,
                    // "eol": "\n",
                    // "end_with_newline": false,
                    // "indent_level": 0,
                    // "preserve_newlines": true,
                    // "max_preserve_newlines": 10,
                    // "space_in_paren": false,
                    // "space_in_empty_paren": false,
                    // "jslint_happy": false,
                    // "space_after_anon_function": false,
                    // "space_after_named_function": false,
                    // "brace_style": "collapse",
                    // "unindent_chained_methods": false,
                    // "break_chained_methods": false,
                    // "keep_array_indentation": false,
                    // "unescape_strings": false,
                    // "wrap_line_length": 0,
                    // "e4x": false,
                    // "comma_first": false,
                    // "operator_position": "before-newline",
                    // "indent_empty_lines": false,
                    // "templating": ["auto"]
                }))
            }
        })
        this.value = this.src;
        this.editor.getSession().on('change', (e) => this.fire('change', this.value));
        this.$update();
    }
    updated(changedProperties) {
        if (this.editor) {
            if (changedProperties.has('src')) {
                this.value = this.src;
                this.$update();
            }
            if (changedProperties.has('theme')) {
                this.editor.setTheme('ace/theme/' + this.theme);
                this.$update();
            }
            if (changedProperties.has('mode')) {
                this.editor.getSession().setMode('ace/mode/' + this.mode);
                this.$update();
            }
            if (changedProperties.has('options')) {
                this.editor.setOptions(this.options);
                this.$update();
            }
        }
    }
})
