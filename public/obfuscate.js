const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const inputPath = process.argv[2];

if (!inputPath) {
  console.error('Usage: node obfuscate.js <filename>');
  process.exit(1);
}

const resolvedPath = path.resolve(inputPath);

if (!fs.existsSync(resolvedPath)) {
  console.error(`Error: File not found at "${inputPath}"`);
  process.exit(1);
}

const obfuscatorOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: false,
  debugProtection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: false,
  simplify: true,
  splitStrings: true,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75
};

try {
  const parsed = path.parse(resolvedPath);
  const ext = parsed.ext.toLowerCase();
  const sourceCode = fs.readFileSync(resolvedPath, 'utf8');
  let outputCode = '';

  if (ext === '.html' || ext === '.htm') {
    // Target and obfuscate only inline JS blocks within <script> tags
    outputCode = sourceCode.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (match, attrs, jsCode) => {
      // Skip external scripts (with src) or empty scripts
      if (/\bsrc\s*=/i.test(attrs) || !jsCode.trim()) {
        return match;
      }
      try {
        const obfuscated = JavaScriptObfuscator.obfuscate(jsCode, obfuscatorOptions).getObfuscatedCode();
        return `<script${attrs}>\n${obfuscated}\n</script>`;
      } catch (err) {
        console.warn(`Warning: Could not obfuscate script tag content: ${err.message}`);
        return match;
      }
    });
  } else {
    // Pure JavaScript file (.js, .mjs, .cjs)
    outputCode = JavaScriptObfuscator.obfuscate(sourceCode, obfuscatorOptions).getObfuscatedCode();
  }

  // Rename original file to name_old.ext and overwrite original file path
  const backupPath = path.join(parsed.dir, `${parsed.name}_old${parsed.ext}`);
  fs.renameSync(resolvedPath, backupPath);
  fs.writeFileSync(resolvedPath, outputCode, 'utf8');

  console.log(`Successfully obfuscated "${parsed.base}":`);
  console.log(`  - Original file renamed to: ${path.basename(backupPath)}`);
  console.log(`  - Obfuscated file saved to: ${parsed.base}`);
} catch (error) {
  console.error('An error occurred during obfuscation:', error.message);
  process.exit(1);
}