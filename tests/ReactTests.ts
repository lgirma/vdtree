import { describe } from 'mocha';
import {h, AbstractDomElement, evalLazyElement} from "../src/AbstractDOM";
import {toReactElement, toReactComponent} from "../src/targets/React";
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {withState} from "../src/AbstractState";
// @ts-ignore
const chai = require('chai');
const expect = chai.expect;

describe('React Tests', () => {

    afterEach(() => {
        document.body.innerHTML = ''
        let root = document.createElement('div')
        root.id = 'root'
        document.body.append(root)
    })

    it('Generates JSX Elements properly', () => {
        let abstractTree = h('div', {},
            'child-1',
            h('child-2', {}, 'child-2-content'),
            'child-3'
        )

        let jsxElt = toReactElement(abstractTree, React)
        expect(jsxElt.type).to.equal('div')
        expect(jsxElt.props.children.length).to.equal(3)
        expect(jsxElt.props.children[0]).to.equal('child-1')
        expect(jsxElt.props.children[1].type).to.equal('child-2')
        expect(jsxElt.props.children[1].props.children).to.equal('child-2-content')
        expect(jsxElt.props.children[2]).to.equal('child-3')
    })

    it('Generates style attributes properly', () => {
        let divWithJSStyle = h('div', {style: {color:'red', borderColor: 'red', MsTransform: 'rotate(10deg)'}})
        let divWithStringStyle = h('div', {style: 'color:red; border-color:red; -ms-transform: rotate(10deg);'})

        let jsxJs = toReactElement(divWithJSStyle, React)
        let jsxString = toReactElement(divWithStringStyle, React)

        expect(jsxJs.props.style.color).to.equal('red')
        expect(jsxJs.props.style.borderColor).to.equal('red')
        expect(jsxJs.props.style.MsTransform).to.equal('rotate(10deg)')
        expect(jsxString.props.style.color).to.equal('red')
        expect(jsxString.props.style.borderColor).to.equal('red')
        expect(jsxString.props.style.MsTransform).to.equal('rotate(10deg)')
    })

    it('Generates JSX from lazy components properly', () => {
        let lazyComponent = ({name = ''}) => h('div', {}, `Hello, ${name}`)
        let abstractTree = h('div', {}, h(lazyComponent, {name: 'React'}))

        let jsxElt = toReactElement(abstractTree, React)
        expect(jsxElt.type).to.equal('div')
        expect(jsxElt.props.children[0].type).to.equal('div')
        expect(jsxElt.props.children[0].props.children).to.equal('Hello, React')
    })

    it('Retains React function components', () => {
        let reactFC = ({name = ''}) => React.createElement('div', {}, `Hello, ${name}`)
        let root = h('div', {},
            h(reactFC, {name: 'React'})
        )

        let jsxElt = toReactElement(root, React)
        expect(jsxElt.type).to.equal('div')
        expect(typeof jsxElt.props.children.type).to.equal('function')
        expect(jsxElt.props.children.props.name).to.equal('React')
    })

    it('Generates JSX for multi-top-level elements properly', () => {
        let abstractTree = [
            h('div', {}, 'child-1'),
            h('div', {}, 'child-2')
        ]

        let jsxElt = toReactElement(abstractTree, React)
        expect(jsxElt.type).to.equal(React.Fragment)
        expect(jsxElt.props.children.length).to.equal(2)
        expect(jsxElt.props.children[0].props.children).to.equal('child-1')
        expect(jsxElt.props.children[1].props.children).to.equal('child-2')
    })

    it('Generates stateful components properly', () => {
        let abstractTree = withState(0, count => h('div', {},
            h('span', {id: 'counter-info'}, count.get().toString()),
            h('button', {onclick: e => count.update(c => c + 1), id: 'btn-inc'}, '+')
        ))
        let ReactComp = toReactComponent(abstractTree as any, React)
        ReactDOM.render(React.createElement(ReactComp), document.getElementById('root')!)

        let btn = document.getElementById('btn-inc')!
        let info = document.getElementById('counter-info')!
        expect(info.innerHTML).to.equal('0')
        btn.click()
        expect(info.innerHTML).to.equal('1')
        btn.click()
        expect(info.innerHTML).to.equal('2')
    })

    it('Generates stateful components with two-way bindings properly', () => {
        let abstractTree = withState('', name => h('div', {},
            h('input', {value: name.bind(), id: 'input-name'}),
            h('button', {onclick: e => name.set('Hello'), id: 'btn-greet'}, '+')
        ))
        let ReactComp = toReactComponent(abstractTree as any, React)
        ReactDOM.render(React.createElement(ReactComp), document.getElementById('root')!)

        let btn = document.getElementById('btn-greet')!
        let input = document.getElementById('input-name')! as HTMLInputElement
        expect(input.value).to.equal('')
        btn.click()
        expect(input.value).to.equal('Hello')
    })

    it('Generates stateful components with property-path bindings properly', () => {
        let abstractTree = withState({fullName: ''}, contact => h('div', {},
            h('input', {value: contact.bind(c => c.fullName), id: 'input-full-name'}),
            h('button', {onclick: e => contact.update(c => ({...c, fullName: 'John'})), id: 'btn-set-name'}, '+')
        ))
        let ReactComp = toReactComponent(abstractTree as any, React)
        ReactDOM.render(React.createElement(ReactComp), document.getElementById('root')!)

        let btn = document.getElementById('btn-set-name')!
        let input = document.getElementById('input-full-name')! as HTMLInputElement
        expect(input.value).to.equal('')
        btn.click()
        expect(input.value).to.equal('John')
    })

})