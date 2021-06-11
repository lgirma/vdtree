import {AbstractDomElement} from "./AbstractDOM";
import {isFunc, OneOrMany, toArray, kebabToCamelCase, uuid} from "boost-web-core";
import {AbstractDomNodeWithState, AbstractWritableState, StateSubscription, ValueBinding} from "./AbstractState";

const styleToObject = (style: string): any => style.split(';').filter(s => s.length)
    .reduce((a, b) => {
        const keyValue = b.split(':');
        a[kebabToCamelCase(keyValue[0]).trim()] = keyValue[1].trim();
        return a;
    }, {} as any);

export function toJsxElement<T extends JSX.Element>(root: OneOrMany<AbstractDomElement>, React: any, key?: any): T {
    const {createElement, Fragment} = React
    let roots = toArray(root)
    if (roots.length > 1) {
        return createElement(Fragment, {}, ...roots.map(r => toJsxElement(r, React, key)))
    }
    root = roots[0]
    if (isFunc(root)) {
        return toReactComponent(root as any, React, key) as any
    }
    else if (root.tag instanceof AbstractDomNodeWithState) {
        return toReactComponent(root as any, React, key) as any
    }
    let attrs: any = {}
    if (key != null) attrs.key = key;
    const rootAttrs = {...root.attrs}
    for (const k of Object.keys(rootAttrs)) {
        const v = rootAttrs[k]
        if (k === 'class') attrs.className = v
        else if (k == 'style' && typeof v == 'string') {
            attrs.style = styleToObject(v)
        }
        else if (k == 'for') attrs.htmlFor = v
        else if (k == 'value') attrs.defaultValue = v
        else if (k == 'checked') attrs.defaultChecked = v
        // Events:
        else if (typeof(v) == 'function' && k.length > 3) {
            attrs[`on${k[2].toUpperCase()}${k.slice(3)}`] = v
        }
        else attrs[k] = v
    }
    if (root.children && root.children.length > 1)
        return createElement(root.tag, attrs,
            ...root.children.map((c) => (typeof (c) === 'string' || c == null) ? c : toJsxElement(c, React)))
    else if (root.children && root.children.length == 1) {
        let c = root.children[0]
        if (root.tag === 'textarea')
            return createElement(root.tag, {...attrs, defaultValue: c})
        else
            return createElement(root.tag, attrs, (typeof(c) === 'string' || c == null) ? c : toJsxElement(c, React))
    }
    else
        return createElement(root.tag, attrs)
}

export function toReactComponent<TProps, T extends JSX.Element>(
    vdComponent: AbstractDomElement | ((props: TProps) => AbstractDomElement), React: any, key?: any): ((props: TProps) => T) {
    if ((vdComponent as AbstractDomElement).tag instanceof AbstractDomNodeWithState) {
        return function () {
            const hook = React.useState(vdComponent.tag.initialState)
            const stateWrapper = new ReactHooksState(hook)
            let virDomTree = vdComponent.tag.stateMapping(stateWrapper)
            return toJsxElement(virDomTree, React, key)
        }
    }
    else if (typeof(vdComponent) == 'function')
        return (props: TProps) => toJsxElement<T>((vdComponent as any)(props), React, key)
    return () => toJsxElement(vdComponent as any, React, key)
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