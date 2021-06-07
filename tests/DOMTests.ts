import { describe } from 'mocha';
import {vd, AbstractDomElement, evalLazyElement} from "../src/AbstractDOM";
import {toDom, toDomElement} from "../src/DOM";
// @ts-ignore
const chai = require('chai');
const expect = chai.expect;

describe('DOM Tests', () => {

    it('Generates DOM elements properly', () => {
        let abstractTree = vd('div', {}, [
            'child-1',
            vd('child-2', {}, 'child-2-content'),
            'child-3'
        ])

        let comp = toDom(abstractTree)
        expect(comp.length).to.equal(1)
        let compFirst = comp[0] as HTMLElement
        let synthetic = document.createElement('div')
        synthetic.innerHTML = 'child-1<child-2>child-2-content</child-2>child-3'

        expect(compFirst.outerHTML).to.equal(synthetic.outerHTML)
    })

    it('Generates style HTML attribute properly', () => {
        let divWithJSStyle = vd('div', {style: {color:'red', borderColor: 'red'}})
        let divWithStringStyle = vd('div', {style: 'color:red; border-color:red; -ms-transform: rotate(10deg);'})
        let domJSStyleElt = toDomElement<HTMLDivElement>(divWithJSStyle)
        let domStringStyleElt = toDomElement<HTMLDivElement>(divWithStringStyle)

        expect(domJSStyleElt.style.color).to.equal('red')
        expect(domJSStyleElt.style.borderColor).to.equal('red')
        expect(domStringStyleElt.style.color).to.equal('red')
        expect(domStringStyleElt.style.borderColor).to.equal('red')
        // Vendor prefixes do not work in jsdom
        // expect(domStringStyleElt.style['msTransform' as any]).to.equal('rotate(10deg)')
    })

    it('Generates HTML string for lazy components', () => {
        let lazyComponent = ({name = ''}) => vd('div', {}, `Hello, ${name}`)
        let comp = vd('div', {}, [
            vd(lazyComponent, {name: 'vd-tree'}),
            vd('a', {href: '#'}, 'Link')
        ])

        expect(toDomElement<HTMLDivElement>(comp).outerHTML).to.equal(
            '<div><div>Hello, vd-tree</div><a href="#">Link</a></div>'
        )
    })

    it('Generates multi-top-level elements properly', () => {
        let abstractTree = [
            vd('div', {}, 'child-1'),
            vd('div', {}, 'child-2'),
        ]
        let domElts = toDom(abstractTree) as HTMLDivElement[]

        expect(domElts[0].tagName).to.equal('DIV')
        expect(domElts[0].innerHTML).to.equal('child-1')
        expect(domElts[1].tagName).to.equal('DIV')
        expect(domElts[1].innerHTML).to.equal('child-2')
    })

})