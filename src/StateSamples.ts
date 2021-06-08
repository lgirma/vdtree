import {AbstractDomNode, vd} from "./AbstractDOM";
import {withState} from './State'

const virCounter = withState(0,count => {
    return vd('div', {}, [
        vd('div', {}, `${count.get()}`),
        vd('button', {onclick: e => count.update(c => c+1)}, '+')
    ])
})

const virGreeter = withState('', name => {
    return vd('div', {}, [
        vd('input', {value: name.bind(), placeholder: 'Name'}),
        vd('div', {}, `Hello, ${name.get()}`)
    ])
})

const virRating = withState(0, rating => {
    return vd('div', {}, new Array(rating.get()).fill(0).map((v, i) =>
        vd('span', {
            onclick: e => rating.set(i+1),
            style: {cursor: 'pointer'}
        }, rating.get() > i ? '★' : '☆')
    ))
})

interface TodoItem {
    task: string
    isDone: boolean
}

const virTodo = withState({items: [] as TodoItem[], showComplete: false, filter: '', newTask: ''}, state => {
    return vd('div', {}, [
        vd('input', {value: state.bind(s => s.filter), placeholder: 'Filter'}),
        vd('label', {}, [
            vd('input', {type: 'checkbox', checked: state.bind(s => s.showComplete)}),
            'Show Completed'
        ]),
        vd('hr'),
        ...state.get().items.map((t, i) => vd('div', {}, [
            vd('label', {}, [
                vd('input', {type: 'checkbox', checked: state.bind(s => s.items[i].isDone)}),
                'Show Completed'
            ]),
            t.task
        ])),
        vd('hr'),
        vd('input', {value: state.bind(s => s.newTask), placeholder: 'New Item'}),
        vd('button', {onclick: e => state.mutate(s => s.items.push({task: s.newTask, isDone: false}))})
    ])
})