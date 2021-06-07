import {AbstractDomElement} from "./AbstractDOM";

export function toJsxElement<T extends JSX.Element>(root: AbstractDomElement, React: any, key?: any): T {
    const {createElement, Fragment} = React
    let attrs: any = {}
    if (key != null) attrs.key = key;
    const rootAttrs = {...root.attrs}
    for (const k of Object.keys(rootAttrs)) {
        const v = rootAttrs[k]
        if (k === 'class') attrs.className = v
        //else if (k == 'style') attrs.style = v
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

export function toReactComponent<TProps, T extends JSX.Element>(vdComponent: (props: TProps) => AbstractDomElement, React: any, key?: any): ((props: TProps) => T) {
    return (props: TProps) => toJsxElement<T>(vdComponent(props), React, key)
}