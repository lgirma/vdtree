<script lang="ts">
    //import {AbstractDomElement} from "./AbstractDOM";
    import {h} from '../AbstractDOM'
    import {renderToDom} from './DOM'
    import { onMount } from 'svelte';
    import {isFunc} from "boost-web-core";

    export let dom//: AbstractDomElement
    export let props = null
    let container;
    let mounted = false;
    let domInstance = null;

    onMount(() => {
        mounted = true;
    })

    $: {
        if (mounted) {
            let _dom = dom
            if (isFunc(dom))
                _dom = h(dom)
            if (props != null)
                _dom.props = props
            if (domInstance != null)
                domInstance.update(_dom)
            else
                domInstance = renderToDom(_dom, container)
        }
    }
</script>

<div bind:this={container}>
    <slot></slot>
</div>
