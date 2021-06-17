import { describe } from 'mocha';
import {h, AbstractDomElement, evalLazyElement} from "../src/AbstractDOM";
import {toHtmlString} from "../src/targets/SSR";
// @ts-ignore
const chai = require('chai');
const expect = chai.expect;

describe('SSR Tests', () => {

    it('Generates basic HTML', () => {
        let abstractTree = h('div', {},
            'child-1',
            h('child-2', {}),
            'child-3'
        )

        expect(toHtmlString(abstractTree)).to.equal(
            '<div>child-1<child-2></child-2>child-3</div>')
    })

    it('Generates HTML for multi-top level elements', () => {
        let comps = [
            h('div', {divAttr: 'divAttrVal'}, 'child-1'),
            h('p', {pAttr: 'pAttrVal'}, 'child-2')
        ]
        expect(toHtmlString(comps)).to.equal(
            '<div divAttr="divAttrVal">child-1</div><p pAttr="pAttrVal">child-2</p>'
        )
    })

    it('Generates HTML string for attributes', () => {
        let abstractTree = h('div', {a: 'aVal', b: true, c: 1},
            h('child', {b: null, c: 'cVal', d: 1}, 'child-content')
        )

        expect(toHtmlString(abstractTree)).to.equal(
            '<div a="aVal" b="true" c="1"><child c="cVal" d="1">child-content</child></div>')
    })

    it('Generates boolean HTML attributes properly', () => {
        let abstractTree = h('div', {a: 'aVal', disabled: true, hidden: false})

        expect(toHtmlString(abstractTree)).to.equal(
            '<div a="aVal" disabled></div>')
    })

    it('Generates style HTML attribute properly', () => {
        let divWithJSStyle = h('div', {style: {color:'red', borderColor: 'red'}})
        let divWithStringStyle = h('div', {style: 'color:red;border-color:red;'})

        expect(toHtmlString(divWithJSStyle)).to.equal(
            '<div style="color: red;border-color: red;"></div>')

        expect(toHtmlString(divWithStringStyle)).to.equal(
            '<div style="color:red;border-color:red;"></div>')
    })

    it('Generates void elements properly', () => {
        let abstractTree = h('img', {src: '#'})

        expect(toHtmlString(abstractTree)).to.equal(
            '<img src="#">')
    })

    it('Generates HTML string for lazy components', () => {
        let lazyComponent = ({name = ''}) => h('div', {}, `Hello, ${name}`)
        let comp = h('div', {},
            h(lazyComponent, {name: 'h-tree'}),
            h('a', {href: '#'}, 'Link')
        )

        expect(toHtmlString(comp)).to.equal(
            '<div><div>Hello, h-tree</div><a href="#">Link</a></div>'
        )
    })

})