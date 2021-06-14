import '../style.css'
import {h} from "../AbstractDOM";
import {toReactComponent} from "../React";
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {useState} from "react";
import {
    AbstractAdder,
    AbstractAgreement,
    AbstractCounter, AbstractGreeter,
    AbstractHelloWorld,
    AbstractQuadraticSolver,
    AbstractRating, AbstractTodo,
    SamplesPage
} from "./SampleComponents";

let DemoPage = toReactComponent(SamplesPage as any, React)

ReactDOM.render(<DemoPage />, document.getElementById('app')!)

