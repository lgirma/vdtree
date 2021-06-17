import { describe } from 'mocha';
import {h, AbstractDomElement, evalLazyElement} from "../src/AbstractDOM";
import {toReactElement, toReactComponent} from "../src/targets/React";
import * as React from 'react'
// @ts-ignore
const chai = require('chai');
const expect = chai.expect;

describe('React Tests', () => {

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

})