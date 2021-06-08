import {BOOL_ATTRS} from "./Common";
import {
    AbstractDomElement,
    AbstractDomNode,
    evalLazyElement, vd
} from "./AbstractDOM";
import {Dict, isArray, isFunc, Nullable, OneOrMany, toArray} from "boost-web-core";
// @ts-ignore
import {DiffDOM} from "diff-dom";
const dd = new DiffDOM({valueDiffing: false});

export function toDom<T extends Node>(root: OneOrMany<AbstractDomNode>, domDocument?: HTMLDocument): T[] {
    let result: T[] = []
    const roots = toArray(root)
    for (const item of roots) {
        if (typeof item == 'string') {
            result.push(item as any as T)
            continue
        }
        result.push(...toHtmlElement(item, domDocument) as T[])
    }
    return result
}

export function toDomElement<T extends Node>(root: OneOrMany<AbstractDomNode>, domDocument?: HTMLDocument): T {
    let items = toDom<T>(root, domDocument)
    if (items.length > 0)
        return items[0]
    return [''] as any
}

function toHtmlElement<T extends Node>(_root: AbstractDomElement, domDocument?: HTMLDocument): T[] {
    let evalRoot = evalLazyElement(_root)
    let results: T[] = []
    for (const i of evalRoot) {
        if (typeof i == 'string') {
            results.push(i as any)
            continue
        }
        const result = (domDocument ?? document).createElement(i.tag) as HTMLElement
        for (const k in i.attrs) {
            const val = i.attrs[k]
            if (k === 'style' && typeof(val) === 'object') {
                for (const sk of Object.keys(val)) {
                    const sv = val[sk]
                    if (sv != null)
                        result.style[sk as any] = sv;
                }
            }
            else if (isFunc(val)) {
                result.addEventListener(k.substr(2, k.length - 2), val)
            }
            else if (BOOL_ATTRS.indexOf(k) > -1) {
                if (val) result.setAttribute(k, k)
            }
            else
                result.setAttribute(k, val)
        }
        for (const child of i.children) {
            if (child != null) {
                if (typeof child === 'string')
                    result.append(child)
                else {
                    result.append(...toHtmlElement(child, domDocument))
                }
            }
        }
        results.push(result as any as T)
    }

    return results
}

interface DomElementInstance {
    $$element: AbstractDomElement
    update(newElt: AbstractDomElement): void
    newAttrs(attrs: any): void
}

export function renderToDom(elt: AbstractDomElement, target: HTMLElement): DomElementInstance {
    target.append(toDomElement(elt))
    return {
        $$element: elt,
        update(newElt: AbstractDomElement) {
            this.$$element = newElt
            const newDomElement = toDomElement(this.$$element, target.ownerDocument)
            const patcher = (dest: any, src: any) => dd.apply(dest, dd.diff(dest, src))
            let success = patcher(target.firstChild!, newDomElement)
            if (!success) {
                console.warn('Diff couldn\'t be efficiently applied');
                target.innerHTML = ''
                target.append(newDomElement)
            }
        },
        newAttrs(attrs: Dict<any>|((prev: Dict<any>) => Dict<any>)) {
            if (typeof attrs == 'function')
                this.$$element.attrs = attrs(this.$$element.attrs)
            else
                this.$$element.attrs = attrs
            this.update(this.$$element)
        }
    }
}