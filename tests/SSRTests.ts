import { describe } from 'mocha';
import {vd, AbstractDomElement, evalLazyElement} from "../src/AbstractDOM";
import {toHtmlString} from "../src/SSR";
// @ts-ignore
const chai = require('chai');
const expect = chai.expect;

describe('SSR Tests', () => {

    it('Generates basic HTML', () => {
        let abstractTree = vd('div', {}, [
            'child-1',
            vd('child-2', {}),
            'child-3'
        ])

        expect(toHtmlString(abstractTree)).to.equal(
            '<div>child-1<child-2></child-2>child-3</div>')
    })

    it('Generates HTML for multi-top level elements', () => {
        let comps = [
            vd('div', {divAttr: 'divAttrVal'}, 'child-1'),
            vd('p', {pAttr: 'pAttrVal'}, 'child-2')
        ]
        expect(toHtmlString(comps)).to.equal(
            '<div divAttr="divAttrVal">child-1</div><p pAttr="pAttrVal">child-2</p>'
        )
    })

    it('Generates HTML string for attributes', () => {
        let abstractTree = vd('div', {a: 'aVal', b: true, c: 1}, [
            vd('child', {b: null, c: 'cVal', d: 1}, 'child-content')
        ])

        expect(toHtmlString(abstractTree)).to.equal(
            '<div a="aVal" b="true" c="1"><child c="cVal" d="1">child-content</child></div>')
    })

    it('Generates boolean HTML attributes properly', () => {
        let abstractTree = vd('div', {a: 'aVal', disabled: true, hidden: false})

        expect(toHtmlString(abstractTree)).to.equal(
            '<div a="aVal" disabled></div>')
    })

    it('Generates style HTML attribute properly', () => {
        let abstractTree = vd('div', {style: {color:'red', 'border-color': 'red'}})

        expect(toHtmlString(abstractTree)).to.equal(
            '<div style="color: red;border-color: red;"></div>')
    })

    it('Generates void elements properly', () => {
        let abstractTree = vd('img', {src: '#'})

        expect(toHtmlString(abstractTree)).to.equal(
            '<img src="#">')
    })

    it('Generates HTML string for lazy components', () => {
        let lazyComponent = ({name = ''}) => vd('div', {}, `Hello, ${name}`)
        let comp = vd('div', {}, [
            vd(lazyComponent, {name: 'vd-tree'}),
            vd('a', {href: '#'}, 'Link')
        ])

        expect(toHtmlString(comp)).to.equal(
            '<div><div>Hello, vd-tree</div><a href="#">Link</a></div>'
        )
    })

})