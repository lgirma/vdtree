import {BOOL_ATTRS} from "./Common";
import {AbstractDomElement} from "./AbstractDOM";
import {isFunc} from "boost-web-core";
/*// @ts-ignore
import {DiffDOM} from "diff-dom";
const dd = new DiffDOM({valueDiffing: false});*/


export function toDom<T extends HTMLElement>(root: AbstractDomElement, domDocument?: HTMLDocument): T {
    const result = (domDocument ?? document).createElement(root.tag) as HTMLElement
    for (const k in root.attrs) {
        const val = root.attrs[k]
        if (k === 'style' && typeof(val) === 'object') {
            for (const sk in Object.keys(val)) {
                const sv = val[sk]
                if (sv != null)
                    result.style.setProperty(sk, `${sv}`);
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
    for (const child of root.children) {
        if (child != null) {
            if (typeof child === 'string')
                result.append(child)
            else {
                result.appendChild(toDom(child, domDocument))
            }
        }
    }

    return result as T;
}