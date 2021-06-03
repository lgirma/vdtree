# vdtree

Compile abstract web components to DOM, react, svelte and more

* Create abstract components 
* Bridge for HTML/JS, React, Svelte, SSR, etc.
* Small (~ 1 kb)

## Installation

Install vdtree from npm

```shell
npm i vdtree
```

or

```shell
yarn add vdtree
```

## Getting Started

Use the `vd()` method to create abstract DOM tree.

```typescript
vd(tag, attributes, children)
```

For example, to create a virtual `<div />`

```typescript
import {vd} from 'vdtree'

const comp = vd('div')
```

To create the `<div>` with children,

```typescript
vd('div', {class: 'container'}, [
    vd('div', {}, 'item1'),
    vd('div', {}, 'item2')
])
```

which is an equivalent of:

```html
<div class="container">
    <div>item1</div>
    <div>item2</div>
</div>
```

To create an `<img>`:

```typescript
vd('img', {class: 'active', src: './image.jpg'})
```

which is an equivalent of:

```html
<img class="active" src="./image.jpg">
```

To more complicated virtual dom tree:

```typescript
vd('p', {class: 'card'}, [
    vd('i', {class: 'fas fa-eye'}),
    'Looking in',
    vd('a', {href: 'http://link.com/eyes', style: {color: 'red'}}, 'here')
])
```

which is an equivalent of:

```html
<p class="card">
    <i class="fas fa-eye" />
    Looking in <a href="http://link.com/eyes" style="color:red">here</a>
</p>
```

## Event Handlers

You can use event handlers, as you would, using the JS DOM APIs

```typescript
vd('div', {
    onclick: e => alert('Clicked!')
})

vd('form', { onsubmit: e => e.preventDefault() }, [
    vd('input', {placeholder: 'User name', id: 'userName'}),
    vd('input', {placeholder: 'Password', id: 'password', required: true}),
    vd('input', {type: 'submit', value: 'Login'})
])
```

All valid DOM events can be used. [See](https://developer.mozilla.org/en-US/docs/Web/Events).

## Rendering to Actual DOM

To render static abstract DOM into an actual DOM in the browser,

```typescript
import {toDom, vd} from 'vdtree'

const abstractElt = vd('div', {}, 'Hello, World!')
document.appendChild(toDom(abstractElt))
```

## To React

To render a static virtual DOM tree in a react component,

```typescript jsx
import {toJsxElement} from "vdtree"

const abstractComp = vd('div', {}, 'Hello, World!')
const MyReactComp = (props) => toJsxElement(abstractComp)

ReactDOM.render(<MyReactComp />,
    document.getElementById('app')!)
```

But most of the time, we would want a dynamic content rather than a static one.
In such cases, use `toReactComponent` rather than `toJsxElement`

```typescript
toReactComponent(React.createElement, abstractComp)
```

where the `abstractComp` can be a function that returns an abstract component

A simple greeter example,

```typescript jsx
import {toReactComponent, vd} from 'vdtree'
import React from 'react'
import ReactDOM from 'react-dom'

const AbstractGreeter = ({name = ''}) =>
    vd('div', {class: 'active'}, `Hello, ${name}`)

const ReactGreeter = toReactComponent(React.createElement, AbstractGreeter)

ReactDOM.render(<ReactGreeter name="React"/>, 
    document.getElementById('app')!)
```

## To Server-Side Rendered (SSR) HTML

To get an HTML string from an abstract dom tree,

```typescript jsx
import {toHtmlString} from "vdtree"

const htmlString = toHtmlString(
    vd('div', {}, 'Hello, World')
)
```

## To Svelte Component

