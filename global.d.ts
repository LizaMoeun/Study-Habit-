declare module 'react/jsx-runtime' {
  export function jsx(type: any, props?: any): any;
  export function jsxs(type: any, props?: any): any;
  export function jsxDEV(type: any, props?: any): any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};
