import {isFunc, Nullable, OneOrMany, toArray} from "boost-web-core";
import {AbstractDomNodeWithState} from "./AbstractState";

export type PrimitiveType = string|bigint|number|boolean

export type AbstractDomNode = AbstractDomElement|PrimitiveType|AbstractDomNodeWithState

export type DomElementChildren = AbstractDomNode[]

export type DomElementChildrenFrom = Nullable<AbstractDomNode>|Nullable<AbstractDomNode>[]

export interface AbstractDomElement<TagType extends PrimitiveComponent|AbstractFuncComponent|CustomComponent = any> {
    tag: TagType
    attrs: {[p: string]: any}
    children: DomElementChildren
}

export type AbstractFuncComponent<TProps = any> = (props: TProps, children?: any) => OneOrMany<AbstractDomNode>

export type CustomComponent = any
export type PrimitiveComponent = keyof HTMLElementTagNameMap

/**
 * Creates an abstract dom elements tree.
 * Can be used as a JSX factory.
 */
export function h(tag: PrimitiveComponent|AbstractFuncComponent|CustomComponent,
                  attrs:{[key: string]: any} = {},
                  ...children: DomElementChildrenFrom[]) : AbstractDomElement {
    const elt: AbstractDomElement = {tag, attrs: {}, children: []}
    attrs ??= {}
    for (const k in attrs) {
        if (attrs[k] != undefined)
            elt.attrs[k] = attrs[k]
    }

    let flattenedChildren = [].concat.apply([], children as any)
    flattenedChildren = flattenedChildren.filter(c => c != null)
    if (flattenedChildren != null) {
        flattenedChildren.forEach(c => {
            if (c != null) elt.children.push(c)
        })
    }
    return elt
}

export function evalLazyElement(comp: AbstractDomElement): AbstractDomNode[] {
    if (isFunc(comp.tag)) {
        return toArray((comp.tag as AbstractFuncComponent)(comp.attrs, comp.children))
    }
    return [comp]
}