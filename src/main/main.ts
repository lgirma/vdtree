import '../style.css'
import {vd} from "../AbstractDOM";
import {toDom, toDomElement} from "../DOM";

const app = document.querySelector<HTMLDivElement>('#app')!

const Greeter = ({name = ''}, children?: any) => [
    vd('div', {}, 'Welcome'),
    vd('div', {}, name),
    vd('div', {}, children)
]

app.append(toDomElement(vd('div',  {}, [
    vd('h1', {}, 'Hello, vd-Tree!'),
    vd('a', {href: 'https://vitejs.dev/guide/features.html', target: '_blank'}, 'Vite Documentation'),
    vd(Greeter, {name: 'vdTree'}, vd('span', {style: {color: 'blue'}}, 'inside'))
])))