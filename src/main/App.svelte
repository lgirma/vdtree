<script>
    import SvelteComponent from '../SvelteComponent.svelte'
    import {vd} from "../AbstractDOM";

    let count = 0

    const CounterInfo = ({c = 1}) => vd('div', {}, `${c}`)
</script>

<h1>Counter</h1>
<SvelteComponent dom={CounterInfo} props={{c: count}} />
<button on:click={e => count = count+1}>+</button>

<h1>Simple</h1>
<SvelteComponent dom={vd('div', {}, [
        'Visit us ',
        vd('a', {href: 'http://google.com'}, 'here'),
        '.'
    ])} />

<h1>With Events</h1>
<SvelteComponent dom={vd('button', {onclick: e => alert('Clicked!')}, 'Click Me')} />