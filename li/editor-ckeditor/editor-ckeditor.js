import { LiElement, html, css } from '../../li.js';

import './lib/ckeditor.js';
import '../editor-template/editor-template.js';

customElements.define('li-editor-ckeditor', class LiEditorCkeditor extends LiElement {
    static get styles() {
        return css`
    
        `}

    render() {
        return html`
            <li-editor-template id="editor" srcdoc=${this.srcdoc}></li-editor-template>
        `
    }

    static get properties() {
        return {
            src: { type: String }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        setTimeout(() => {
            this.$qs('#editor').source = this.src;
        }, 500);
    }

    get srcdoc() {
        return `
<script src="http://127.0.0.1:5502/li/editor-ckeditor/lib/ckeditor.js"></script>
<div id="editor">
    ${this.src || ''}
</div>
<script>
    ClassicEditor
    .create( document.querySelector( '#editor' ) )
    .then( editor => {
        this.editor = editor;
        this.editor.model.document.on( 'change', () => {
            document.dispatchEvent(new CustomEvent('change', { detail: this.editor.getData() }));
        });
        this.editor.model.document.on( 'instanceReady', () => {
            this.editor.execCommand('maximize');
        });
    })
    .catch( err => {
        console.error( err.stack );
    });
</script>
        `
    }
})
