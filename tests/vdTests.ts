import { describe } from 'mocha';
import {h, AbstractDomElement} from "../src/AbstractDOM";
// @ts-ignore
const chai = require('chai');
const expect = chai.expect;

describe('Abstract DOM Tests', () => {

    it('Sets up abstract DOM tree', () => {
        let abstractTree = h('div', {},
            'child-1',
            h('child-2', {}),
            'child-3'
        )

        expect(abstractTree.tag).to.equal('div')
        expect(abstractTree.children.length).to.equal(3)
        expect(abstractTree.children[0]).to.equal('child-1')
        expect((abstractTree.children[1] as AbstractDomElement).tag).to.equal('child-2')
        expect(abstractTree.children[2]).to.equal('child-3')
    })

})