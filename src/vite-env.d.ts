/// <reference types="vite/client" />

// Explicit fallback for the inline-worker import (vite/client also declares it,
// but this guarantees resolution regardless of the installed vite version / IDE
// TS-server pickup).
declare module '*?worker&inline' {
  const workerConstructor: { new (): Worker }
  export default workerConstructor
}
