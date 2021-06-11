import '../style.css'
import {h} from "../AbstractDOM";
import {toReactComponent} from "../React";
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {useState} from "react";
import {SamplesPage} from "./SampleComponents";

const Redness = ({val = 0}) => <span style={{color: `rgb(${val}, 0, 0)`}}>Redness</span>

const AbstractCounterInfo = ({count = 0}) => h('div', {}, [
    `${count} - `,
    h(Redness, {val: count})
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

let DemoPage = toReactComponent(SamplesPage, React)

ReactDOM.render(<DemoPage />, document.getElementById('app')!)

