/** @jsx React.createElement */
import '../style.css'
import {toReactComponent} from "../targets/React";
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

let DemoPage = toReactComponent<React.ReactElement>(SamplesPage as any, React)

ReactDOM.render(<DemoPage />, document.getElementById('app')!)

