import {AbstractDomElement, AbstractDomNode} from "./AbstractDOM";
import {Dict, isFunc, OneOrMany, parseBindingExpression, toArray} from "boost-web-core";

export type StateSubscription = string

export abstract class AbstractReadableState<T = any> {
    abstract subscribe(subscriber: any): StateSubscription
    abstract unsubscribe(s: StateSubscription)
    abstract get(): T
}

function assign(obj: any, keyPath: string[], value: any) {
    let lastKeyIndex = keyPath.length-1;
    for (let i = 0; i < lastKeyIndex; ++ i) {
        const key = keyPath[i];
        if (!(key in obj)){
            obj[key] = {}
        }
        obj = obj[key];
    }
    obj[keyPath[lastKeyIndex]] = value;
}

export class ValueBinding<TState, TVal = TState> {
    set: (state: AbstractWritableState<TState>, newValue: TVal) => void
    get: (state: TState) => TVal
    state: AbstractWritableState<TState>

    constructor(state: AbstractWritableState<TState>, get?: (state: TState) => TVal, set?: (state: AbstractWritableState<TState>, newValue: TVal) => void) {
        this.state = state
        this.get = get ?? (s => s as unknown as TVal)
        this.set = set ?? (get == null
            ? ((s, v) => s.set(v as unknown as TState))
            : ((s, v) => s.mutate(prev => {
                let code = parseBindingExpression(get)
                let props = code.body.split('.')
                if (props[0] != code.args[0])
                    console.warn(`vdtree: Unsupported binding expression '${code.body}'`)
                else {
                    const [, ...propPaths] = props
                    assign(prev, propPaths, v)
                }
                /*let newCode = `(function(${code.args[0]}, v){ ${code.body} = v })`
                eval(newCode)(prev, v)*/
            })))
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
    abstract bind<TVal = T>(expr?: (state: T) => TVal, setter?: (state: AbstractWritableState<T>, newValue: TVal) => void): ValueBinding<T, TVal>
    abstract set(newVal: T): void
    abstract update(reducer: (prev: T) => T): void
    abstract mutate(reducer: (prev: T) => void): void
}

type StateMapping<TVal, TStore extends AbstractReadableState<TVal>> = (forState: TStore) => AbstractDomElement

export class AbstractDomNodeWithState<TVal = any, TStore extends AbstractReadableState<TVal> = AbstractReadableState<TVal>> {
    basedOn: TVal | TStore
    stateMapping: StateMapping<TVal, TStore>
    key: string

    constructor(_initialState: TVal | TStore, _stateMap: StateMapping<TVal, TStore>) {
        this.basedOn = _initialState
        this.stateMapping = _stateMap
        this.key = ''
    }
}

export function withState<T, TBasedOn extends AbstractWritableState<T> = AbstractWritableState>(initialValue: T, stateMapping: StateMapping<T, TBasedOn>): AbstractDomNodeWithState<T, TBasedOn> {
    return new AbstractDomNodeWithState(initialValue, stateMapping)
}