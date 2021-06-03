import {isFunc, Nullable, OneOrMany, toArray} from "boost-web-core";

export type AbstractDomNode = AbstractDomElement|string

export type DomElementChildren = AbstractDomNode[]

export type DomElementChildrenFrom = Nullable<AbstractDomNode>|Nullable<AbstractDomNode>[]

export interface AbstractDomElement<TagType extends PrimitiveComponent|AbstractDomComponent|CustomComponent = any> {
    tag: TagType
    attrs: {[p: string]: any}
    children: DomElementChildren
}

export type AbstractDomComponent<TProps = any> = (props: TProps, children?: any) => OneOrMany<AbstractDomNode>

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
export function vd(tag: PrimitiveComponent|AbstractDomComponent|CustomComponent,
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

export function evalLazyElement(comp: AbstractDomElement): AbstractDomNode[] {
    if (isFunc(comp.tag)) {
        return toArray((comp.tag as AbstractDomComponent)(comp.attrs, comp.children))
    }
    return [comp]
}