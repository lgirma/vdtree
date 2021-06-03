import '../style.css'
import {vd} from "../AbstractDOM";
import {toHtmlDom} from "../DOM";

const app = document.querySelector<HTMLDivElement>('#app')!

app.appendChild(toHtmlDom(vd('div', {}, [
    vd('h1', {}, 'Hello, Vite!'),
    vd('a', {href: 'https://vitejs.dev/guide/features.html', target: '_blank'}, 'Documentation')
])))