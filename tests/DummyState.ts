import {StateSubscription, ValueBinding, AbstractWritableState} from "../src";

export class DummyState<T = any> extends AbstractWritableState<T> {
    value: T
    get(): T { return this.value; }
    subscribe(subscriber: any): StateSubscription {
        return '';
    }
    unsubscribe(s: StateSubscription) {
    }
    constructor(initialVal: T) {
        super();
        this.value = initialVal;
    }

    bind<TVal = T>(expr?: (state: T) => TVal, setter?: (state: AbstractWritableState<T>, newValue: TVal) => void): ValueBinding<T, TVal> {
        return new ValueBinding<T, TVal>(this, expr, setter)
    }

    mutate(reducer: (prev: T) => void): void {
        let draft = {...this.value}
        reducer(draft)
        this.set(draft)
    }

    set(newVal: T): void {
        this.value = newVal
    }

    update(reducer: (prev: T) => T): void {
        this.set(reducer(this.value))
    }
}