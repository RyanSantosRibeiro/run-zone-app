/**
 * Entry point customizado para o app.
 * Carrega os polyfills ANTES do expo-router, garantindo que o TextDecoder
 * com suporte a utf-16le esteja disponível quando o h3-reactnative for carregado.
 */

// 1. Polyfills primeiro — DEVE rodar antes de qualquer import do expo-router
const { TextDecoder, TextEncoder } = require('text-encoding');

// Sobrescreve o TextDecoder limitado do Expo/Hermes
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

// Também aplica via polyfillGlobal para garantir
const { polyfillGlobal } = require('react-native/Libraries/Utilities/PolyfillFunctions');
polyfillGlobal('TextDecoder', () => TextDecoder);
polyfillGlobal('TextEncoder', () => TextEncoder);

// Polyfill de document (necessário para h3-js/emscripten)
if (typeof global.document === 'undefined') {
  global.document = {};
}

// 2. Agora sim carrega o expo-router
require('expo-router/entry');
