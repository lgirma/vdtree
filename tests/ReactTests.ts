import { describe } from 'mocha';
import {vd, AbstractDomElement, evalLazyElement} from "../src/AbstractDOM";
import {toJsxElement, toReactComponent} from "../src/React";
import * as React from 'react'
// @ts-ignore
const chai = require('chai');
const expect = chai.expect;

describe('React Tests', () => {

    it('Generates JSX Elements properly', () => {
        let abstractTree = vd('div', {}, [
            'child-1',
            vd('child-2', {}, 'child-2-content'),
            'child-3'
        ])

        let jsxElt = toJsxElement(abstractTree, React)
        expect(jsxElt.type).to.equal('div')
        expect(jsxElt.props.children.length).to.equal(3)
        expect(jsxElt.props.children[0]).to.equal('child-1')
        expect(jsxElt.props.children[1].type).to.equal('child-2')
        expect(jsxElt.props.children[1].props.children).to.equal('child-2-content')
        expect(jsxElt.props.children[2]).to.equal('child-3')
    })

    it('Generates style attributes properly', () => {
        let divWithJSStyle = vd('div', {style: {color:'red', borderColor: 'red', MsTransform: 'rotate(10deg)'}})
        let divWithStringStyle = vd('div', {style: 'color:red; border-color:red; -ms-transform: rotate(10deg);'})

        let jsxJs = toJsxElement(divWithJSStyle, React)
        let jsxString = toJsxElement(divWithStringStyle, React)

        expect(jsxJs.props.style.color).to.equal('red')
        expect(jsxJs.props.style.borderColor).to.equal('red')
        expect(jsxJs.props.style.MsTransform).to.equal('rotate(10deg)')
        expect(jsxString.props.style.color).to.equal('red')
        expect(jsxString.props.style.borderColor).to.equal('red')
        expect(jsxString.props.style.MsTransform).to.equal('rotate(10deg)')
    })

    it('Generates JSX from lazy components properly', () => {
        let lazyComponent = ({name = ''}) => vd('div', {}, `Hello, ${name}`)
        let abstractTree = vd('div', {}, [
            vd(lazyComponent, {name: 'React'})
        ])

        let jsxElt = toJsxElement(abstractTree, React)
        expect(jsxElt.type).to.equal('div')
        expect(typeof jsxElt.props.children.type).to.equal('function')
        expect(jsxElt.props.children.props.name).to.equal('React')
    })

    it('Generates JSX for multi-top-level elements properly', () => {
        let abstractTree = [
            vd('div', {}, 'child-1'),
            vd('div', {}, 'child-2')
        ]

        let jsxElt = toJsxElement(abstractTree, React)
        expect(jsxElt.type).to.equal(React.Fragment)
        expect(jsxElt.props.children.length).to.equal(2)
        expect(jsxElt.props.children[0].props.children).to.equal('child-1')
        expect(jsxElt.props.children[1].props.children).to.equal('child-2')
    })

})