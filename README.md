# vdtree

Virtual DOM tree utility.

* Create abstract components 
* Render them to HTML/JS or React or SSR, etc.
* Small < 1 kb

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

Create a virtual `<div />` using:

```typescript
import {vd} from 'vdtree'

const comp = vd('div')
```

To create an `<img>`:

```typescript
const comp = vd('img', {class: 'active', src: './image.jpg'})
```

To more complicated virtual dom tree:

```typescript
const comp = vd('p', {class: 'para'}, [
    vd('i', {class: 'fas fa-eye'}),
    'Looking in',
    vd('a', {href: 'http://link.com/eyes'}, 'here')
])
```

which is an equivalent of:

```html
<p class="para">
    <i class="fas fa-eye" />
    Looking in <a href="http://link.com/eyes">here</a>
</p>
```

## Event Handlers

You can use event handlers as you would using the JS DOM APIs

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

## Rendering to Actual DOM

To render static abstract DOM into an actual DOM in the browser,

```typescript
import {toHtmlDom, vd} from 'vdtree'

const abstractElt = vd('div', {}, 'Hello, World!')
document.appendChild(toHtmlDom(abstractElt))
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