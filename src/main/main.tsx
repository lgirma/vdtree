/** @jsx vd */
import '../style.css'
import {vd} from "../AbstractDOM";
import {renderToDom} from "../DOM";
import {AbstractRating, AbstractGreeter, AbstractCounter, AbstractTodo, AbstractHelloWorld} from "./SampleComponents";

const app = document.querySelector<HTMLDivElement>('#app')!

renderToDom(<div>
    <h4>Static Component</h4>
    <div>Static Text</div>

    <h4>Func Component</h4>
    <AbstractHelloWorld subject="Vanilla JS" />

    <h4>Counter</h4>
    <AbstractCounter />

    <h4>Greeter</h4>
    <AbstractGreeter />

    <h4>Rating</h4>
    <AbstractRating />

    <h4>Todo</h4>
    <AbstractTodo />
</div>, app)
