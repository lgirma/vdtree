import {AbstractDomElement, AbstractDomNode, AbstractFuncComponent, evalLazyElement} from "./AbstractDOM";
import {BOOL_ATTRS, VOID_ELEMENTS} from "./Common";
import {OneOrMany, toArray, camelToKebabCase, isFunc, isEmpty, uuid} from "boost-web-core";
import {
    AbstractDomNodeWithState,
    AbstractReadableState,
    AbstractWritableState,
    StateSubscription, ValueBinding
} from "./AbstractState";

let eventHandlerCount = 0
let stateCount = 0

function renderStatefulComponent(statefulComponent: AbstractDomNodeWithState) {
    let state = statefulComponent.basedOn instanceof AbstractReadableState
        ? statefulComponent.basedOn
        : new SSRState(statefulComponent.basedOn)
    let abstractElt = statefulComponent.stateMapping(state)
    return evaluatedDomElementToHtml(abstractElt)
}

type SSRDomResult = {html: string, js: string, css: string}

function append(to: SSRDomResult, val: SSRDomResult) {
    to.html += val.html
    to.js += `${val.js}`
    to.css += `${val.css}`
}

export function toHtmlString(roots: OneOrMany<AbstractDomNode>): string {
    const output = renderDomNodes(roots)
    let result = `${output.html}`;
    if (output.css.length > 0)
        result += `<style>${output.css}</style>`
    if (output.js.length > 0)
        result += `<script>${output.js}</script>`
    return result
}

export function renderDomNodes(roots: OneOrMany<AbstractDomNode>): SSRDomResult {
    let result: SSRDomResult = {html: '', css: '', js: ''}
    const rootElements = toArray(roots)
    for (const root of rootElements) {
        if (root == null)
            continue
        if (typeof root == "string" || typeof root === 'bigint' || typeof root === 'number' || typeof root == 'boolean') {
            result.html += `${root}`
        }
        else if (root instanceof AbstractDomNodeWithState) {
            append(result, renderStatefulComponent(root))
        }
        else if (root.tag instanceof AbstractDomNodeWithState) {
            append(result, renderStatefulComponent(root.tag))
        }
        else if (isFunc(root.tag)) {
            let outputs = toArray((root.tag as AbstractFuncComponent)(root.attrs, root.children))
            outputs.forEach(o => {
                append(result, renderDomNodes(o))
            })
        }
        else {
            append(result, evaluatedDomElementToHtml(root))
        }
    }
    return result
}

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
                    let output = renderDomNodes(child)
                    html += output.html
                    css += output.css
                    js += output.js
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
    $$id: number
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
        this.$$id = ++stateCount
    }
}