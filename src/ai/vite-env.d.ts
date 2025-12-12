/// <reference types="vite/client" />

// Allow importing .txt files as raw strings
declare module '*.txt?raw' {
  const content: string;
  export default content;
}

declare module '*.txt' {
  const content: string;
  export default content;
}
