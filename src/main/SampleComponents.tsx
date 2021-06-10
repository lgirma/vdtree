/** @jsx vd */
import {vd} from '../AbstractDOM'
import {withState} from "../AbstractState";

export const AbstractHelloWorld = ({subject = 'VD-Tree'}) => `Hello, ${subject}`

export const AbstractRating = withState(0, rating =>
    <div>
        <style>{`
            .star {cursor: pointer; font-size: 1.5em; color: darkorange;}
            .star:hover {font-weight: bold}
        `}</style>
        {new Array(5).fill(0).map((v, i) =>
            <span class="star" onclick={() => rating.set(i+1)}>
                {rating.get() > i ? '★' : '☆'}
            </span>)}
    </div>
)

export const AbstractCounter = withState(0,count =>
    <div>
        <div>{count.get()}</div>
        <button onclick={e => count.update(c => c+1)}>+</button>
    </div>
)

export const AbstractGreeter = withState('', name =>
    <div>
        <input value={name.bind()} placeholder="Name" />
        <div>Hello, {name.get()}</div>
    </div>
)

interface TodoItem {
    task: string
    isDone: boolean
}

const initialTodoState = {
    items: [] as TodoItem[], showComplete: false, filter: '', newTask: ''
}

export const AbstractTodo = withState(initialTodoState, state =>
    <div>
        <div style={{display: 'table', marginBottom: '10px', padding: '3px', borderBottom: '1px solid grey'}}>
            <input value={state.bind(s => s.filter)} placeholder="Filter" />
            <label><input type="checkbox" checked={state.bind(s => s.showComplete)} /> Show Completed</label>
        </div>
        {
            state.get().items.filter(t => state.get().showComplete || !t.isDone).map((t, i) => <div>
                <label><input type="checkbox" checked={state.bind(s => s.items[i].isDone, (s, v) => s.mutate(prev => prev.items[i].isDone = v))} /> {t.task}</label>
            </div>)
        }
        {state.get().items.length == 0 ? <div>No Tasks</div> : ''}
        <div>
            <input value={state.bind(s => s.newTask)} placeholder="New Item" />
            <button onclick={e => state.mutate(s => {
                s.items.push({task: s.newTask, isDone: false})
                s.newTask = ''
            })}>Add New</button>
        </div>
    </div>
)