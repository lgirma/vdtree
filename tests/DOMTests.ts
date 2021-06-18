import { describe } from 'mocha';
import {h, AbstractDomElement, evalLazyElement} from "../src/AbstractDOM";
import {toDomElements, toDomElement} from "../src/targets/DOM";
import {withState} from "../src/AbstractState";
// @ts-ignore
const chai = require('chai');
const expect = chai.expect;

describe('DOM Tests', () => {

    it('Generates DOM elements properly', () => {
        let abstractTree = h('div', {},
            'child-1',
            h('child-2', {}, 'child-2-content'),
            'child-3'
        )

        let comp = toDomElements(abstractTree)
        expect(comp.length).to.equal(1)
        let compFirst = comp[0] as HTMLElement
        let synthetic = document.createElement('div')
        synthetic.innerHTML = 'child-1<child-2>child-2-content</child-2>child-3'

        expect(compFirst.outerHTML).to.equal(synthetic.outerHTML)
    })

    it('Generates style HTML attribute properly', () => {
        let divWithJSStyle = h('div', {style: {color:'red', borderColor: 'red'}})
        let divWithStringStyle = h('div', {style: 'color:red; border-color:red; -ms-transform: rotate(10deg);'})
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
        let lazyComponent = ({name = ''}) => h('div', {}, `Hello, ${name}`)
        let comp = h('div', {},
            h(lazyComponent, {name: 'h-tree'}),
            h('a', {href: '#'}, 'Link')
        )

        expect(toDomElement<HTMLDivElement>(comp).outerHTML).to.equal(
            '<div><div>Hello, h-tree</div><a href="#">Link</a></div>'
        )
    })

    it('Generates multi-top-level elements properly', () => {
        let abstractTree = [
            h('div', {}, 'child-1'),
            h('div', {}, 'child-2'),
        ]
        let domElts = toDomElements(abstractTree) as HTMLDivElement[]

        expect(domElts[0].tagName).to.equal('DIV')
        expect(domElts[0].innerHTML).to.equal('child-1')
        expect(domElts[1].tagName).to.equal('DIV')
        expect(domElts[1].innerHTML).to.equal('child-2')
    })

    it('Generates stateful components properly', () => {
        document.body.innerHTML = ''
        let abstractTree = withState(0, count => h('div', {},
            h('span', {id: 'counter-info'}, count.get().toString()),
            h('button', {onclick: e => count.update(c => c + 1), id: 'btn-inc'}, '+')
        ))
        let domElt = toDomElement(abstractTree as any, document.body)
        document.body.append(domElt)

        let btn = document.getElementById('btn-inc')!
        let info = document.getElementById('counter-info')!
        expect(info.innerHTML).to.equal('0')
        btn.click()
        expect(info.innerHTML).to.equal('1')
        btn.click()
        expect(info.innerHTML).to.equal('2')
    })

    it('Generates stateful components with two-way bindings properly', () => {
        document.body.innerHTML = ''
        let abstractTree = withState('', name => h('div', {},
            h('input', {value: name.bind(), id: 'input-name'}),
            h('button', {onclick: e => name.set('Hello'), id: 'btn-greet'}, '+')
        ))
        let domElt = toDomElement(abstractTree as any, document.body)
        document.body.append(domElt)

        let btn = document.getElementById('btn-greet')!
        let input = document.getElementById('input-name')! as HTMLInputElement
        expect(input.value).to.equal('')
        btn.click()
        expect(input.value).to.equal('Hello')
    })

    it('Generates stateful components with property-path bindings properly', () => {
        document.body.innerHTML = ''
        let abstractTree = withState({fullName: ''}, contact => h('div', {},
            h('input', {value: contact.bind(c => c.fullName), id: 'input-full-name'}),
            h('button', {onclick: e => contact.update(c => ({...c, fullName: 'John'})), id: 'btn-set-name'}, '+')
        ))
        let domElt = toDomElement(abstractTree as any, document.body)
        document.body.append(domElt)

        let btn = document.getElementById('btn-set-name')!
        let input = document.getElementById('input-full-name')! as HTMLInputElement
        expect(input.value).to.equal('')
        btn.click()
        expect(input.value).to.equal('John')
    })

})