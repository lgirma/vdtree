import '../style.css'
import {vd} from "../AbstractDOM";
import {toDom, toDomElement} from "../DOM";

const app = document.querySelector<HTMLDivElement>('#app')!

const Greeter = ({name = ''}) => `Hello, ${name}`
app.append(...toDom(
    vd('div', {}, [
        'Greetings output',
        vd('br'),
        vd(Greeter, {name: 'John'}),
        vd('hr')
    ])
))