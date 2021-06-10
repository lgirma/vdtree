import {BOOL_ATTRS} from "./Common";
import {
    AbstractDomElement,
    AbstractDomNode,
    evalLazyElement, vd
} from "./AbstractDOM";
import {Dict, isArray, isFunc, Nullable, OneOrMany, toArray, uuid} from "boost-web-core";
// @ts-ignore
import {DiffDOM} from "diff-dom";
import {
    AbstractDomNodeWithState,
    AbstractReadableState,
    AbstractWritableState,
    StateSubscription,
    ValueBinding
} from "./AbstractState";
const dd = new DiffDOM({valueDiffing: false});

export function toDom<T extends Node>(root: OneOrMany<AbstractDomNode>, domDocument?: HTMLDocument): T[] {
    let result: T[] = []
    const roots = toArray(root)
    for (const item of roots) {
        if (typeof item == 'string') {
            result.push(item as any as T)
            continue
        }
        result.push(...toHtmlElement(item, domDocument) as T[])
    }
    return result
}

export function toDomElement<T extends Node>(root: OneOrMany<AbstractDomNode>, domDocument?: HTMLDocument): T {
    let items = toDom<T>(root, domDocument)
    if (items.length > 0)
        return items[0]
    return [''] as any
}

function toHtmlElement<T extends Node>(_root: AbstractDomElement, domDocument?: HTMLDocument): T[] {
    let evalRoot = evalLazyElement(_root)
    let results: T[] = []
    for (const i of evalRoot) {
        if (i == null)
            continue
        if (typeof i == 'string' || typeof i == 'number' || typeof i == 'boolean' || typeof i == 'bigint' || typeof i == 'symbol') {
            results.push(`${i}` as any)
            continue
        }
        /*else if (i.tag instanceof AbstractDomNodeWithState) {
            let state = new DOMState(i.tag.initialState)
            let stateMapping = i.tag.stateMapping
            //i = toArray(stateMapping(state))[0]
        }*/
        const result = (domDocument ?? document).createElement(i.tag) as HTMLElement
        for (const k in i.attrs) {
            const val = i.attrs[k]
            if (k === 'style' && typeof(val) === 'object') {
                for (const sk of Object.keys(val)) {
                    const sv = val[sk]
                    if (sv != null)
                        result.style[sk as any] = sv;
                }
            }
            else if (isFunc(val) && k.indexOf('on') == 0) {
                result.addEventListener(k.substr(2, k.length - 2).toLowerCase(), val)
            }
            // binding expressions:
            else if (val instanceof ValueBinding) {
                let stateVal = val.get(val.state.get())
                let bindingEL = e => val.set(val.state, e.target.type == 'checkbox' ? e.target.checked : e.target.value)
                if (k == 'checked') {
                    if (stateVal)
                        result.setAttribute(k, k)
                }
                else if (k == 'value')
                    result.setAttribute(k, stateVal)
                else {
                    result.setAttribute(k, stateVal)
                    console.warn('vdiff: Binding to non-value attribute ' + k)
                }
                result.addEventListener('change', bindingEL as any)
                result.addEventListener('input', bindingEL as any)
            }
            else if (BOOL_ATTRS.indexOf(k) > -1) {
                if (val) result.setAttribute(k, k)
            }
            else
                result.setAttribute(k, val)
        }
        for (const child of i.children) {
            if (child != null) {
                if (typeof child === 'string')
                    result.append(child)
                else if (child.tag instanceof AbstractDomNodeWithState) {
                    let state = new DOMState(child.tag.initialState)
                    let stateMapping = child.tag.stateMapping
                    let abstractElt = stateMapping(state)
                    let instance = renderToDom(abstractElt, result)
                    state.subscribe(() => {
                        instance.update(stateMapping(state))
                    })
                }
                else {
                    result.append(...toHtmlElement(child, domDocument))
                }
            }
        }
        results.push(result as any as T)
    }

    return results
}

interface DomElementInstance {
    $$virElement: AbstractDomElement
    $$domElement: Node
    update(newElt: AbstractDomElement): void
    newAttrs(attrs: any): void
}

export function renderToDom(elt: AbstractDomElement, target: HTMLElement): DomElementInstance {
    const domElt = toDomElement(elt, target.ownerDocument)
    target.append(domElt)
    return {
        $$virElement: elt,
        $$domElement: domElt,
        update(newElt: AbstractDomElement) {
            this.$$virElement = newElt
            const newDomElement = toDomElement(this.$$virElement, target.ownerDocument)
            const patcher = (dest: any, src: any) => dd.apply(dest, dd.diff(dest, src))
            let success = patcher(this.$$domElement, newDomElement)
            if (!success) {
                console.warn('vdtree: Diff couldn\'t be efficiently applied');
                this.$$domElement.parentNode!.replaceChild(this.$$domElement, newDomElement)
                this.$$domElement = newDomElement
            }
        },
        newAttrs(attrs: Dict<any>|((prev: Dict<any>) => Dict<any>)) {
            if (typeof attrs == 'function')
                this.$$virElement.attrs = attrs(this.$$virElement.attrs)
            else
                this.$$virElement.attrs = attrs
            this.update(this.$$virElement)
        }
    }
}

export class DOMState<T> extends AbstractWritableState<T> {
    $$val: T
    $$subscriptions = {}

    set(newVal: T) {
        this.update(v => newVal)
    }

    update(reducer) {
        this.$$val = reducer(this.$$val)
        this.notifySubscribers(this.$$val)
    }

    notifySubscribers(newVal: T) {
        for (const k in this.$$subscriptions) {
            this.$$subscriptions[k](newVal)
        }
    }

    get() { return this.$$val }

    subscribe(subscriber) {
        if (subscriber == null || !isFunc(subscriber))
            return
        let subscription = uuid()
        this.$$subscriptions[subscription] = subscriber
        return subscription
    }

    unsubscribe(subscription: StateSubscription) {
        delete this.$$subscriptions[subscription]
    }

    bind(expr?, setter?) {
        return new ValueBinding<T>(this, expr, setter)
    }

    mutate(reducer: (prev: T) => void): void {
        let newState = {...this.$$val}
        reducer(newState)
        this.update(p => newState)
    }

    constructor(initialValue: T) {
        super();
        this.$$val = initialValue
    }
}