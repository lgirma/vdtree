import {isFunc, OneOrMany, toArray} from "boost-web-core";
import {AbstractDomElement, AbstractDomNode, evalLazyElement} from "./AbstractDOM";

export function iterateOver(roots: OneOrMany<AbstractDomNode>, evalLazyElements = false): AbstractDomNode[] {
    roots = toArray(roots)
    let result = [] as AbstractDomNode[]
    for (const root of roots) {
        if (isFunc((root as AbstractDomElement).tag) && evalLazyElements) {
            result.push(...evalLazyElement(root as AbstractDomElement))
        }
        else
            result.push(root)
    }

    return result
}