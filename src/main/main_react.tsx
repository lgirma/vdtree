import '../style.css'
import {vd} from "../AbstractDOM";
import {toReactComponent} from "../React";
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {useState} from "react";

const Redness = ({val = 0}) => <span style={{color: `rgb(${val}, 0, 0)`}}>Redness</span>

const AbstractCounterInfo = ({count = 0}) => vd('div', {}, [
    `${count} - `,
    vd(Redness, {val: count})
])

const CounterInfo = toReactComponent(AbstractCounterInfo, React)

function ReactCounter({startWith = 0}) {
    const [c, setC] = useState(startWith)
    return <div>
        <CounterInfo count={c} />
        <button onClick={e => setC(prev => prev+20)}>+</button>
        <button onClick={e => setC(prev => prev-20)}>-</button>
    </div>
}

ReactDOM.render(<ReactCounter startWith={3} />, document.getElementById('app')!)

