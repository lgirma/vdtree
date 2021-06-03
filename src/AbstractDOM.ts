import {Nullable} from "boost-web-core";

export type AbstractDomNode = AbstractDomElement|string

export type DomElementChildren = AbstractDomNode[]

export type DomElementChildrenFrom = Nullable<AbstractDomNode>|Nullable<AbstractDomNode>[]

export interface AbstractDomElement {
    tag: PrimitiveComponent|CustomComponent
    attrs: {[p: string]: any}
    children: DomElementChildren
}

export type CustomComponent = any
export type PrimitiveComponent = keyof HTMLElementTagNameMap

/**
 * Creates an abstract dom elements tree.
 * Example:
 *
 * ```ts
 * vd('p', {}, [
 *      "Here is a",
 *      vd("a", { href:"http://www.google.com/" }, "link"),
 *      "."
 * ]);
 * ```
 *
 * Results:
 *
 * ```html
 * <p>Here is a <a href="http://www.google.com/">link</a>.</p>
 * ```
 */
export function vd(tag: PrimitiveComponent|CustomComponent,
                   attrs:{[key: string]: any} = {},
                   children: DomElementChildrenFrom = null) : AbstractDomElement {
    const elt: AbstractDomElement = {tag, attrs: {}, children: []}
    attrs ??= {}
    for (const k in attrs) {
        if (attrs[k] != undefined)
            elt.attrs[k] = attrs[k]
    }

    if (children != null) {
        if (typeof children === 'string')
            elt.children.push(children)
        else if (Array.isArray(children)) {
            children.forEach(c => {
                if (c != null) elt.children.push(c)
            })
        } else {
            elt.children.push(children as AbstractDomElement)
        }
    }
    return elt
}