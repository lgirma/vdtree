import {
    AbstractDomElement,
    AbstractDomNode,
    AbstractFuncComponent,
    DomElementChildren,
    DomElementChildrenFrom
} from "../AbstractDOM";
import {isFunc, OneOrMany, toArray, kebabToCamelCase, uuid} from "boost-web-core";
import {AbstractDomNodeWithState, AbstractWritableState, StateSubscription, ValueBinding} from "../AbstractState";

const styleToObject = (style: string): any => style.split(';').filter(s => s.length)
    .reduce((a, b) => {
        const keyValue = b.split(':');
        a[kebabToCamelCase(keyValue[0]).trim()] = keyValue[1].trim();
        return a;
    }, {} as any);

export function toReactComponent<TElement = JSX.Element, TProps = any>(item: AbstractDomNode, React: any): (props: TProps) => TElement {
    const {createElement, Fragment} = React

    if (typeof item == 'string' || typeof item == 'number' || typeof item == 'boolean' || typeof item == 'bigint') {
        return () => createElement('span', null, item)
    }
    else if (item instanceof AbstractDomNodeWithState) {
        return toStatefulComponent(item, React)
    }
    else if (item.tag instanceof AbstractDomNodeWithState) {
        return toStatefulComponent(item.tag, React)
    }
    else if (isFunc(item)) {
        // AFC
        return (props) => toReactElement((item as any)(props), React)
    }
    else {
        return () => toReactElement(item, React)
    }
}

export function toReactElement<TElement = JSX.Element>(root: OneOrMany<AbstractDomNode>, React: any): TElement {
    const {Fragment, createElement} = React
    let result = toReactElements(root, React)
    if (result.length > 1)
        return createElement(Fragment, null, ...result)
    else if (result.length == 1)
        return result[0] as any
    console.warn('Cannot render empty React element', root)
    return createElement('span')
}

function toStatefulComponent<TElement = JSX.Element>(comp: AbstractDomNodeWithState, React: any) {
    const {useState} = React
    return function (props) {
        const hook = useState(comp.basedOn)
        const stateWrapper = new ReactHooksState(hook)
        let virDomTree = comp.stateMapping(stateWrapper)
        return toReactElement<TElement>(virDomTree, React)
    }
}

export function toReactElements<TElement = JSX.Element>(root: OneOrMany<AbstractDomNode>, React: any): TElement[] {
    const {createElement} = React
    let reactElements: any[] = []
    let roots = toArray(root)

    for (const item of roots) {
        if (typeof item == 'string' || typeof item == 'number' || typeof item == 'boolean' || typeof item == 'bigint') {
            reactElements.push(item)
        }
        else if (item instanceof AbstractDomNodeWithState) {
            reactElements.push(createElement(toStatefulComponent(item, React)))
        }
        else if (item.tag instanceof AbstractDomNodeWithState) {
            reactElements.push(createElement(toStatefulComponent(item.tag, React), item.props, item.children))
        }
        else if (isFunc(item.tag)) {
            let rendered = (item.tag as any)(item.props ?? {})
            if (rendered.type === undefined)
                reactElements.push(toReactElements(rendered, React))
            else
                reactElements.push(createElement(item.tag, item.props, item.children))
        }
        else if (item.tag?.prototype instanceof React.Component) {
            reactElements.push(createElement(item.tag, item.props, item.children))
        }
        else if (typeof item.tag == 'string') {
            let reactAttrs = htmlAttrsToReactAttrs({...item.props})
            let elt = item.tag == 'textarea'
                ? createElement(item.tag, {...reactAttrs, defaultValue: item.children})
                : createElement(item.tag, reactAttrs, ...toReactElements(item.children, React))
            reactElements.push(elt)
        }
        else {
            console.error('vdtree: Unable to convert element to React element', item)
        }
    }

    return reactElements
}

function htmlAttrsToReactAttrs(htmlAttrs: any) {
    let result: any = {}
    for (const k of Object.keys(htmlAttrs)) {
        const v = htmlAttrs[k]
        if (k === 'class') result.className = v
        // binding expressions:
        else if (v instanceof ValueBinding) {
            let stateVal = v.get(v.state.get())
            let bindingEL = e => v.set(v.state, e.target.type == 'checkbox' ? e.target.checked : e.target.value)
            if (k == 'checked') {
                result.checked = !!stateVal
            }
            else if (k == 'value') {
                result.value = stateVal
            }
            else {
                result[k] = stateVal
                console.warn('vdiff: Binding to non-value attribute ' + k)
            }
            result.onChange = bindingEL
        }
        else if (k == 'style' && typeof v == 'string') {
            result.style = styleToObject(v)
        }
        else if (k == 'for') result.htmlFor = v
        else if (k == 'value') result.defaultValue = v
        else if (k == 'checked') result.defaultChecked = v
        // Events:
        else if (typeof(v) == 'function' && k.length > 3) {
            result[`on${k[2].toUpperCase()}${k.slice(3)}`] = v
        }
        else result[k] = v
    }
    return result
}

export class ReactHooksState<T> extends AbstractWritableState<T> {
    $$hook: [T, Function]
    $$subscriptions = {}

    bind(expr: ((state: T) => any) | undefined, setter: ((state: AbstractWritableState<T>, newValue: any) => void) | undefined): ValueBinding<T> {
        return new ValueBinding<T>(this, expr, setter)
    }

    get(): T { return this.$$hook[0] }

    mutate(reducer: (prev: T) => void): void {
        let newState = {...this.$$hook[0]}
        reducer(newState)
        this.update(p => newState)
    }

    set(newVal: T): void {
        this.update(v => newVal)
    }

    subscribe(subscriber: any) {
        if (subscriber == null || !isFunc(subscriber))
            return
        let subscription = uuid()
        this.$$subscriptions[subscription] = subscriber
        return subscription
    }

    unsubscribe(s: StateSubscription) {
    }

    update(reducer: (prev: T) => T): void {
        this.$$hook[1](reducer)
    }

    constructor(hooksState) {
        super();
        this.$$hook = hooksState
    }

}