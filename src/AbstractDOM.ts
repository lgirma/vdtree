import {isFunc, Nullable, OneOrMany, toArray} from "boost-web-core";
import {AbstractDomNodeWithState} from "./AbstractState";

export type PrimitiveType = string|bigint|number|boolean

export type AbstractDomNode = AbstractDomElement|PrimitiveType|AbstractDomNodeWithState

export type DomElementChildren = AbstractDomNode[]

export type DomElementChildrenFrom = Nullable<AbstractDomNode>|Nullable<AbstractDomNode>[]

export interface AbstractDomElement<TagType extends PrimitiveComponent|AbstractFuncComponent|CustomComponent = any> {
    tag: TagType
    props: {[p: string]: any}
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
    const elt: AbstractDomElement = {tag, props: {}, children: []}
    attrs ??= {}
    for (const k in attrs) {
        if (attrs[k] != undefined)
            elt.props[k] = attrs[k]
    }

    for (const child of (children ?? [])) {
        if (child == null) continue
        if (Array.isArray(child)) {
            let key = 0
            for (const c of child) {
                if (c == null) continue
                if (c instanceof AbstractDomNodeWithState)
                    c.key = `${key++}`
                else if ((c as AbstractDomElement).props) {
                    let domElt = c as AbstractDomElement
                    key++
                    if (!domElt.props.key)
                        domElt.props.key = `${key}`
                    if (!domElt.props.id)
                        console.warn('vdtree: No id given for elements in a map/array in ', elt)
                }
                elt.children.push(c)
            }
        }
        else
            elt.children.push(child)
    }
    return elt
}