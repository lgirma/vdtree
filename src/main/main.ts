import '../style.css'
import {AbstractDomElement, vd} from "../AbstractDOM";
import {vdRender, toDom, toDomElement} from "../DOM";

const app = document.querySelector<HTMLDivElement>('#app')!

let c = 0
function onIncrement(e: Event) {
    watch.update(vd(Counter, {count: ++c}))
}

const Counter = ({count = 0}) => vd('div', {}, [
    vd('div', {}, `${count}`),
    vd('button', {onclick: onIncrement}, '+')
])

let watch = vdRender(vd(Counter, {}), document.body)