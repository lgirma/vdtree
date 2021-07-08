import {BOOL_ATTRS} from "./Common";
import {
    AbstractFuncComponent,
    AbstractDomElement,
    AbstractDomNode
} from "./AbstractDOM";
import {Dict, isArray, isFunc, Nullable, OneOrMany, toArray, randomHash} from "boost-web-core";
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

export function toDomElements<T extends Node|Text>(root: OneOrMany<AbstractDomNode>, target?: HTMLElement): T[] {
    let result: T[] = []
    const roots = toArray(root)
    let domDocument = (target?.ownerDocument ?? document)
    for (const item of roots) {
        if (item == null)
            continue
        else if (typeof item == 'string' || typeof item == 'number' || typeof item == 'boolean' || typeof item == 'bigint') {
            result.push(domDocument.createTextNode(`${item}`) as T)
        }
        else result.push(...abstractDomElementToDomElements(item, target) as T[])
    }
    return result
}

export function toDomElement<T extends Node>(root: OneOrMany<AbstractDomNode>, target?: HTMLElement): T {
    let items = toDomElements<T>(root, target)
    if (items.length > 0)
        return items[0]
    return [''] as any
}

function mountStatefulComponent(statefulNode: AbstractDomNodeWithState, target?: HTMLElement) {
    let state = statefulNode.basedOn instanceof AbstractReadableState
        ? statefulNode.basedOn
        : new DOMState(statefulNode.basedOn)
    let abstractElt = statefulNode.stateMapping(state)
    let instance = renderToDom(abstractElt, target ?? document.body, true)
    state.subscribe(() => {
        instance.update(statefulNode.stateMapping(state))
    })
    return instance
}

function abstractDomElementToDomElements<T extends Node|Text>(root: AbstractDomElement|AbstractDomNodeWithState, target?: HTMLElement): T[] {
    let domDocument = (target?.ownerDocument ?? document)
    let results: T[] = []
    if (root instanceof AbstractDomNodeWithState) {
        return [mountStatefulComponent(root, target).$$domElement as T]
    }
    else if (root.tag instanceof AbstractDomNodeWithState) {
        return [mountStatefulComponent(root.tag, target).$$domElement as T]
    }
    else if (isFunc(root.tag)) {
        return toDomElements<T>(toArray((root.tag as AbstractFuncComponent)(root.props, root.children)))
    }

    const result = domDocument.createElement(root.tag) as HTMLElement
    for (const k in root.props) {
        if (k == '__source') continue
        const val = root.props[k]
        if (k === 'style' && typeof (val) === 'object') {
            for (const sk of Object.keys(val)) {
                const sv = val[sk]
                if (sv != null)
                    result.style[sk as any] = sv;
            }
        } else if (isFunc(val) && k.indexOf('on') == 0) {
            result.addEventListener(k.substr(2, k.length - 2).toLowerCase(), val)
        }
        // binding expressions:
        else if (val instanceof ValueBinding) {
            let stateVal = val.get(val.state.get())
            let bindingEL = e => val.set(val.state, e.target.type == 'checkbox' ? e.target.checked : e.target.value)
            if (k == 'checked') {
                if (stateVal)
                    result.setAttribute(k, k)
            } else if (k == 'value')
                if (result.tagName == 'TEXTAREA')
                    (result as any).value = stateVal
                else result.setAttribute(k, stateVal)
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
        else if (k == 'value' && result.tagName == 'TEXTAREA') {
            (result as any).value = val
        }
        else
            result.setAttribute(k, val)
    }

    if (root.children != null && root.children.length > 0 && result.tagName != 'TEXTAREA') {
        result.append(...toDomElements(root.children, result))
    }
    results.push(result as any as T)

    return results
}

interface DomElementInstance {
    $$virElement: AbstractDomElement
    $$domElement: Node
    update(newElt: AbstractDomNode): void
    newProps(attrs: any): void
}

export function renderToDom(elt: AbstractDomElement, target: HTMLElement, defer = false): DomElementInstance {
    const domElt = toDomElement(elt, target)
    if (!defer)
        target.append(domElt)
    return {
        $$virElement: elt,
        $$domElement: domElt,
        update(newElt: AbstractDomElement) {
            this.$$virElement = newElt
            const newDomElement = toDomElement(this.$$virElement, target)
            const patcher = (dest: any, src: any) =>  dd.apply(dest, dd.diff(dest, src))
            let success = patcher(this.$$domElement, newDomElement)
            if (!success) {
                console.warn('vdtree: Diff couldn\'t be efficiently applied');
                this.$$domElement.parentNode!.replaceChild(newDomElement, this.$$domElement)
                this.$$domElement = newDomElement
            }
        },
        newProps(props: Dict<any>|((prev: Dict<any>) => Dict<any>)) {
            if (typeof props == 'function')
                this.$$virElement.props = props(this.$$virElement.props)
            else
                this.$$virElement.props = props
            this.update(this.$$virElement)
        }
    }
}

export class DOMState<T = any> extends AbstractWritableState<T> {
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
            return ''
        let subscription = randomHash()
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