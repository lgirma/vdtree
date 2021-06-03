import {AbstractDomElement} from "./AbstractDOM";
import {BOOL_ATTRS} from "./Common";


export function toHtmlString(root: AbstractDomElement): string {
    let result = `<${root.tag}`
    for (const k in root.attrs) {
        const val = root.attrs[k]
        if (k === 'style' && typeof(val) === 'object') {
            for (const [sk, sv] of val) {
                if (sv != null)
                    result += ` ${sk}="${sv}"`
            }
        }
        else if (BOOL_ATTRS.indexOf(k) > -1) {
            if (val) result += ` ${k}`
        }
        result += ` ${k}="${val}"`
    }
    result += ">"

    for (const child of root.children) {
        if (child != null) {
            if (typeof child === 'string')
                result += child
            else {
                result += toHtmlString(child)
            }
        }
    }

    result += `</${root.tag}>`

    return result;
}