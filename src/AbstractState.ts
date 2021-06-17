import {AbstractDomElement, AbstractDomNode} from "./AbstractDOM";
import {Dict, isFunc, OneOrMany, parseBindingExpression, toArray} from "boost-web-core";

export type StateSubscription = string

export abstract class AbstractReadableState<T = any> {
    abstract subscribe(subscriber: any): StateSubscription
    abstract unsubscribe(s: StateSubscription)
    abstract get(): T
}

export class ValueBinding<T> {
    set: (state: AbstractWritableState<T>, newValue: any) => void
    get: (state: T) => any
    state: AbstractWritableState<T>

    constructor(state, get?, set?) {
        this.state = state
        this.get = get ?? (s => s)
        this.set = set
        if (this.set == null) {
            this.set = get == null
                ? ((s, v) => s.set(v))
                : ((s, v) => s.mutate(prev => {
                    let code = parseBindingExpression(get)
                    let newCode = `(function(${code.args[0]}, v){ ${code.body} = v })`
                    eval(newCode)(prev, v)
                }))
        }
    }
}

export class DerivedReadonlyState<T, TBasedOn extends AbstractReadableState[]> extends AbstractReadableState<T> {
    $$basedOn: TBasedOn
    $$derivation: (states: TBasedOn) => T

    get(): T { return this.$$derivation(this.$$basedOn) }

    subscribe(subscriber: any): StateSubscription {
        this.$$basedOn.forEach(s => s.subscribe(() => subscriber(this.get())))
        return ''
    }

    unsubscribe(s: StateSubscription) {
        //this.$$basedOn.unsubscribe(s)
    }

    constructor(basedOn: TBasedOn, derivation: (states: TBasedOn) => T) {
        super();
        this.$$basedOn = basedOn ?? []
        this.$$derivation = derivation
    }
}

export abstract class AbstractWritableState<T = any> extends AbstractReadableState<T> {
    abstract bind(expr?: (state: T) => any, setter?: (state: AbstractWritableState<T>, newValue: any) => void): ValueBinding<T>
    abstract set(newVal: T): void
    abstract update(reducer: (prev: T) => T): void
    abstract mutate(reducer: (prev: T) => void): void
}

type StateMapping<TVal, TStore extends AbstractReadableState<TVal>> = (forState: TStore) => AbstractDomElement

export class AbstractDomNodeWithState<TVal = any, TStore extends AbstractReadableState<TVal> = AbstractReadableState<TVal>> {
    basedOn: TVal | TStore
    stateMapping: StateMapping<TVal, TStore>

    constructor(_initialState: TVal | TStore, _stateMap: StateMapping<TVal, TStore>) {
        this.basedOn = _initialState
        this.stateMapping = _stateMap
    }
}

export function withState<T, TBasedOn extends AbstractWritableState<T> = AbstractWritableState>(initialValue: T, stateMapping: StateMapping<T, TBasedOn>): AbstractDomNodeWithState<T, TBasedOn> {
    return new AbstractDomNodeWithState(initialValue, stateMapping)
}