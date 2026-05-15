/**
 * Post-install script to patch h3-reactnative's TextDecoder usage.
 * 
 * The h3-js Emscripten output tries to create TextDecoder("utf-16le") at
 * module load time, but Expo SDK 54's TextDecoder doesn't support utf-16le.
 * This patch wraps the calls in try-catch so it falls back to the manual
 * string conversion (which Emscripten already has built-in).
 */

const fs = require('fs');
const path = require('path');

const filesToPatch = [
  path.join(__dirname, '..', 'node_modules', 'h3-reactnative', 'dist', 'h3-js.js'),
  path.join(__dirname, '..', 'node_modules', 'h3-reactnative', 'out', 'libh3.js'),
];

// Patterns to find and replace (covers both minified and prettified versions)
const replacements = [
  // Prettified format (dist/h3-js.js)
  {
    from: 'var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;',
    to: 'var UTF8Decoder = (function() { try { return typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined; } catch(e) { return undefined; } })();',
  },
  {
    from: 'var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;',
    to: 'var UTF16Decoder = (function() { try { return typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined; } catch(e) { return undefined; } })();',
  },
  // Minified format (out/libh3.js)
  {
    from: 'var UTF8Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf8"):undefined;',
    to: 'var UTF8Decoder=(function(){try{return typeof TextDecoder!=="undefined"?new TextDecoder("utf8"):undefined}catch(e){return undefined}})();',
  },
  {
    from: 'var UTF16Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf-16le"):undefined;',
    to: 'var UTF16Decoder=(function(){try{return typeof TextDecoder!=="undefined"?new TextDecoder("utf-16le"):undefined}catch(e){return undefined}})();',
  },
];

let totalPatched = 0;

for (const filePath of filesToPatch) {
  if (!fs.existsSync(filePath)) {
    console.log(`[patch-h3] ${path.basename(filePath)} not found, skipping.`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let filePatched = false;

  for (const { from, to } of replacements) {
    if (content.includes(from)) {
      content = content.replace(from, to);
      filePatched = true;
    }
  }

  if (filePatched) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`[patch-h3] ✅ Patched ${path.basename(filePath)}`);
    totalPatched++;
  } else {
    console.log(`[patch-h3] ${path.basename(filePath)} already patched or format changed.`);
  }
}

if (totalPatched > 0) {
  console.log(`[patch-h3] Done. ${totalPatched} file(s) patched.`);
} else {
  console.log('[patch-h3] No files needed patching.');
}
