import {AbstractDomElement, AbstractDomNode} from "./AbstractDOM";
import {OneOrMany} from "boost-web-core";

export type StateSubscription = string

export abstract class AbstractReadableState<T = any> {
    abstract bind<TP = T>(expr?: (state: T) => TP): AbstractReadableState<TP>
    abstract subscribe(subscriber: any): StateSubscription
    abstract unsubscribe(s: StateSubscription)
    abstract get(): T
}

export abstract class AbstractWritableState<T = any> extends AbstractReadableState<T> {
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