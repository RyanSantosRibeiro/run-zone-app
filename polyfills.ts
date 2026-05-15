// polyfills.ts (na raiz do projeto)

// 1. Declarando os módulos para o TypeScript não reclamar
declare module 'fast-text-encoding';
declare module 'react-native/Libraries/Utilities/PolyfillFunctions';

// 2. Importando as ferramentas
import { polyfillGlobal } from 'react-native/Libraries/Utilities/PolyfillFunctions';
import { TextDecoder, TextEncoder } from 'fast-text-encoding';

// 3. Aplicando o polyfill de forma segura para o Hermes
if (__DEV__) {
  console.log('Polyfilling TextDecoder & TextEncoder for Hermes');
}

polyfillGlobal("TextDecoder", () => TextDecoder);
polyfillGlobal("TextEncoder", () => TextEncoder);