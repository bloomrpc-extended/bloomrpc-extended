import { resolve } from 'path';
import { builtinModules, createRequire } from 'module';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import type { Plugin } from 'vite';

const nodeRequire = createRequire(__filename);

const pkg = nodeRequire('./package.json');


/**
 * Strip `type="module"` and `crossorigin` from script tags in HTML output.
 * Needed because the renderer uses CJS format with nodeIntegration: true,
 * and Electron's file:// protocol doesn't support ES module scripts.
 */
function stripModuleAttributes(): Plugin {
  return {
    name: 'strip-module-attributes',
    enforce: 'post',
    generateBundle(_, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === 'asset' && typeof file.source === 'string' && file.fileName.endsWith('.html')) {
          file.source = file.source
            .replace(/ type="module"/g, '')
            .replace(/ crossorigin/g, '');
        }
      }
    },
  };
}

/**
 * Node-only npm packages that must NOT be pre-bundled by Vite.
 * These use instanceof checks or native bindings that break when
 * esbuild creates a separate bundled copy.
 */
const nodeOnlyPackages = [
  '@grpc/grpc-js',
  '@grpc/proto-loader',
  'grpc-reflection-js',
  'bloomrpc-mock',
  'protobufjs',
];

/**
 * Externalize Node.js builtins, electron, and Node-only npm packages
 * in the renderer.
 *
 * Build mode: mark as external so Rollup emits require() calls.
 * Dev mode: resolve to virtual modules that generate proper ESM
 * named exports by enumerating the real module's keys at serve time
 * (the Vite dev server runs in Node.js, so require() works).
 */
function externalizeNodeBuiltins(): Plugin {
  const VIRTUAL_PREFIX = '\0node-builtin:';
  const builtins = new Set([
    ...builtinModules,
    ...builtinModules.map((m) => `node:${m}`),
    'electron',
  ]);
  let isBuild = true;
  return {
    name: 'externalize-node-builtins',
    enforce: 'pre',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    resolveId(id) {
      if (builtins.has(id) || nodeOnlyPackages.some((pkg) => id === pkg || id.startsWith(pkg + '/'))) {
        if (isBuild) {
          return { id, external: true };
        }
        return VIRTUAL_PREFIX + id;
      }
    },
    load(id) {
      if (!id.startsWith(VIRTUAL_PREFIX)) return;
      const mod = id.slice(VIRTUAL_PREFIX.length);

      // Generate ESM wrapper with named exports by introspecting the
      // real Node.js module (available because the dev server is Node).
      // Use Function('return require')() to get Node's native require,
      // bypassing Vite's CJS-to-ESM transform which would otherwise
      // rewrite require() calls and cause dual-instance issues.
      const nativeReq = `Function('return require')()`;
      try {
        const real = nodeRequire(mod);
        const names = Object.keys(real).filter(
          (k) => k !== 'default' && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k),
        );
        return [
          `const _mod = ${nativeReq}(${JSON.stringify(mod)});`,
          `export default _mod;`,
          ...names.map((k) => `export const ${k} = _mod[${JSON.stringify(k)}];`),
        ].join('\n');
      } catch {
        // Module not available in Node context (e.g. 'electron')
        // Fall back to a CJS re-export; named imports won't work but
        // `import electron from 'electron'` and `const { x } = require('electron')` will.
        return `export default ${nativeReq}(${JSON.stringify(mod)});`;
      }
    },
  };
}

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        // Bundle ESM-only packages instead of externalizing
        exclude: ['electron-store', 'electron-debug'],
      }),
    ],
    build: {
      outDir: 'app/out/main',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'app/main.ts'),
        },
      },
    },
    define: {
      PRODUCT_NAME: JSON.stringify(pkg.productName),
      COPYRIGHT: JSON.stringify(pkg.license),
      HOMEPAGE: JSON.stringify(pkg.homepage),
      DESCRIPTION: JSON.stringify(pkg.description),
      LICENSE: JSON.stringify(pkg.license),
      BUG_REPORT_URL: JSON.stringify(pkg.bugs.url),
      VERSION: JSON.stringify(pkg.version),
    },
  },
  preload: {
    build: {
      externalizeDeps: true,
      outDir: 'app/out/preload',
      rollupOptions: {
        input: {
          preload: resolve(__dirname, 'app/preload.ts'),
        },
      },
    },
  },
  renderer: {
    root: resolve(__dirname, 'app'),
    plugins: [
      externalizeNodeBuiltins(),
      externalizeDepsPlugin({
        // Bundle electron-store (ESM-only) instead of externalizing
        exclude: ['electron-store'],
      }),
      stripModuleAttributes(),
    ],
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          {
            // Prevent esbuild from replacing Node.js builtins with browser
            // stubs during dep pre-bundling. At runtime, our Vite plugin
            // resolves these to virtual modules that proxy to require().
            name: 'externalize-node-builtins-esbuild',
            setup(build) {
              // Externalize Node.js builtins
              const builtinFilter = new RegExp(
                `^(${[...builtinModules, ...builtinModules.map((m) => `node:${m}`), 'electron'].map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`,
              );
              build.onResolve({ filter: builtinFilter }, (args) => ({
                path: args.path,
                external: true,
              }));
              // Externalize Node-only npm packages (prevent dual-instance issues)
              const pkgFilter = new RegExp(
                `^(${nodeOnlyPackages.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(/|$)`,
              );
              build.onResolve({ filter: pkgFilter }, (args) => ({
                path: args.path,
                external: true,
              }));
            },
          },
        ],
      },
    },
    build: {
      outDir: resolve(__dirname, 'app/out/renderer'),
      modulePreload: false,
      cssCodeSplit: true,
      rollupOptions: {
        input: {
          app: resolve(__dirname, 'app/app.html'),
          about: resolve(__dirname, 'app/about/about.html'),
        },
        output: {
          format: 'cjs',
          // Handle default exports from CJS packages (react-ace, etc.)
          interop: 'compat',
        },
      },
    },
  },
});
