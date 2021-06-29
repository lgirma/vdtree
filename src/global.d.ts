/// <reference types="vite/client" />

declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any;
    }
    interface Element {}
    interface ElementAttributesProperty {
        props; // specify the property name to use
    }
}
