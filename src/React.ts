import {AbstractDomElement} from "./AbstractDOM";
import {isFunc, OneOrMany, toArray} from "boost-web-core";

const camelize = (str: string): string =>  str.replace(/-([a-z])/gi,(s, group) =>  group.toUpperCase());
const styleToObject = (style: string): any => style.split(';').filter(s => s.length)
    .reduce((a, b) => {
        const keyValue = b.split(':');
        a[camelize(keyValue[0]).trim()] = keyValue[1].trim();
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
        return toReactComponent(root as any, React, key) as any as T
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

export function toReactComponent<TProps, T extends JSX.Element>(vdComponent: AbstractDomElement | ((props: TProps) => AbstractDomElement), React: any, key?: any): ((props: TProps) => T) {
    if (isFunc(vdComponent))
        return (props: TProps) => toJsxElement<T>((vdComponent as any)(props), React, key)
    return () => toJsxElement(vdComponent as any, React, key)
}