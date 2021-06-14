import {AbstractDomElement, AbstractDomNode, evalLazyElement} from "./AbstractDOM";
import {BOOL_ATTRS, VOID_ELEMENTS} from "./Common";
import {OneOrMany, toArray, camelToKebabCase, isFunc, isEmpty, uuid} from "boost-web-core";
import {
    AbstractDomNodeWithState,
    AbstractReadableState,
    AbstractWritableState,
    StateSubscription, ValueBinding
} from "./AbstractState";

let eventHandlerCount = 0

function renderStatefulComponent(basedOn, stateMapping) {
    let state = basedOn instanceof AbstractReadableState
        ? basedOn
        : new SSRState(basedOn)
    let abstractElt = stateMapping(state)
    return evaluatedDomElementToHtml(abstractElt)
}

export function toHtmlString(roots: OneOrMany<AbstractDomNode>): string {
    const rootElements = toArray(roots)
    let html = ''
    let js = ''
    let css = ''
    for (const root of rootElements) {
        if (typeof root == "string" || typeof root === 'bigint' || typeof root === 'number' || typeof root == 'boolean') {
            html += `${root}`
            continue
        }
        let rootEvaluated = evalLazyElement(root)
        rootEvaluated.forEach(re => {
            if (typeof re == 'string' || typeof re === 'bigint' || typeof re === 'number' || typeof re == 'boolean')
                html += `${re}`
            else if (re.tag instanceof AbstractDomNodeWithState) {
                let output = renderStatefulComponent(re.tag.basedOn, re.tag.stateMapping)
                html += output.html
                css += output.css
                js += output.js
            }
            else if (re instanceof AbstractDomNodeWithState) {
                let output = renderStatefulComponent(re.basedOn, re.stateMapping)
                html += output.html
                css += output.css
                js += output.js
            }
            else {
                let output = evaluatedDomElementToHtml(re)
                html += output.html
                css += output.css
                js += output.js
            }
        })
    }
    let result = `${html}`;
    if (css.length > 0)
        result += `<style>${css}</style>`
    if (js.length > 0)
        result += `<script>${js}</script>`
    return result
}

type SSRDomResult = {html?: string, js?: string, css?: string}

function evaluatedDomElementToHtml(root: AbstractDomElement): SSRDomResult {
    let html = `<${root.tag}`
    let js = ''
    let css = ''
    for (const k in root.attrs) {
        const val = root.attrs[k]
        if (k === 'style' && typeof(val) === 'object') {
            html += ' style="'
            for (const sk in val) {
                const sv = val[sk]
                if (sv != null)
                    html += `${camelToKebabCase(sk)}: ${sv};`
            }
            html += '"'
        }
        else if (val instanceof ValueBinding) {
            let stateVal = val.get(val.state.get())
            if (k == 'checked') {
                if (stateVal)
                    html += ' checked="checked"'
            }
            else if (k == 'value')
                html += ` value="${stateVal}"`
            else {
                html += ` k="${stateVal}"`
                console.warn('vdiff: Binding to non-value attribute ' + k)
            }
        }
        else if (isFunc(val) && k.indexOf('on') == 0) {
            const handlerName = `handler_${eventHandlerCount++}`
            html += ` ${k.toLowerCase()}="${handlerName}(event)"`
            js += `\nvar ${handlerName} = ${val.toString()}`
        }
        else if (BOOL_ATTRS.indexOf(k) > -1) {
            if (val) html += ` ${k}`
        }
        else html += ` ${k}="${val}"`
    }
    html += ">"

    // Content and closing tag only if non-void element
    if (VOID_ELEMENTS.indexOf(root.tag) == -1) {
        for (const child of root.children) {
            if (child != null) {
                if (typeof child === 'string' || typeof child === 'bigint' || typeof child === 'number' || typeof child == 'boolean')
                    html += child
                else {
                    let flatChildren = evalLazyElement(child)
                    flatChildren.forEach(c => {
                        if (typeof c === 'string' || typeof c === 'bigint' || typeof c === 'number' || typeof c == 'boolean')
                            html += child
                        else {
                            let output = evaluatedDomElementToHtml(c)
                            html += output.html
                            css += output.css
                            js += output.js
                        }
                    })
                }
            }
        }

        let closingTag = `</${root.tag}>`

        if (root.tag == '!--')
            closingTag = '-->'
        else if (root.tag == '![CDATA[')
            closingTag = ']]>'

        html += closingTag
    }

    return {html, js, css}
}

class SSRState<T> extends AbstractWritableState<T> {
    $$basedOn: T
    get(): T { return this.$$basedOn }
    subscribe(subscriber: any): StateSubscription { return '' }
    unsubscribe(s: StateSubscription) { }
    mutate(reducer: (prev: T) => void): void { }
    bind(expr: ((state: T) => any) | undefined, setter: ((state: AbstractWritableState<T>, newValue: any) => void) | undefined): ValueBinding<T> {
        return undefined as any
    }
    set(newVal: T): void { }
    update(reducer: (prev: T) => T): void { }

    constructor(initialValue: T) {
        super();
        this.$$basedOn = initialValue
    }
}