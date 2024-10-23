/// <reference types="vite/client" />

import { Component, DefineComponent } from 'vue';

declare global {
  declare module '*.vue' {
    import type { DefineComponent } from 'vue';

    const vueComponent: DefineComponent<{}, {}, any>;

    export default vueComponent;
  }

  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends ComponentPublicInstance {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }

  interface Document {
    startViewTransition(callbackOptions?: UpdateCallback): ViewTransition;
  }
}
