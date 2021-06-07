import { describe } from 'mocha';
import {vd, AbstractDomElement, evalLazyElement} from "../src/AbstractDOM";
// @ts-ignore
const chai = require('chai');
const expect = chai.expect;

describe('Abstract DOM Tests', () => {

    it('Sets up abstract DOM tree', () => {
        let abstractTree = vd('div', {}, [
            'child-1',
            vd('child-2', {}),
            'child-3'
        ])

        expect(abstractTree.tag).to.equal('div')
        expect(abstractTree.children.length).to.equal(3)
        expect(abstractTree.children[0]).to.equal('child-1')
        expect((abstractTree.children[1] as AbstractDomElement).tag).to.equal('child-2')
        expect(abstractTree.children[2]).to.equal('child-3')
    })

    it('Evaluates lazy elements properly', () => {
        let lazyComponent = ({name = ''}) => vd('div', {}, `Hello, ${name}`)
        let comp = evalLazyElement(vd(lazyComponent, {name: 'vd-tree'}))

        expect(comp.length).to.equal(1)
        let topComp = comp[0] as AbstractDomElement
        expect(topComp.tag).to.equal('div')
        expect(topComp.children[0]).to.equal('Hello, vd-tree')
    })

    it('Evaluates lazy elements with multi-top-level elements properly', () => {
        let lazyComponent = ({name = ''}) => [
            vd('div', {}, `Hello, ${name}`),
            vd('div', {}, `Welcome, ${name}`),
            `Good bye, ${name}`,
        ]
        let comps = evalLazyElement(vd(lazyComponent, {name: 'vd-tree'})) as AbstractDomElement[]

        expect(comps.length).to.equal(3)
        expect(comps[0].tag).to.equal('div')
        expect(comps[0].children[0]).to.equal('Hello, vd-tree')
        expect(comps[1].tag).to.equal('div')
        expect(comps[1].children[0]).to.equal('Welcome, vd-tree')
        expect(comps[2]).to.equal('Good bye, vd-tree')
    })

})