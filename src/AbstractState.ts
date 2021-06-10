import {AbstractDomElement, AbstractDomNode} from "./AbstractDOM";
import {OneOrMany, parseBindingExpression} from "boost-web-core";

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

export abstract class AbstractWritableState<T = any> extends AbstractReadableState<T> {
    abstract bind(expr?: (state: T) => any, setter?: (state: AbstractWritableState<T>, newValue: any) => void): ValueBinding<T>
    abstract set(newVal: T): void
    abstract update(reducer: (prev: T) => T): void
    abstract mutate(reducer: (prev: T) => void): void
}

type StateMapping<TVal> = (forState: AbstractWritableState<TVal>) => AbstractDomElement

export class AbstractDomNodeWithState<TVal = any> extends Function {
    initialState: TVal
    stateMapping: StateMapping<TVal>

    constructor(_initialState: TVal, _stateMap: StateMapping<TVal>) {
        super()
        this.initialState = _initialState
        this.stateMapping = _stateMap
    }
}

export function withState<T>(initialValue: T, stateMapping: StateMapping<T>): AbstractDomNodeWithState<T> {
    return new AbstractDomNodeWithState(initialValue, stateMapping)
}