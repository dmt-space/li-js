export const style = document.createElement('style');
style.textContent = `
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: lightgray; }
    ::-webkit-scrollbar-thumb {  background-color: gray; }

    :root {
        --font-family: Arial;
        --bar-background: white;
        --stroke-color: transparent;
        --content-background: white;
        --content-color: black;
        --header-color: black;
        --border-color: darkgray;
        --border-radius: 0px;

        --body-background: transparent;
        --body-color: #555555;
        --header-background: silver;

        --section-background: lightgrey;
        --section-color: black;

        --layout-background: whitesmoke;
        --layout-color: black;
    }
    
    html {
        height: 100%;
        touch-action: manipulation;
    }

    body {
        height: 100%;
        margin: 0px;
        padding: 0px;
        animation: fadeIn .5s;
        font-family: var(--font-family);
    }

    .content: {
        background-color: var(--content-background, white);
        color: var(--content-color, black);
        fill: var(--content-color, black);
    };

    .boxed: { 
        border: 1px solid darkgray;
        margin: 4px; 
        padding: 4px;
    };

    .horizontal: {
        display: flex;
        flex-direction: row;
    };
    .vertical: {
        display: flex;
        flex-direction: column;
    };

    .flex:{
        flex: 1;
        flex-basis: auto;
    };
    .no-flex: {
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: auto;
    };

    @keyframes blinker {
        100% {
            opacity: 0;
        }
    }
    @-webkit-keyframes blinker {
        100% {
            opacity: 0;
        }
    }
    
    @keyframes zoom-in {
        from {transform:scale(0)}
        to {transform:scale(1)}
    }
    @keyframes zoom-out {
        from {transform:scale(1)}
        to {transform:scale(0)}
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    @-moz-keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
    @-moz-keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`
document.head.appendChild(style);
