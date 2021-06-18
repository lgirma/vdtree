/** @jsx h */
import {h} from '../AbstractDOM'
import {withState} from "../AbstractState";
import {uuid} from "boost-web-core";

export const AbstractHelloWorld = ({subject = 'VD-Tree'}) => <span>{`Hello, ${subject}`}</span>

export const AbstractRating = ({maxVal = 5}) => withState(0, rating =>
    <div>
        <style>{`
            .star {cursor: pointer; font-size: 1.5em; color: darkorange;}
            .star:hover {font-weight: bold}
        `}</style>
        {new Array(maxVal).fill(0).map((v, i) =>
            <span class="star" onclick={() => rating.set(i+1)}>
                {rating.get() > i ? '★' : '☆'}
            </span>)}
    </div>
)

export const AbstractCounter = withState(0,count =>
    <div>
        <div>{count.get()}</div>
        <button onclick={e => count.update(c => c + 1)}>+</button>
        <button onClick={e => count.update(c => c - 1)}>-</button>
        <button onClick={e => count.set(0)}>Reset</button>
    </div>
)

export const AbstractTemperatureCounter = withState(0,count =>
    <div>
        <div style={{color: `rgb(${255-count.get()}, 0, ${count.get()})`}}><b>{count.get()}</b></div>
        <button onclick={e => count.update(c => c + 10)}>+</button>
        <button onClick={e => count.update(c => c - 10)}>-</button>
        <button onClick={e => count.set(0)}>Reset</button>
    </div>
)

export const AbstractAgreement = withState({agree: false}, state =>
    <div>
        <label>
            <input type="checkbox" checked={state.bind(s => s.agree)} /> I agree to terms
        </label>
        <div style={{color: (state.get().agree ? 'green' : 'red')}}>
            {state.get().agree ? 'All OK' : 'Please agree first'}
        </div>
    </div>
)

export const AbstractGreeter = withState('', name =>
    <div>
        <input value={name.bind()} placeholder="Name" />
        <div>Hello, {name.get()}</div>
    </div>
)

export const AbstractAdder = withState({a: '0', b: '0'}, args => {
        const {a, b} = {a: parseFloat(args.get().a), b: parseFloat(args.get().b)}
        return <div>
            <input value={args.bind(i => i.a)} placeholder="A" type="number"/> +
            <input value={args.bind(i => i.b)} placeholder="B" type="number"/> =
            <span>{a + b}</span>
        </div>
    }
)

export const AbstractQuadraticSolver = withState({c1: '0', c2: '0', c3: '0'}, coef => {
    const {a, b, c} = {
        a: parseFloat(coef.get().c1),
        b: parseFloat(coef.get().c2),
        c: parseFloat(coef.get().c3)
    }
    const d = b*b - 4*a*c
    return <div>
            <input value={coef.bind(i => i.c1)} placeholder="A" type="number"/> X<sup>2</sup> +
            <input value={coef.bind(i => i.c2)} placeholder="B" type="number"/> X +
            <input value={coef.bind(i => i.c3)} placeholder="C" type="number"/> = 0
            <div>
                {d < 0
                    ? 'No solution'
                    : <div>
                        X1 = {(- b + Math.sqrt(d)) / (2*a)},
                        X2 = {(- b - Math.sqrt(d)) / (2*a)}
                    </div>
                }
            </div>
        </div>
    }
)

const initialTodoState = {
    items: [{isDone: true, task: 'Sample task', id: 1}], showComplete: false, filter: '', newTask: ''
}

export const AbstractTodo = withState(initialTodoState, state =>
    <div>
        <div style={{display: 'table', marginBottom: '10px', padding: '3px', borderBottom: '1px solid grey'}}>
            <input value={state.bind(s => s.filter)} placeholder="Filter" type="search" />
            <label><input type="checkbox" checked={state.bind(s => s.showComplete)} /> Show Completed</label>
        </div>
        {
            state.get().items
                .filter(t => state.get().showComplete || !t.isDone)
                .filter(t => state.get().filter.length == 0 || t.task.toLowerCase().indexOf(state.get().filter.toLowerCase()) > -1)
                .map(t => <div>
                <label>
                    <input type="checkbox"
                          checked={state.bind(
                              s => s.items.find(j => j == t).isDone,
                              (s, v) => s.mutate(prev => prev.items.find(j => j == t).isDone = v))} />
                              {t.task}
                </label>
            </div>)
        }
        {state.get().items.length == 0 ? <div>No Tasks</div> : ''}
        <div>
            <input value={state.bind(s => s.newTask)} placeholder="New Item" />
            <button onclick={e => state.mutate(s => {
                s.items.push({task: s.newTask, isDone: false, id: s.items.length + 1})
                s.newTask = ''
            })}>Add New</button>
        </div>
    </div>
)

export const SamplesPage = <div>
    <h3>Static Component</h3>
    <div>Static Text</div>

    <h3>Func Component</h3>
    <AbstractHelloWorld subject="Vanilla JS" />

    <h3>Counter</h3>
    {AbstractCounter}

    <h3>Counter With Temperature</h3>
    {AbstractTemperatureCounter}

    <h3>Greeter</h3>
    {AbstractGreeter}

    <h3>Adder</h3>
    {AbstractAdder}

    {/*<h3>Quadratic Calculator</h3>
    {AbstractQuadraticSolver}

    <h3>Agreement</h3>
    {AbstractAgreement}

    <h3>Rating</h3>
    <AbstractRating maxVal={6} />

    <h3>Todo</h3>
    {AbstractTodo}*/}
</div>