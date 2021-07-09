import {DummyState} from "./DummyState";
import {ValueBinding} from "../src/AbstractState";
import {describe} from "mocha";
// @ts-ignore
const chai = require('chai');
const expect = chai.expect;

describe('Value Binding Tests', () => {

    it('Sets up default value binding', () => {
        let state = new DummyState({fullName: {first: 'John', last: 'A'}})
        let binding = state.bind()

        expect(binding.get(state.get()).fullName.first).to.equal('John')
        state.set({fullName: {first: 'Peter', last: 'A'}})
        expect(binding.get(state.get()).fullName.first).to.equal('Peter')
        binding.set(state, {fullName: {first: 'John', last: 'A'}})
        expect(binding.get(state.get()).fullName.first).to.equal('John')
    })

    it('Sets up property path value binding', () => {
        let state = new DummyState({fullName: {first: 'John', last: 'A'}})
        let binding = state.bind(x => x.fullName.first)

        expect(binding.get(state.get())).to.equal('John')
        binding.set(state, 'Peter')
        expect(binding.get(state.get())).to.equal('Peter')
    })

    it('Sets up value binding with custom setter', () => {
        let state = new DummyState([0, 1])
        let binding = state.bind(
            x => x.length,
            (s, len) => {
                s.set(Array(len).fill(0).map((v, i) => i))
            }
        )

        expect(binding.get(state.get())).to.equal(2)
        binding.set(state, 3)
        expect(state.get()).to.deep.equal([0, 1, 2])
    })
})