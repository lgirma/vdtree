# vdtree

Compile abstract web components to DOM, react, svelte and more

* Write your web components once; use them in vanilla JS, React, Svelte, SSR, etc.
* Small (~ 1 kb without state, ~ 6 kb for svelte)
* Written in Typescript

## Table of Contents

- [Installation](#installation)
- [Tutorials](#quick-start-tutorials)
    - [Hello World](#hello-world)
    - [Greeter](#greeter)
- [Getting Started](#getting-started)
- [Styles](#styles)
- [Event Handlers](#event-handlers)
- [Custom Components](#custom-components)
- [Rendering to the Browser DOM](#rendering-to-the-browser-dom)
- [React](#react)
- [SSR](#to-server-side-rendered-ssr-html)
- [Svelte](#svelte)
- [State](#state)

## Installation

Install vdtree from npm

```shell
npm i vdtree
```

or

```shell
yarn add vdtree
```

## Quick-Start Tutorials

### Hello World

Let's quickly create a simple abstract DOM tree and render it on the browser

To the abstract DOM tree:

```javascript
import {h} from 'vdtree'

let myDomTree = h('div', {}, 'Hello, World!')
```

or the JSX version:

```jsx
/** @jsx h */
import {h} from 'vdtree'

let myDomTree = <div>Hello, World!</div>
```

Then to render it on the browser DOM:

**Vanilla Javascript**:
```javascript
import {toDomElement} from 'vdtree'
document.body.append(toDomElement(myDomTree))
```

**React**:
```jsx
import {toReactComponent} from 'vdtree'

const MyReactComp = toReactComponent(myDomTree, React)
ReactDOM.render(<MyReactComp />, document.getElementById('app'))
```

**Svelte**:
```jsx
<script>
  import {SvelteComponent} from 'vdtree'
</script>

<SvelteComponent dom={myDomTree} />
```

**SSR**:
```javascript
import {toHtmlString} from 'vdtree'
console.log(
    toHtmlString(myDomTree)
)
```

### Greeter

An abstract greeter component is a pure function that accepts name as a prop and greets with that name.

```javascript
const AbstractGreeter =
        props => h('div', {}, `Hello, ${props.name}`)
```

or in JSX:

```jsx
/** @jsx h */
import {h} from 'vdtree'

const AbstractGreeter =
        props => <div>Hello, {props.name}</div>
```

Then to render it on the browser DOM:

**Vanilla Javascript**:

```javascript
import {toDomElement} from 'vdtree'

document.body.append(toDomElement(
        h(AbstractGreeter, {name: 'Vanilla JS'})
))
```

**React**:
```jsx
import {toReactComponent} from 'vdtree'

const GreeterReact = toReactComponent(AbstractGreeter, React)
ReactDOM.render(<GreeterReact name="React" />, document.getElementById('app')!)
```

**Svelte**:
```jsx
<script>
  import {SvelteComponent} from 'vdtree'
</script>

<SvelteComponent dom={AbstractGreeter} props={{name: 'Svelte'}} />
```

**SSR**:

```javascript
import {toHtmlString} from 'vdtree'

console.log(toHtmlString(
        h(AbstractGreeter, {name: 'SSR'})
))
```

## Getting Started

Use the `h()` method (signifying "hyperscript") to create an abstract DOM tree.

```javascript
h(tag, attributes, children)
```

For example, to create a virtual `<div />`

```javascript
import {h} from 'vdtree'

const comp = h('div')
```

To create the `<div>` with attributes and children,

```javascript
h('div', {class: 'container'}, [
  h('div', {}, 'item1'),
  h('div', {}, 'item2')
])
```

which is an equivalent of:

```html
<div class="container">
    <div>item1</div>
    <div>item2</div>
</div>
```

## Styles

You can pass `style` as a string or as a javascript object

```jsx
<p style="color: red; border-color: green"></p>
```

would be the same as

```javascript
<p style={{color: 'red', borderColor: 'green'}}></p>
```

**Note:** Both will work in React using the `toReactComponent` method. [See 'React' Below](#react)

## Event Handlers

You can use event handlers, as you would, using the JS DOM APIs

```jsx
<div onclick={e => alert('Clicked!')}></div>

<form onsubmit={e => e.preventDefault()}>
  <input placeholder="User name" id="userName" />
  <input type="password" required={true} id="userName" />
  <input type="submit" value="Login" />
</form>
```

All valid DOM events can be used. [See](https://developer.mozilla.org/en-US/docs/Web/Events).

## Custom Components

Lazy evaluated custom components can be used in the abstract DOM.

A simple custom component:

```jsx
const Greeter = ({name = ''}) => <div>Hello, {name}</div>
```

or as a full-blown function:

```jsx
function Greeter({name = ''}) {
    return <div>Hello, {name}</div>
}
```

Custom components can also be included in the virtual DOM tree as:

```jsx
<div>
  Greetings output
  <Greeter name="John" />
  <hr />
</div>
```

## Rendering to the browser DOM

To render static abstract DOM into an actual DOM in the browser,

```jsx
/** @jsx h */
import {toDomElement, h} from 'vdtree'

const abstractElt = <div>Hello, World!</div>
document.body.append(toDomElement(abstractElt))
```

If you want to render multiple root-level elements, use `toDom`

```javascript
import {toDom, h} from 'vdtree'

const abstractElts = [
    <div>Element 1</div>,
    <div>Element 3</div>
]
document.body.append(...toDom(abstractElts))
```

To enable watch and update on the DOM when values change, use `renderToDom()` method

```javascript
// First time render
const watch = renderToDom(
    <Comp prop={propVal} />, targetElement
)

// Anytime you want to re-render the component:
watch.update(
    <Comp prop={newVal} />
)

// To update only attributes:
watch.newAttrs(newAttrs)
//or
watch.newAttrs(prev => ({...prev, someProp: newVal}))
```

Rather than doing a complete replacement, it will patch the changes efficiently.

## React

To render a static virtual DOM tree in a react component, use the `toReactComponent()` method.

```jsx
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {toReactComponent} from "vdtree"

const abstractComp = h('div', {}, 'Hello, World!')
const MyReactComp = toReactComponent(abstractComp, React)

ReactDOM.render(<MyReactComp/>,
        document.getElementById('app'))
```

Note that we had to pass `React` object as the second argument for `toReactComponent()` method.

A simple greeter example,

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import {toReactComponent, h} from 'vdtree'

const AbstractGreeter = ({name = ''}) =>
    h('div', {class: 'active'}, `Hello, ${name}`)

const ReactGreeter = toReactComponent(AbstractGreeter, React)

ReactDOM.render(<ReactGreeter name="React"/>, 
    document.getElementById('app'))
```

You can also include abstract components in React components

```jsx
const AbstractCounterInfo = ({count = 0}) => h('div', {}, `${count}`)

const CounterInfo = toReactComponent(AbstractCounterInfo, React)

function ReactCounter({startWith = 0}) {
  const [c, setC] = useState(startWith)
  return <div>
    <CounterInfo count={c}/>
    <button onClick={e => setC(prev => prev + 1)}>+</button>
  </div>
}

ReactDOM.render(<ReactCounter startWith={3}/>, document.getElementById('app'))
```

The opposite is also possible. That is, including React components in abstract components

```jsx
import {Button} from "@chakra-ui/react"

h('div', {}, [
  h(Button, {colorScheme: 'blue'}, 'Click Me')
])
```

## To Server-Side Rendered (SSR) HTML

To get an HTML string from an abstract dom tree,

```jsx
import {toHtmlString} from "vdtree"

const htmlString = toHtmlString(
    <div>Hello, World!</div>
)
```

Multiple top-level elements can also be used as

```javascript
toHtmlString([
  h('div', {}, 'Item 1'),
  h('div', {}, 'Item 2'),
])
```

which will output:

```html
<div>Item 1</div>
<div>Item 2</div>
```

## Svelte

You can use the abstract DOM in a svelte component using `SvelteComponent` import

```jsx
<script>
  import {h, SvelteComponent} from 'vdtree'

  let myDom = h('div', {}, 'Content')
</script>

<SvelteComponent dom={myDom}/>
```

You can also use an abstract component inside the svelte component.
A simple counter example:

```jsx
<script>
    let count = 0
    const AbstractCounterInfo = ({c = 1}) => h('div', {}, `${c}`)
</script>

<SvelteComponent dom={AbstractCounterInfo} props={{c: count}} />
<button on:click={e => count = count+1}>+</button>
```

You can also use event handling as

```jsx
<SvelteComponent dom={h('button', {onclick: e => alert('Clicked!')}, 'Click Me')}/>
```

**Note**: The `SvelteComponent` will always create a top-level `<div>` tag.

## State

Use `withState()` method to create an abstract component with internal state.

```jsx
withState(initialStateValue, state => componentTree)
```

Use `state.get()` method to read values and `state.update()` or `state.set()` method to write values. 

An abstract counter component could look like:

```jsx
export const AbstractCounter = withState(0, count =>
    <div>
        <div>{count.get()}</div>
        <button onclick={e => count.update(c => c+1)}>+</button>
    </div>
)
```

And a reset button in the above counter could look like:

```jsx
<button onclick={e => count.set(0)}>Reset</button>
```

Upon rendering the above component

* When targeting Vanilla JS, a built-in state handling will be generated.
* When targeting react, the state will be changed to hooks (`const [count, setCount] = useState(0)`)
* When targeting svelte, a run-time state handling will be generated.
* State is not supported by SSR

Two-way data binding is also supported. Use `myState.bind()` to 

```jsx
export const AbstractGreeter = withState('', name =>
    <div>
        <input value={name.bind()} placeholder="Name" />
        <div>Hello, {name.get()}</div>
    </div>
)

// binding with custom property expression
export const AbstractContact = withState({name: '', email: '', isCompany: false}, state => <div>
    <input value={state.bind(s => s.name)} />
    <input value={state.bind(s => s.email)} type="email" />
    <label>
        <input type="checkbox" checked={state.bind(s => s.isCompany)} /> Is Company
    </label>
</div>
)
```

State mutations are also supported through `mutate()` method:

```javascript
state.mutate(prev => prev.items[1].name = '')
state.mutate(prev => prev.items.push({name: ''}))
```

You can also provide custom two-way binding by providing a getter and setter for the input as 
`state.bind(gettter, setter)`

```jsx
// Assuming initial state is { items: [] }

<input value={state.bind(
    s => s.items.find(i => i.id == 1).name,
    (s, val) => s.mutate(prevState => prevState.items.find(i => i.id == 1).name = val)
)} />
```