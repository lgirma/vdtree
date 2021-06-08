import {AbstractDomElement, AbstractDomNode, evalLazyElement} from "./AbstractDOM";
import {BOOL_ATTRS, VOID_ELEMENTS} from "./Common";
import {OneOrMany, toArray, camelToKebabCase} from "boost-web-core";

export function toHtmlString(roots: OneOrMany<AbstractDomNode>): string {
    const rootElements = toArray(roots)
    let result = ''
    for (const root of rootElements) {
        if (typeof root == "string") {
            result += root
            continue
        }
        let rootEvaluated = evalLazyElement(root)
        rootEvaluated.forEach(re => {
            if (typeof re == 'string')
                result += re
            else
                result += evaluatedDomElementToHtml(re)
        })
    }
    return result;
}

function evaluatedDomElementToHtml(root: AbstractDomElement): string {
    let result = `<${root.tag}`
    for (const k in root.attrs) {
        const val = root.attrs[k]
        if (k === 'style' && typeof(val) === 'object') {
            result += ' style="'
            for (const sk in val) {
                const sv = val[sk]
                if (sv != null)
                    result += `${camelToKebabCase(sk)}: ${sv};`
            }
            result += '"'
        }
        else if (BOOL_ATTRS.indexOf(k) > -1) {
            if (val) result += ` ${k}`
        }
        else result += ` ${k}="${val}"`
    }
    result += ">"

    // Content and closing tag only if non-void element
    if (VOID_ELEMENTS.indexOf(root.tag) == -1) {
        for (const child of root.children) {
            if (child != null) {
                if (typeof child === 'string')
                    result += child
                else {
                    result += toHtmlString(child)
                }
            }
        }

        let closingTag = `</${root.tag}>`

        if (root.tag == '!--')
            closingTag = '-->'
        else if (root.tag == '![CDATA[')
            closingTag = ']]>'

        result += closingTag
    }

    return result
}