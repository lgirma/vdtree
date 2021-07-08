# vdtree

Write your components once; Use them in vanilla JS, React, Svelte, SSR and more

Why `vdtree`?

* You want to build a web component library targeting various frameworks
* JSX support
* Translate states to target framework
* Strong types (made using Typescript)

## Table of Contents

- [Installation](#installation)
- [Tutorials](#quick-start-tutorials)
    - [Hello World](#hello-world)
    - [Greeter](#greeter)
    - [Counter](#counter)
- [Getting Started](#getting-started)
    - [Styles](#styles)
    - [Event Handlers](#event-handlers)
    - [Components With Props](#components-with-props)
    - [State](#state)
- Compile to Various Frameworks
    - [Rendering to the Browser DOM](#rendering-to-the-browser-dom)
    - [React](#react)
    - [SSR](#server-side-rendered-ssr-html)
    - [Svelte](#svelte)
- [License](#license)

## Installation

Install vdtree from npm

```shell
npm i vdtree
```

or

```shell
yarn add vdtree
```

**Typescript Note**: Typescript currently has issues with `.tsx` templates with `vdtree`. 
You should put your jsx templates in `.jsx` files to skip type checking.

## Quick-Start Tutorials

### Hello World

Let's quickly create a simple abstract DOM tree and render it on the browser

To create the abstract DOM tree using JSX:

```jsx
/** @jsx h */
import {h} from 'vdtree'

let HelloWorld = <div>Hello, World!</div>
```

or the non-JSX version:

```javascript
import {h} from 'vdtree'

let HelloWorld = h('div', {}, 'Hello, World!')
```

Then targeting various frameworks:

**Vanilla Javascript (no framework)**:
```javascript
import {renderToDom} from 'vdtree-dom'
renderToDom(HelloWorld, document.body)
```

**React**:
```jsx
import {ReactWrapper} from 'vdtree-react'
ReactDOM.render(<ReactWrapper dom={HelloWorld}/>, document.body)
```

**Svelte**:
```jsx
<script>
    import {SvelteWrapper} from 'vdtree-svelte'
</script>

<SvelteWrapper dom={HelloWorld}/>
```

Check out [vdtree-plugins](https://github.com/lgirma/vdtree-plugins) repository for various framework targets.

### Greeter

An abstract greeter component is a pure function that accepts name as a prop and greets with that name.

```jsx
/** @jsx h */
import {h} from 'vdtree'

const AbstractGreeter =
    props => <div>Hello, {props.name}</div>
```

or in non-JSX:

```javascript
const AbstractGreeter =
    props => h('div', {}, `Hello, ${props.name}`)
```

Then to render that component,

```jsx
// Vanilla JS:
renderToDom(<AbstractGreeter name="Vanilla-JS" />, document.body)

// React:
<ReactWrapper dom={AbstractGreeter} props={{name: 'React'}} />

// Svelte:
<SvelteWrapper dom={AbstractGreeter} props={{name: 'React'}} />
```

### Counter

An abstract counter component using `withState(initialState, state => components)` method:

```jsx
/** @jsx h */
import {h, withState} from 'vdtree'

const Counter = withState(0, count =>
    <div>
        <div>{count.get()}</div>
        <button onclick={e => count.update(c => c + 1)}>+</button>
    </div>)
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

You can mix vanilla events style and react style event handler names:

```jsx
// Both are valid
onclick={...}
onClick={...}
```

## Components With Props

Lazy evaluated components can be used in the abstract DOM.

A simple component with props:

```jsx
const Greeter =
    ({name = ''}) => <div>Hello, {name}</div>
```

or as a full-blown function:

```jsx
function Greeter({name = ''}) {
    return <div>Hello, {name}</div>
}
```

Such components can also be included in the virtual DOM tree as:

```jsx
<div>
    Greetings output
    <Greeter name="John" />
    <hr />
</div>
```

## State

Use `withState()` method to create an abstract component with internal state.

```jsx
withState(initialStateValue, state => componentTree)
```

Use

* `state.get()` method to read values
* `state.update(s => newState)` to update state
* `state.set(newState)` method to write values.
* `state.mutate(s => mutation)` to mutate big state trees.
* `state.bind()` to utilize two-way binding in input elements.

An abstract counter component could look like:

```jsx
export const AbstractCounter = withState(0, count =>
    <div>
        <div>{count.get()}</div>
        <button onclick={e => count.update(c => c + 1)}>+</button>
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

Two-way data binding is also supported. Use `myState.bind()` as

```jsx
export const AbstractGreeter = withState('', name =>
    <div>
        <input value={name.bind()} placeholder="Name" />
        <div>Hello, {name.get()}</div>
    </div>
)

// binding with custom property expression
const initialState = {name: '', email: '', isCompany: false}
export const AbstractContact = withState(initialState, state =>
    <div>
        <input value={state.bind(s => s.name)} />
        <input value={state.bind(s => s.email)} type="email" />
        <label>
            <input type="checkbox" checked={state.bind(s => s.isCompany)} /> Is Company
        </label>
    </div>
)
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

State mutations are also supported through `mutate()` method.
This can be useful when the state tree is big and mutation would rather be easier.

```javascript
state.mutate(prev => prev.items[1].name = '')
state.mutate(prev => prev.items.push({name: ''}))
```

You can also derive a read-only state from another one:

```jsx
// a, b, c and d are derived from the state of coefficients {c1, c2, c3}
const AbstractQuadraticSolver = withState({c1: '0', c2: '0', c3: '0'}, coef => {
        const a = parseFloat(coef.get().c1)
        const b = parseFloat(coef.get().c2)
        const c = parseFloat(coef.get().c3)
        const d = b*b - 4*a*c
        return <div>
            <input value={coef.bind(i => i.c1)} placeholder="A" type="number"/> X<sup>2</sup> +
            <input value={coef.bind(i => i.c2)} placeholder="B" type="number"/> X +
            <input value={coef.bind(i => i.c3)} placeholder="C" type="number"/> = 0
            <div>
                {d < 0
                    ? 'No solution'
                    : <div>
                        X1 = {(- b + Math.sqrt(d)) / (2*a)},
                        X2 = {(- b - Math.sqrt(d)) / (2*a)}
                    </div>
                }
            </div>
        </div>
    }
)
```

## Rendering to the browser DOM

See [vdtree-dom](https://github.com/lgirma/vdtree-plugins/tree/master/dom) plugin.

## React

See [vdtree-react](https://github.com/lgirma/vdtree-plugins/tree/master/react) plugin.

## Server-Side Rendered (SSR) HTML

See [vdtree-ssr](https://github.com/lgirma/vdtree-plugins/tree/master/ssr) plugin.

## Svelte

See [vdtree-svelte](https://github.com/lgirma/vdtree-plugins/tree/master/svelte) plugin.

## License

ISC License