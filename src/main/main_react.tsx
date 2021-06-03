import '../style.css'
import {vd} from "../AbstractDOM";
import {toJsxElement, toReactComponent} from "../React";
import * as React from 'react'
import * as ReactDOM from 'react-dom'

const AbstractGreeter = ({name = ''}) =>
    vd('div', {class: 'active'}, `Hello, ${name}`)
const ReactGreeter = toReactComponent(React.createElement, AbstractGreeter)

ReactDOM.render(<ReactGreeter name="React vd-tree"/>, document.getElementById('app')!)

