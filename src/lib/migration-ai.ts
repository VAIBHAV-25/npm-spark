// AI-powered migration guide generator with package-specific knowledge

export function hasPackageKnowledge(packageName: string, fromMajor: number, toMajor: number): boolean {
  const key = `${fromMajor}->${toMajor}`;
  return !!PACKAGE_KNOWLEDGE[packageName]?.[key];
}

interface PackageKnowledge {
  breakingChanges: string[];
  migrationSteps: string[];
  codeExamples: Array<{ before: string; after: string; reason: string }>;
  commonIssues: Array<{ issue: string; solution: string }>;
  dependencies: string[];
}

// Knowledge base for popular packages
const PACKAGE_KNOWLEDGE: Record<string, Record<string, PackageKnowledge>> = {
  react: {
    '16->17': {
      breakingChanges: [
        'Event Pooling removed - synthetic events are no longer pooled',
        'No event pooling means you can access event properties asynchronously',
        'Effect cleanup timing - useEffect cleanup functions now run asynchronously',
        'Consistent errors for returning undefined from components',
        'Native event system changes - React attaches events to the root container instead of document',
        'onChange behavior now more closely matches browser behavior',
      ],
      migrationSteps: [
        'Remove any event.persist() calls - they are no longer needed',
        'Update any code that relies on synchronous event access',
        'Review useEffect cleanup functions for async timing issues',
        'Check if you have any code that directly attaches events to document - may conflict with new delegation',
        'Test all event handlers thoroughly, especially onChange and onScroll',
        'Update react-dom to the exact same version as react',
      ],
      codeExamples: [
        {
          before: 'function handleClick(e) {\n  e.persist(); // No longer needed\n  setTimeout(() => {\n    console.log(e.type);\n  }, 100);\n}',
          after: 'function handleClick(e) {\n  // Event properties are now accessible asynchronously\n  setTimeout(() => {\n    console.log(e.type);\n  }, 100);\n}',
          reason: 'Event pooling has been removed in React 17',
        },
      ],
      commonIssues: [
        {
          issue: 'e.persist() is not a function error',
          solution: 'Remove all e.persist() calls - event pooling no longer exists',
        },
        {
          issue: 'Event handlers not firing as expected',
          solution: 'React 17 attaches events to root instead of document. Check if you have custom event delegation logic that conflicts.',
        },
      ],
      dependencies: ['react-dom must be updated to same version'],
    },
    '16->18': {
      breakingChanges: [
        'Automatic batching for all state updates (including promises, setTimeout, native event handlers)',
        'New root API - ReactDOM.render is deprecated',
        'Strict Mode effects run twice in development',
        'useId hook for generating unique IDs',
        'Concurrent rendering enabled by default with new root API',
        'Suspense on server',
      ],
      migrationSteps: [
        'Replace ReactDOM.render with createRoot',
        'Replace ReactDOM.hydrate with hydrateRoot',
        'Update all ReactDOM.render calls to use new API',
        'Test with Strict Mode to catch potential issues',
        'Review and update any code that depends on sync rendering',
        'Replace any custom unique ID generation with useId',
      ],
      codeExamples: [
        {
          before: 'import ReactDOM from \'react-dom\';\n\nReactDOM.render(\n  <App />,\n  document.getElementById(\'root\')\n);',
          after: 'import { createRoot } from \'react-dom/client\';\n\nconst root = createRoot(\n  document.getElementById(\'root\')\n);\nroot.render(<App />);',
          reason: 'New root API is required for React 18 features like concurrent rendering',
        },
        {
          before: 'import ReactDOM from \'react-dom\';\n\nReactDOM.hydrate(\n  <App />,\n  document.getElementById(\'root\')\n);',
          after: 'import { hydrateRoot } from \'react-dom/client\';\n\nhydrateRoot(\n  document.getElementById(\'root\'),\n  <App />\n);',
          reason: 'Hydration API has been updated for React 18',
        },
      ],
      commonIssues: [
        {
          issue: 'Warning: ReactDOM.render is no longer supported',
          solution: 'Update to createRoot API: import { createRoot } from "react-dom/client"',
        },
        {
          issue: 'Effects running twice in development',
          solution: 'This is intentional in Strict Mode. Ensure cleanup functions are properly implemented',
        },
        {
          issue: 'Hydration mismatch errors',
          solution: 'Use useId for generating IDs instead of random/incremental IDs',
        },
      ],
      dependencies: ['react-dom must be updated to 18.x', '@types/react and @types/react-dom for TypeScript'],
    },
    '17->18': {
      breakingChanges: [
        'New root API required for concurrent features',
        'Automatic batching behavior change',
        'Strict Mode effects run twice',
        'Internet Explorer support dropped',
      ],
      migrationSteps: [
        'Update root API from ReactDOM.render to createRoot',
        'Test automatic batching behavior',
        'Remove IE11 polyfills if present',
        'Update TypeScript types',
      ],
      codeExamples: [
        {
          before: 'ReactDOM.render(<App />, container);',
          after: 'const root = createRoot(container);\nroot.render(<App />);',
          reason: 'New root API enables React 18 features',
        },
      ],
      commonIssues: [
        {
          issue: 'Batching behavior different from React 17',
          solution: 'Use flushSync() if you need synchronous updates',
        },
      ],
      dependencies: ['react-dom@18.x'],
    },
  },
  vue: {
    '2->3': {
      breakingChanges: [
        'Global API changed to use createApp',
        'v-model breaking change in components',
        'Filters removed',
        'Functional components must be plain functions',
        '$children removed',
        'Key attribute usage on <template v-for>',
      ],
      migrationSteps: [
        'Replace new Vue() with createApp()',
        'Update v-model usage in custom components',
        'Convert filters to methods or computed properties',
        'Update functional components syntax',
        'Replace $children with refs or provide/inject',
      ],
      codeExamples: [
        {
          before: 'import Vue from \'vue\';\n\nnew Vue({\n  render: h => h(App)\n}).$mount(\'#app\');',
          after: 'import { createApp } from \'vue\';\n\ncreateApp(App).mount(\'#app\');',
          reason: 'Vue 3 uses createApp for better tree-shaking and TypeScript support',
        },
      ],
      commonIssues: [
        {
          issue: 'this.$children is undefined',
          solution: 'Use template refs or provide/inject pattern instead',
        },
      ],
      dependencies: ['Update vue-router to 4.x', 'Update vuex to 4.x'],
    },
  },
  '@angular/core': {
    '12->13': {
      breakingChanges: [
        'View Engine removed - Ivy is now the only rendering engine',
        'IE11 support dropped',
        'Node.js 12 support dropped',
        'TypeScript 4.4+ required',
      ],
      migrationSteps: [
        'Run: ng update @angular/core@13 @angular/cli@13',
        'Remove View Engine specific code',
        'Update TypeScript to 4.4+',
        'Remove IE11 polyfills',
      ],
      codeExamples: [],
      commonIssues: [
        {
          issue: 'View Engine imports failing',
          solution: 'Remove all @angular/core/testing references to View Engine',
        },
      ],
      dependencies: ['All @angular/* packages must be version 13'],
    },
  },
  'next': {
    '12->13': {
      breakingChanges: [
        'New app directory (experimental)',
        'Turbopack (experimental)',
        'Image component improvements',
        'Font optimization built-in',
        'Minimum React version is 18.2.0',
      ],
      migrationSteps: [
        'Update React to 18.2.0+',
        'Update next.config.js for new features',
        'Test Image component changes',
        'Migrate to @next/font if using custom fonts',
      ],
      codeExamples: [
        {
          before: 'import Image from \'next/image\';\n\n<Image src="/pic.jpg" layout="fill" />',
          after: 'import Image from \'next/image\';\n\n<Image src="/pic.jpg" fill />',
          reason: 'Simplified Image component API',
        },
      ],
      commonIssues: [
        {
          issue: 'layout prop deprecated warning',
          solution: 'Use fill, width/height props instead of layout',
        },
      ],
      dependencies: ['react@^18.2.0', 'react-dom@^18.2.0'],
    },
  },
  'typescript': {
    '4->5': {
      breakingChanges: [
        'New lib.d.ts updates - DOM types changed',
        'Better const type inference - may cause type errors in previously working code',
        'Decorator changes - experimentalDecorators behavior updated',
        'Module resolution improvements - new "bundler" mode',
        'Enum member names are now checked for uniqueness',
        'Stricter checks for --noUncheckedIndexedAccess',
      ],
      migrationSteps: [
        'Update tsconfig.json for new module resolution settings',
        'Review all const type parameter usage',
        'Update decorator usage if using experimentalDecorators',
        'Fix any new type errors from improved inference',
        'Recompile all TypeScript code',
        'Update @types/* packages to latest versions',
      ],
      codeExamples: [
        {
          before: '// tsconfig.json\n{\n  "compilerOptions": {\n    "moduleResolution": "node"\n  }\n}',
          after: '// tsconfig.json\n{\n  "compilerOptions": {\n    "moduleResolution": "bundler",\n    "target": "ES2020"\n  }\n}',
          reason: 'TypeScript 5 introduces new "bundler" module resolution for modern build tools',
        },
      ],
      commonIssues: [
        {
          issue: 'Module resolution errors',
          solution: 'Update moduleResolution in tsconfig.json to "bundler" for modern tools like Vite/Webpack',
        },
        {
          issue: 'Unexpected type errors after upgrade',
          solution: 'TS5 has better const inference. You may need to explicitly type some variables that were previously inferred',
        },
      ],
      dependencies: [],
    },
    '3->4': {
      breakingChanges: [
        'Variadic tuple types - improved tuple and rest parameter typing',
        'Labeled tuple elements',
        'Class property inference from constructors',
        'Short-circuiting assignment operators',
        'unknown on catch clause bindings (with --useUnknownInCatchVariables)',
      ],
      migrationSteps: [
        'Update tsconfig.json to take advantage of new features',
        'Review catch blocks if using --useUnknownInCatchVariables',
        'Update tuple types to use labeled elements for better readability',
        'Recompile and fix any new type errors',
      ],
      codeExamples: [
        {
          before: 'try {\n  // code\n} catch (e) {\n  console.error(e.message); // error if using --useUnknownInCatchVariables\n}',
          after: 'try {\n  // code\n} catch (e) {\n  if (e instanceof Error) {\n    console.error(e.message);\n  }\n}',
          reason: 'TypeScript 4 can make catch clause bindings unknown instead of any',
        },
      ],
      commonIssues: [
        {
          issue: 'Catch clause variable type "unknown"',
          solution: 'Enable --useUnknownInCatchVariables flag and add proper type guards in catch blocks',
        },
      ],
      dependencies: [],
    },
  },
  'express': {
    '4->5': {
      breakingChanges: [
        'Router path matching is now more strict',
        'req.query now uses a more secure parser by default',
        'Some deprecated middleware removed',
        'Body parser changes - deprecated body-parser options removed',
        'Trust proxy behavior changes',
        'Node.js 18+ required',
      ],
      migrationSteps: [
        'Update Node.js to version 18 or higher',
        'Review all route paths - trailing slashes now matter',
        'Test query string parsing - may behave differently',
        'Update body-parser middleware configuration',
        'Check trust proxy settings in production',
        'Replace any removed deprecated middleware',
      ],
      codeExamples: [
        {
          before: 'app.use(express.urlencoded({ extended: true }));',
          after: 'app.use(express.urlencoded({ extended: true }));\n// Query parsing is now more secure by default',
          reason: 'Express 5 has updated body parsing and query string handling',
        },
      ],
      commonIssues: [
        {
          issue: 'Routes not matching as expected',
          solution: 'Express 5 uses path-to-regexp v6 which has stricter matching. Check trailing slashes and regex patterns.',
        },
        {
          issue: 'req.query values are different',
          solution: 'Express 5 uses a different query parser. Test your query parameter handling thoroughly.',
        },
      ],
      dependencies: ['Update all express middleware to compatible versions'],
    },
  },
  'vite': {
    '4->5': {
      breakingChanges: [
        'Node.js 18+ now required',
        'CJS Node API deprecated - use ESM imports',
        'Default dev server port changed to 5173',
        'Rollup 4 used instead of Rollup 3',
        'Some plugins may need updates for Rollup 4 compatibility',
        'Environment variables handling changes',
      ],
      migrationSteps: [
        'Update Node.js to version 18 or higher',
        'Convert vite.config to use ESM imports',
        'Update all Vite plugins to Rollup 4 compatible versions',
        'Review environment variable usage',
        'Update build scripts if they reference the old port',
        'Test dev server and production builds thoroughly',
      ],
      codeExamples: [
        {
          before: 'const { defineConfig } = require(\'vite\');',
          after: 'import { defineConfig } from \'vite\';',
          reason: 'Vite 5 deprecates CommonJS API in favor of ESM',
        },
      ],
      commonIssues: [
        {
          issue: 'Plugins not working after upgrade',
          solution: 'Update all Vite plugins to their latest versions compatible with Vite 5 and Rollup 4',
        },
        {
          issue: 'Dev server port conflicts',
          solution: 'Vite 5 changed default port from 3000 to 5173. Update your configs or scripts if needed.',
        },
      ],
      dependencies: ['rollup@^4.0.0', 'Update all @vitejs/* plugins'],
    },
    '3->4': {
      breakingChanges: [
        'Node.js 14/16 support dropped - requires Node.js 18+',
        'Rollup 3 used instead of Rollup 2',
        'Import assertions syntax updated',
        'CSS code splitting behavior changes',
      ],
      migrationSteps: [
        'Update Node.js to version 18 or higher',
        'Update all plugins to Rollup 3 compatible versions',
        'Review CSS imports and code splitting',
        'Test production builds thoroughly',
      ],
      codeExamples: [],
      commonIssues: [
        {
          issue: 'Build fails with module errors',
          solution: 'Ensure all plugins are compatible with Rollup 3. Check plugin documentation for updates.',
        },
      ],
      dependencies: ['rollup@^3.0.0'],
    },
  },
  'webpack': {
    '4->5': {
      breakingChanges: [
        'Node.js 10 support dropped - requires Node.js 10.13+',
        'Deterministic chunk IDs enabled by default in production',
        'Module Federation introduced',
        'Automatic Node.js polyfills removed',
        'Named exports from JSON modules',
        'Asset modules replace file/url/raw-loader',
      ],
      migrationSteps: [
        'Remove manual Node.js polyfills (crypto, path, etc.) and use resolve.fallback',
        'Replace file-loader, url-loader, raw-loader with asset modules',
        'Update webpack plugins to Webpack 5 compatible versions',
        'Review chunk splitting configuration',
        'Test all imports from JSON files',
        'Update webpack-dev-server to v4',
      ],
      codeExamples: [
        {
          before: '// webpack.config.js\nmodule.exports = {\n  module: {\n    rules: [\n      {\n        test: /\\.png$/,\n        use: [\'file-loader\']\n      }\n    ]\n  }\n};',
          after: '// webpack.config.js\nmodule.exports = {\n  module: {\n    rules: [\n      {\n        test: /\\.png$/,\n        type: \'asset/resource\'\n      }\n    ]\n  }\n};',
          reason: 'Webpack 5 replaces file-loader with built-in asset modules',
        },
      ],
      commonIssues: [
        {
          issue: 'Module not found errors for Node.js core modules',
          solution: 'Add resolve.fallback in webpack config: { crypto: require.resolve("crypto-browserify") } or false to exclude',
        },
        {
          issue: 'file-loader/url-loader not working',
          solution: 'Replace with asset modules: type: "asset/resource" or type: "asset/inline"',
        },
      ],
      dependencies: ['webpack-cli@^4.0.0', 'webpack-dev-server@^4.0.0'],
    },
  },
  'tailwindcss': {
    '2->3': {
      breakingChanges: [
        'JIT mode is now the default (removed legacy mode)',
        'Dark mode is now class-based by default',
        'Color palette completely redesigned',
        'Some deprecated utilities removed',
        '@apply works differently with !important',
        'Prefix is now applied to all utilities consistently',
      ],
      migrationSteps: [
        'Update tailwind.config.js - remove mode: "jit"',
        'Update dark mode classes if using media strategy',
        'Review custom color configurations',
        'Replace removed utilities with new alternatives',
        'Test @apply usage with !important',
        'Rebuild all CSS and test thoroughly',
      ],
      codeExamples: [
        {
          before: '// tailwind.config.js\nmodule.exports = {\n  mode: \'jit\',\n  darkMode: \'media\',\n  // ...\n}',
          after: '// tailwind.config.js\nmodule.exports = {\n  // JIT is default, no need to specify\n  darkMode: \'class\', // Changed default\n  // ...\n}',
          reason: 'Tailwind 3 makes JIT default and changes dark mode default to class-based',
        },
      ],
      commonIssues: [
        {
          issue: 'Colors look different after upgrade',
          solution: 'Tailwind 3 updated color palette. Review all color classes and update to new palette or configure custom colors.',
        },
        {
          issue: 'Dark mode not working',
          solution: 'Tailwind 3 defaults to class-based dark mode. Add dark class to parent element or configure darkMode: "media"',
        },
      ],
      dependencies: ['postcss@^8.0.0', 'autoprefixer@^10.0.0'],
    },
  },
  'jest': {
    '27->28': {
      breakingChanges: [
        'Node.js 12 support dropped - requires Node.js 14+',
        'Test environment now required to be explicitly specified',
        'github-actions reporter removed',
        'Default test environment changed',
        'Some test APIs updated',
      ],
      migrationSteps: [
        'Update Node.js to version 14 or higher',
        'Explicitly set testEnvironment in jest.config.js',
        'Update jest configuration for new defaults',
        'Replace github-actions reporter if used',
        'Update all Jest-related packages (@types/jest, ts-jest, etc.)',
      ],
      codeExamples: [
        {
          before: '// jest.config.js\nmodule.exports = {\n  // testEnvironment not specified\n};',
          after: '// jest.config.js\nmodule.exports = {\n  testEnvironment: \'node\', // or \'jsdom\' for browser-like env\n};',
          reason: 'Jest 28+ requires explicit test environment configuration',
        },
      ],
      commonIssues: [
        {
          issue: 'Test environment errors',
          solution: 'Add testEnvironment: "node" (for Node.js) or "jsdom" (for DOM) to jest.config.js',
        },
        {
          issue: 'TypeScript types not found',
          solution: 'Update @types/jest to ^28.0.0 or higher',
        },
      ],
      dependencies: ['@types/jest@^28.0.0 for TypeScript'],
    },
    '28->29': {
      breakingChanges: [
        'Node.js 14 support dropped - requires Node.js 16.10+',
        'Snapshot format changed',
        'Package exports updated - may affect imports',
        'Some configuration options changed',
      ],
      migrationSteps: [
        'Update Node.js to version 16.10 or higher',
        'Run jest with --updateSnapshot to update snapshots to new format',
        'Review and update import statements',
        'Update jest configuration for new options',
      ],
      codeExamples: [],
      commonIssues: [
        {
          issue: 'Snapshots failing after upgrade',
          solution: 'Run: npm test -- --updateSnapshot to regenerate snapshots in new format',
        },
      ],
      dependencies: ['@types/jest@^29.0.0 for TypeScript'],
    },
  },
  'eslint': {
    '7->8': {
      breakingChanges: [
        'Node.js 10/13/15 support dropped - requires Node.js 12.22+',
        'Comma-dangle rule updated with new options',
        'Some deprecated rules removed',
        'Plugin API changes',
      ],
      migrationSteps: [
        'Update Node.js to version 12.22 or higher',
        'Update all ESLint plugins to v8 compatible versions',
        'Review comma-dangle rule configuration',
        'Remove any deprecated rules from config',
        'Test linting across entire codebase',
      ],
      codeExamples: [],
      commonIssues: [
        {
          issue: 'ESLint plugins not working',
          solution: 'Update all eslint-plugin-* packages to their latest versions compatible with ESLint 8',
        },
        {
          issue: 'Rules not found errors',
          solution: 'Some rules were removed. Check ESLint 8 migration guide and remove or replace deprecated rules.',
        },
      ],
      dependencies: ['Update all eslint-plugin-* and eslint-config-* packages'],
    },
    '8->9': {
      breakingChanges: [
        'Node.js 18.18+, 20.9+, or 21.1+ required',
        'Flat config is now the default',
        'eslintrc deprecated (still supported)',
        'Several rules removed or changed',
        'Plugin resolution changed',
      ],
      migrationSteps: [
        'Update Node.js to version 18.18+ or 20.9+',
        'Consider migrating to flat config (eslint.config.js)',
        'Update all ESLint plugins to v9 compatible versions',
        'Test configuration with new plugin resolution',
        'Review and update any custom plugins',
      ],
      codeExamples: [
        {
          before: '// .eslintrc.js\nmodule.exports = {\n  extends: [\'eslint:recommended\'],\n  plugins: [\'react\'],\n  // ...\n};',
          after: '// eslint.config.js (flat config)\nimport js from \'@eslint/js\';\nimport react from \'eslint-plugin-react\';\n\nexport default [\n  js.configs.recommended,\n  {\n    plugins: { react },\n    // ...\n  }\n];',
          reason: 'ESLint 9 introduces flat config format as default',
        },
      ],
      commonIssues: [
        {
          issue: 'Configuration format errors',
          solution: 'ESLint 9 uses flat config by default. Migrate to eslint.config.js or set ESLINT_USE_FLAT_CONFIG=false',
        },
      ],
      dependencies: ['Update all eslint-plugin-* packages to v9 compatible versions'],
    },
  },
  'prisma': {
    '4->5': {
      breakingChanges: [
        'Node.js 16+ required',
        'client._engineConfig removed from public API',
        'TypedSQL introduced as new query method',
        'Some preview features graduated or changed',
        'Database driver adapters API updated',
      ],
      migrationSteps: [
        'Update Node.js to version 16 or higher',
        'Review usage of internal Prisma APIs',
        'Check preview features in schema.prisma',
        'Update Prisma Client usage',
        'Run: npx prisma generate after upgrade',
        'Test all database operations thoroughly',
      ],
      codeExamples: [
        {
          before: '// Accessing internal engine config\nconst config = prisma._engineConfig;',
          after: '// Use public APIs only\n// Internal APIs should not be accessed',
          reason: 'Prisma 5 removes internal APIs from public surface',
        },
      ],
      commonIssues: [
        {
          issue: 'Generated client errors',
          solution: 'Run: npx prisma generate to regenerate Prisma Client with Prisma 5',
        },
        {
          issue: '_engineConfig is undefined',
          solution: 'This internal API was removed. Use only public Prisma Client APIs.',
        },
      ],
      dependencies: ['@prisma/client@^5.0.0'],
    },
  },
  '@reduxjs/toolkit': {
    '1->2': {
      breakingChanges: [
        'React 18 and Redux 8 required',
        'immer updated to v10',
        'RTK Query behavior changes',
        'TypeScript 4.7+ required',
        'Some deprecated APIs removed',
      ],
      migrationSteps: [
        'Update React to 18+ and Redux to 8+',
        'Update TypeScript to 4.7 or higher',
        'Review RTK Query cache invalidation logic',
        'Update immer usage if using directly',
        'Test state mutations and reducers',
        'Check type definitions work correctly',
      ],
      codeExamples: [],
      commonIssues: [
        {
          issue: 'TypeScript compilation errors',
          solution: 'Update TypeScript to 4.7+ and ensure @types/react is 18+',
        },
        {
          issue: 'RTK Query cache not working as expected',
          solution: 'Review cache invalidation tags - behavior was refined in v2',
        },
      ],
      dependencies: ['react@^18.0.0', 'redux@^5.0.0', '@types/react@^18.0.0'],
    },
  },
  'axios': {
    '0->1': {
      breakingChanges: [
        'Automatic JSON transformation changed',
        'Transitional options removed',
        'Default timeout behavior changed',
        'Error handling structure updated',
        'Browser support changes - IE 11 dropped',
      ],
      migrationSteps: [
        'Review JSON transformation configuration',
        'Update error handling to match new structure',
        'Test timeout configurations',
        'Remove IE 11 polyfills if present',
        'Test all API calls thoroughly',
      ],
      codeExamples: [
        {
          before: 'axios.get(\'/api/data\', {\n  transitionalOptions: { ... }\n})',
          after: 'axios.get(\'/api/data\', {\n  // Transitional options removed\n})',
          reason: 'Axios 1.x removes transitional compatibility options',
        },
      ],
      commonIssues: [
        {
          issue: 'Response data format different',
          solution: 'Check transformResponse configuration - automatic JSON transformation behavior changed',
        },
        {
          issue: 'Timeout not working as expected',
          solution: 'Default timeout behavior changed in Axios 1.x. Explicitly set timeout values.',
        },
      ],
      dependencies: [],
    },
  },
  'react-router-dom': {
    '5->6': {
      breakingChanges: [
        '<Switch> replaced with <Routes>',
        '<Route> component API completely changed',
        'useHistory replaced with useNavigate',
        'useRouteMatch removed - use useMatch',
        'Relative routes and links work differently',
        'Exact prop removed',
      ],
      migrationSteps: [
        'Replace all <Switch> with <Routes>',
        'Update <Route> components to new element prop',
        'Replace useHistory() with useNavigate()',
        'Replace useRouteMatch with useMatch or useResolvedPath',
        'Update all relative paths and links',
        'Remove all exact props from routes',
      ],
      codeExamples: [
        {
          before: 'import { Switch, Route } from \'react-router-dom\';\n\n<Switch>\n  <Route exact path="/" component={Home} />\n  <Route path="/about" component={About} />\n</Switch>',
          after: 'import { Routes, Route } from \'react-router-dom\';\n\n<Routes>\n  <Route path="/" element={<Home />} />\n  <Route path="/about" element={<About />} />\n</Routes>',
          reason: 'React Router 6 uses Routes instead of Switch and element instead of component',
        },
        {
          before: 'import { useHistory } from \'react-router-dom\';\n\nconst history = useHistory();\nhistory.push(\'/home\');',
          after: 'import { useNavigate } from \'react-router-dom\';\n\nconst navigate = useNavigate();\nnavigate(\'/home\');',
          reason: 'useHistory replaced with useNavigate in React Router 6',
        },
      ],
      commonIssues: [
        {
          issue: 'Routes not matching',
          solution: 'React Router 6 changed how routes match. Remove exact prop and review path patterns.',
        },
        {
          issue: 'useHistory is not a function',
          solution: 'Replace useHistory with useNavigate - API is different',
        },
        {
          issue: 'Nested routes not working',
          solution: 'Use Outlet component and relative paths for nested routes in v6',
        },
      ],
      dependencies: ['react@^16.8.0 or ^17.0.0 or ^18.0.0'],
    },
  },
  '@mui/material': {
    '4->5': {
      breakingChanges: [
        'Package renamed from @material-ui/core to @mui/material',
        'Theme structure changed',
        'CSS class names changed (use -Mui- prefix)',
        'Some component APIs updated',
        'Icons moved to @mui/icons-material',
        'Strict mode compatible',
      ],
      migrationSteps: [
        'Rename imports from @material-ui/* to @mui/*',
        'Update theme structure and createTheme usage',
        'Update CSS class name references',
        'Run codemod: npx @mui/codemod v5.0.0/preset-safe',
        'Update icons package imports',
        'Test all components thoroughly',
      ],
      codeExamples: [
        {
          before: 'import { Button } from \'@material-ui/core\';\nimport { Delete } from \'@material-ui/icons\';',
          after: 'import { Button } from \'@mui/material\';\nimport { Delete } from \'@mui/icons-material\';',
          reason: 'MUI v5 renamed packages for better clarity',
        },
        {
          before: 'import { createMuiTheme } from \'@material-ui/core/styles\';',
          after: 'import { createTheme } from \'@mui/material/styles\';',
          reason: 'Theme creation function renamed in MUI v5',
        },
      ],
      commonIssues: [
        {
          issue: 'Module not found @material-ui/core',
          solution: 'Update all imports to @mui/material. Run: npx @mui/codemod v5.0.0/preset-safe for automatic migration',
        },
        {
          issue: 'Custom CSS classes not working',
          solution: 'MUI v5 changed class name structure. Use sx prop or update class selectors to use -Mui- prefix',
        },
      ],
      dependencies: ['@emotion/react@^11.0.0', '@emotion/styled@^11.0.0'],
    },
  },
  'vitest': {
    '0->1': {
      breakingChanges: [
        'Vite 5 now required as peer dependency',
        'Node.js 18+ required',
        'Configuration options changed',
        'Some test API updates',
        'Reporter API updated',
      ],
      migrationSteps: [
        'Update Vite to version 5',
        'Update Node.js to 18+',
        'Review vitest.config changes',
        'Update test configuration',
        'Test all test suites',
      ],
      codeExamples: [],
      commonIssues: [
        {
          issue: 'Tests not running after upgrade',
          solution: 'Ensure Vite is updated to v5 and Node.js is 18+. Update vitest.config.ts configuration.',
        },
      ],
      dependencies: ['vite@^5.0.0'],
    },
  },
  'cypress': {
    '9->10': {
      breakingChanges: [
        'cy.visit() changed to wait for stability',
        'Component testing revamped',
        'Node.js 12+ required',
        'Some plugins may be incompatible',
        'Retries configuration changed',
      ],
      migrationSteps: [
        'Update Node.js to 12+',
        'Review cy.visit() usage',
        'Update component testing setup if used',
        'Update Cypress plugins',
        'Review and update retry configuration',
      ],
      codeExamples: [],
      commonIssues: [
        {
          issue: 'cy.visit() timing issues',
          solution: 'Cypress 10 waits for page stability. Adjust wait times or use explicit waits if needed.',
        },
      ],
      dependencies: [],
    },
    '10->11': {
      breakingChanges: [
        'Node.js 14+ required',
        'Component testing further improved',
        'New test runner UI',
        'Configuration changes',
      ],
      migrationSteps: [
        'Update Node.js to 14+',
        'Review cypress.config file',
        'Update component testing if used',
        'Test with new UI',
      ],
      codeExamples: [],
      commonIssues: [],
      dependencies: [],
    },
    '11->12': {
      breakingChanges: [
        'Node.js 16+ required',
        'WebKit support added (experimental)',
        'Session handling improvements',
        'TypeScript improvements',
      ],
      migrationSteps: [
        'Update Node.js to 16+',
        'Update TypeScript definitions',
        'Review session management',
        'Test across browsers',
      ],
      codeExamples: [],
      commonIssues: [],
      dependencies: [],
    },
    '12->13': {
      breakingChanges: [
        'Node.js 18+ required',
        'WebKit support improved',
        'Performance improvements',
        'Configuration options updated',
      ],
      migrationSteps: [
        'Update Node.js to 18+',
        'Review configuration updates',
        'Test with WebKit if needed',
        'Review performance improvements',
      ],
      codeExamples: [],
      commonIssues: [],
      dependencies: [],
    },
  },
  'playwright': {
    '1->2': {
      breakingChanges: [
        'Some API methods renamed',
        'Browser contexts handling changed',
        'Test runner configuration updated',
        'Fixtures API updated',
      ],
      migrationSteps: [
        'Update test runner configuration',
        'Review API method changes',
        'Update fixtures if using custom fixtures',
        'Update browser context handling',
        'Test all browser automation',
      ],
      codeExamples: [],
      commonIssues: [
        {
          issue: 'Tests failing after upgrade',
          solution: 'Review Playwright 2.0 migration guide. Some methods were renamed or changed signatures.',
        },
      ],
      dependencies: [],
    },
  },
  'svelte': {
    '3->4': {
      breakingChanges: [
        'Minimum Node.js version increased to 16.14',
        'Some lifecycle behaviors changed',
        'TypeScript support improvements',
        'Compiler optimizations may affect edge cases',
        'CSS scoping behavior refined',
      ],
      migrationSteps: [
        'Update Node.js to 16.14+',
        'Review lifecycle hook usage',
        'Update TypeScript configuration if needed',
        'Test component rendering thoroughly',
        'Check CSS scoping behavior',
      ],
      codeExamples: [],
      commonIssues: [
        {
          issue: 'Component rendering issues',
          solution: 'Svelte 4 has compiler improvements. Review lifecycle hooks and reactivity patterns.',
        },
      ],
      dependencies: [],
    },
  },
  '@sveltejs/kit': {
    '1->2': {
      breakingChanges: [
        'Vite 5 required',
        'Node.js 18.13+ required',
        'Some adapter APIs changed',
        'Load function signature changes',
        'Form actions API updated',
      ],
      migrationSteps: [
        'Update Vite to v5',
        'Update Node.js to 18.13+',
        'Update all SvelteKit adapters',
        'Review load function usage',
        'Update form actions',
        'Test routing thoroughly',
      ],
      codeExamples: [
        {
          before: 'export const load = ({ params }) => {\n  return { props: { id: params.id } };\n}',
          after: 'export const load = ({ params }) => {\n  return { id: params.id };\n}',
          reason: 'SvelteKit 2 simplified load function return format',
        },
      ],
      commonIssues: [
        {
          issue: 'Adapter errors after upgrade',
          solution: 'Update all @sveltejs/adapter-* packages to versions compatible with SvelteKit 2',
        },
      ],
      dependencies: ['vite@^5.0.0', 'svelte@^4.0.0'],
    },
  },
  'nuxt': {
    '2->3': {
      breakingChanges: [
        'Vue 3 and Composition API',
        'New folder structure (app.vue, server/, etc.)',
        'Auto imports enabled by default',
        'Nuxt Bridge removed',
        'Pages directory optional',
        'Different build system (Vite/webpack 5)',
        'Modules API changed',
      ],
      migrationSteps: [
        'Review Nuxt 3 folder structure requirements',
        'Migrate to Vue 3 and Composition API',
        'Update nuxt.config to new format',
        'Update all Nuxt modules to v3 compatible versions',
        'Migrate from @nuxt/content v1 to v2 if used',
        'Update server middleware to new server/ directory',
        'Test auto-imports or configure as needed',
      ],
      codeExamples: [
        {
          before: '// nuxt.config.js\nexport default {\n  mode: \'universal\',\n  buildModules: [\'@nuxt/typescript-build\'],\n}',
          after: '// nuxt.config.ts\nexport default defineNuxtConfig({\n  // ssr is enabled by default\n  typescript: { strict: true },\n})',
          reason: 'Nuxt 3 uses defineNuxtConfig and simplified configuration',
        },
      ],
      commonIssues: [
        {
          issue: 'Module not found errors',
          solution: 'Nuxt 3 uses auto-imports. Remove explicit imports for Nuxt composables and utils.',
        },
        {
          issue: 'Nuxt modules not working',
          solution: 'Update all @nuxt/* and @nuxtjs/* modules to Nuxt 3 compatible versions',
        },
      ],
      dependencies: ['vue@^3.0.0', 'Update all @nuxt/* and @nuxtjs/* modules'],
    },
  },
  'remix': {
    '1->2': {
      breakingChanges: [
        'Vite is now default (instead of esbuild)',
        'Flat routes convention',
        'Some APIs deprecated',
        'Build output structure changed',
        'Node.js 18+ required',
      ],
      migrationSteps: [
        'Update to Vite-based setup',
        'Migrate to flat routes if desired',
        'Update remix.config.js',
        'Review deprecated APIs',
        'Update build scripts',
      ],
      codeExamples: [],
      commonIssues: [
        {
          issue: 'Build errors after upgrade',
          solution: 'Remix 2 uses Vite by default. Update your configuration and build setup accordingly.',
        },
      ],
      dependencies: ['vite@^5.0.0'],
    },
  },
  'styled-components': {
    '5->6': {
      breakingChanges: [
        'No longer uses stylis as dependency',
        'Transient props now use $ prefix',
        'React 18 optimizations',
        'TypeScript improvements',
        'className handling changed',
      ],
      migrationSteps: [
        'Add $ prefix to all transient props',
        'Update TypeScript types if needed',
        'Test className behavior',
        'Review styled-components usage',
      ],
      codeExamples: [
        {
          before: '<StyledButton primary={true}>Click</StyledButton>\n\nconst StyledButton = styled.button`\n  ${props => props.primary && css`background: blue;`}\n`;',
          after: '<StyledButton $primary={true}>Click</StyledButton>\n\nconst StyledButton = styled.button<{ $primary?: boolean }>`\n  ${props => props.$primary && css`background: blue;`}\n`;',
          reason: 'Styled-components 6 requires $ prefix for transient props to avoid DOM warnings',
        },
      ],
      commonIssues: [
        {
          issue: 'Unknown prop warnings in console',
          solution: 'Add $ prefix to all props that should not be passed to DOM elements',
        },
      ],
      dependencies: [],
    },
  },
  'zod': {
    '2->3': {
      breakingChanges: [
        'Some schema methods renamed',
        'Error handling structure changed',
        'Type inference improvements (may cause TS errors)',
        'Refinement API updated',
      ],
      migrationSteps: [
        'Update schema definitions',
        'Review error handling',
        'Update refinement usage',
        'Fix TypeScript errors from stricter inference',
      ],
      codeExamples: [],
      commonIssues: [
        {
          issue: 'TypeScript errors after upgrade',
          solution: 'Zod 3 has stricter type inference. Review schema definitions and type assertions.',
        },
      ],
      dependencies: [],
    },
  },
  'pnpm': {
    '7->8': {
      breakingChanges: [
        'Node.js 16.14+ required',
        'Lockfile format changed (v6.0)',
        'Some CLI flags changed',
        'Workspace protocol handling updated',
      ],
      migrationSteps: [
        'Update Node.js to 16.14+',
        'Regenerate lockfile: pnpm install',
        'Review CLI commands in scripts',
        'Update workspace configuration if using monorepo',
      ],
      codeExamples: [],
      commonIssues: [
        {
          issue: 'Lockfile conflicts',
          solution: 'Delete pnpm-lock.yaml and run pnpm install to regenerate with new format',
        },
      ],
      dependencies: [],
    },
    '8->9': {
      breakingChanges: [
        'Node.js 18+ required',
        'Lockfile format updated to v9',
        'Peer dependencies resolution changed',
        'Some configuration options updated',
      ],
      migrationSteps: [
        'Update Node.js to 18+',
        'Regenerate lockfile',
        'Review peer dependency warnings',
        'Update .npmrc if needed',
      ],
      codeExamples: [],
      commonIssues: [
        {
          issue: 'Peer dependency errors',
          solution: 'pnpm 9 has stricter peer dependency resolution. Review and resolve conflicts.',
        },
      ],
      dependencies: [],
    },
  },
  'postcss': {
    '7->8': {
      breakingChanges: [
        'Plugin API changed to async',
        'Node.js 10+ required',
        'Source map handling updated',
        'Some plugins may need updates',
      ],
      migrationSteps: [
        'Update all PostCSS plugins',
        'Update custom plugins to async API',
        'Test build process',
        'Review source map configuration',
      ],
      codeExamples: [],
      commonIssues: [
        {
          issue: 'Plugins not working',
          solution: 'Update all postcss-* plugins to versions compatible with PostCSS 8',
        },
      ],
      dependencies: ['Update all postcss-* plugins'],
    },
  },
  'node-sass': {
    '6->7': {
      breakingChanges: [
        'Dart Sass replaces LibSass',
        'Some Sass features behave differently',
        'Division operator changed to math.div()',
        'Color functions updated',
      ],
      migrationSteps: [
        'Consider migrating to sass (Dart Sass) instead',
        'Update division operations to use math.div()',
        'Review color function usage',
        'Test all Sass compilation',
      ],
      codeExamples: [
        {
          before: '$width: 10px / 2; // Division',
          after: '@use "sass:math";\n$width: math.div(10px, 2);',
          reason: 'Sass deprecated / for division, use math.div() instead',
        },
      ],
      commonIssues: [
        {
          issue: 'Deprecation warnings about /',
          solution: 'Replace / division with math.div(). Import @use "sass:math" at top of file.',
        },
        {
          issue: 'Consider switching to sass package',
          solution: 'node-sass is deprecated. Migrate to sass (Dart Sass): npm install sass',
        },
      ],
      dependencies: [],
    },
  },
  'sass': {
    '1.32->1.33': {
      breakingChanges: [
        'Slash as division deprecated',
        'Must use math.div() for division',
      ],
      migrationSteps: [
        'Import @use "sass:math" where needed',
        'Replace / division with math.div()',
        'Run sass migrator to automate updates',
      ],
      codeExamples: [
        {
          before: '$width: 10px / 2;',
          after: '@use "sass:math";\n$width: math.div(10px, 2);',
          reason: 'Sass requires math.div() for division',
        },
      ],
      commonIssues: [
        {
          issue: 'Deprecation warnings',
          solution: 'Run: npx sass-migrator division **/*.scss to automatically migrate',
        },
      ],
      dependencies: [],
    },
  },
};

// Generate detailed breaking changes based on version difference
export function generateDetailedBreakingChanges(
  packageName: string,
  fromMajor: number,
  toMajor: number
): string[] {
  const changes: string[] = [];
  
  // Check package-specific knowledge
  const key = `${fromMajor}->${toMajor}`;
  if (PACKAGE_KNOWLEDGE[packageName]?.[key]) {
    return PACKAGE_KNOWLEDGE[packageName][key].breakingChanges;
  }

  // Package category detection for better generic guidance
  const packageCategory = detectPackageCategory(packageName);
  
  // Generic AI-powered analysis based on version gap and package type
  const majorDiff = toMajor - fromMajor;
  
  if (majorDiff >= 3) {
    changes.push(`⚠️ Massive upgrade: ${majorDiff} major versions ahead - Expect significant changes`);
    changes.push(`Core APIs and architecture likely completely restructured from v${fromMajor} to v${toMajor}`);
    changes.push('Multiple generations of deprecated features have been removed');
    changes.push('New design patterns and best practices introduced across multiple versions');
    changes.push('STRONGLY RECOMMENDED: Migrate incrementally (one major version at a time)');
    changes.push('Read EVERY changelog between versions - cumulative breaking changes');
  } else if (majorDiff === 2) {
    changes.push(`⚠️ Large upgrade: ${majorDiff} major versions - Significant changes expected`);
    changes.push('Major API redesigns likely across core functionality');
    changes.push('Multiple breaking changes from two major version bumps');
    changes.push('Core functionality and default behaviors may have changed');
    changes.push('Plugin/extension ecosystem compatibility may be affected');
    changes.push('Consider incremental migration for safer upgrade path');
  } else if (majorDiff === 1) {
    changes.push(`⚠️ Major version bump: v${fromMajor} → v${toMajor} - Breaking changes expected`);
    changes.push('APIs marked as deprecated in previous version likely removed');
    changes.push('New recommended patterns and best practices introduced');
    changes.push('Core functionality may have behavior changes');
    changes.push('Configuration format or options may have changed');
  }

  // Add package-category-specific breaking changes
  switch (packageCategory) {
    case 'framework':
      changes.push('🎯 Framework: Component lifecycle or rendering behavior may have changed');
      changes.push('🎯 Framework: Build tools and dev server configuration may need updates');
      changes.push('🎯 Framework: Router, state management, or core APIs likely updated');
      break;
    case 'build-tool':
      changes.push('🔧 Build Tool: Plugin API may have changed - update all plugins');
      changes.push('🔧 Build Tool: Configuration format or options may be different');
      changes.push('🔧 Build Tool: Output format and module resolution may have changed');
      changes.push('🔧 Build Tool: Performance optimizations may affect existing builds');
      break;
    case 'ui-library':
      changes.push('🎨 UI Library: Component props and APIs may have changed');
      changes.push('🎨 UI Library: Theme structure and styling system may be updated');
      changes.push('🎨 UI Library: CSS class names or selectors may be different');
      changes.push('🎨 UI Library: Accessibility features may have been enhanced');
      break;
    case 'utility':
      changes.push('🔧 Utility: Core API methods may have new signatures');
      changes.push('🔧 Utility: Return types or data structures may have changed');
      changes.push('🔧 Utility: Tree-shaking and bundle size optimizations may affect imports');
      break;
    case 'testing':
      changes.push('🧪 Testing: Test configuration format may have changed');
      changes.push('🧪 Testing: Matchers, assertions, or expect API may be updated');
      changes.push('🧪 Testing: Test environment setup may need adjustments');
      changes.push('🧪 Testing: Mock and spy APIs may have changed');
      break;
    case 'database':
      changes.push('💾 Database: Query builder or ORM API may have changed');
      changes.push('💾 Database: Schema definition or migration tools may be updated');
      changes.push('💾 Database: Connection pooling or transaction handling may differ');
      break;
    case 'cli':
      changes.push('⌨️ CLI: Command syntax or flags may have changed');
      changes.push('⌨️ CLI: Configuration file format may be updated');
      changes.push('⌨️ CLI: Output format or behavior may be different');
      break;
  }

  // Add universal breaking change patterns
  changes.push('🔄 Minimum supported runtime versions likely increased (Node.js, browsers, etc.)');
  changes.push('📦 Peer dependencies and their version requirements may have been updated');
  changes.push('⚙️ Default configurations and behavior may have changed');
  changes.push('🗑️ Deprecated exports, methods, or options from previous versions removed');
  changes.push('📝 TypeScript types may be stricter or restructured if using TypeScript');
  
  return changes;
}

// Detect package category for better guidance
function detectPackageCategory(packageName: string): string {
  const name = packageName.toLowerCase();
  
  if (name.includes('react') || name.includes('vue') || name.includes('angular') || 
      name.includes('svelte') || name.includes('next') || name.includes('nuxt') ||
      name.includes('gatsby') || name.includes('remix')) {
    return 'framework';
  }
  
  if (name.includes('webpack') || name.includes('vite') || name.includes('rollup') ||
      name.includes('parcel') || name.includes('esbuild') || name.includes('turbo')) {
    return 'build-tool';
  }
  
  if (name.includes('mui') || name.includes('material') || name.includes('chakra') ||
      name.includes('antd') || name.includes('ant-design') || name.includes('bootstrap') ||
      name.includes('tailwind')) {
    return 'ui-library';
  }
  
  if (name.includes('jest') || name.includes('mocha') || name.includes('vitest') ||
      name.includes('cypress') || name.includes('playwright') || name.includes('testing')) {
    return 'testing';
  }
  
  if (name.includes('prisma') || name.includes('typeorm') || name.includes('sequelize') ||
      name.includes('mongoose') || name.includes('drizzle') || name.includes('knex')) {
    return 'database';
  }
  
  if (name.includes('cli') || name.includes('-cli')) {
    return 'cli';
  }
  
  if (name.includes('lodash') || name.includes('ramda') || name.includes('date-fns') ||
      name.includes('dayjs') || name.includes('axios') || name.includes('fetch')) {
    return 'utility';
  }
  
  return 'generic';
}

// Generate package-specific code migration examples
export function generateCodeMigrationExamples(
  packageName: string,
  fromMajor: number,
  toMajor: number
): Array<{ before: string; after: string; reason: string }> {
  const key = `${fromMajor}->${toMajor}`;
  if (PACKAGE_KNOWLEDGE[packageName]?.[key]?.codeExamples) {
    return PACKAGE_KNOWLEDGE[packageName][key].codeExamples;
  }

  const packageCategory = detectPackageCategory(packageName);
  const examples: Array<{ before: string; after: string; reason: string }> = [];

  // Generate category-specific examples
  switch (packageCategory) {
    case 'framework':
      examples.push({
        before: `// Old import from ${packageName} v${fromMajor}\nimport Component from '${packageName}';\n\n// Old API usage\nconst app = new Component(config);`,
        after: `// New import structure in v${toMajor}\nimport { Component } from '${packageName}';\n\n// Check docs for updated initialization\nconst app = Component.create(config);`,
        reason: `${packageName} v${toMajor} may have restructured exports and initialization APIs for better tree-shaking and TypeScript support`,
      });
      if (packageName.includes('react') || packageName.includes('vue')) {
        examples.push({
          before: `// Old hook or composition API\nimport { oldHook } from '${packageName}';\n\nfunction Component() {\n  const value = oldHook();\n  // ...\n}`,
          after: `// Updated API in v${toMajor}\nimport { newHook } from '${packageName}';\n\nfunction Component() {\n  const value = newHook();\n  // Check migration guide for exact changes\n}`,
          reason: `Framework hooks and APIs often change in major versions - review the official migration guide for specific changes`,
        });
      }
      break;
    case 'build-tool':
      examples.push({
        before: `// Old configuration for ${packageName} v${fromMajor}\nexport default {\n  // Old config format\n  option: 'value',\n  deprecated: true\n}`,
        after: `// Updated configuration for v${toMajor}\nexport default {\n  // New config format\n  option: 'value',\n  // Check docs for new options\n}`,
        reason: `Build tools often update configuration format in major versions`,
      });
      break;
    case 'ui-library':
      examples.push({
        before: `// Old component API (v${fromMajor})\nimport { Button } from '${packageName}';\n\n<Button variant="primary" />;`,
        after: `// Updated component API (v${toMajor})\nimport { Button } from '${packageName}';\n\n<Button color="primary" />;\n// Props may have been renamed`,
        reason: `UI libraries often rename component props or restructure APIs in major versions for better consistency`,
      });
      examples.push({
        before: `// Old theme structure\nconst theme = {\n  colors: { primary: '#000' }\n};`,
        after: `// New theme structure in v${toMajor}\nconst theme = {\n  palette: { primary: { main: '#000' } }\n};\n// Check theme migration guide`,
        reason: `Theme configuration often changes in major UI library updates`,
      });
      break;
    case 'testing':
      examples.push({
        before: `// Old test syntax (v${fromMajor})\nimport { render } from '${packageName}';\n\ntest('example', () => {\n  const result = render(component);\n  expect(result).toBe(value);\n});`,
        after: `// Updated test syntax (v${toMajor})\nimport { render } from '${packageName}';\n\ntest('example', async () => {\n  const result = await render(component);\n  expect(result).toBe(value);\n});`,
        reason: `Testing frameworks may update assertion APIs or add async support in major versions`,
      });
      break;
    case 'database':
      examples.push({
        before: `// Old query API (v${fromMajor})\nawait db.${packageName.includes('prisma') ? 'user' : 'table'}('users')\n  .where('id', id)\n  .first();`,
        after: `// Updated query API (v${toMajor})\nawait db.${packageName.includes('prisma') ? 'user' : 'table'}('users')\n  .findFirst({ where: { id } });\n// Check query API changes`,
        reason: `Database ORMs often refine query APIs in major versions for better type safety`,
      });
      break;
    case 'utility':
      examples.push({
        before: `// Old API (v${fromMajor})\nimport ${packageName.split('/').pop()} from '${packageName}';\n\nconst result = ${packageName.split('/').pop()}(data);`,
        after: `// New API (v${toMajor})\nimport { method } from '${packageName}';\n\nconst result = method(data);\n// May now use named exports`,
        reason: `Utility libraries often move to named exports in major versions for better tree-shaking`,
      });
      break;
    case 'cli':
      examples.push({
        before: `// Old CLI usage\n${packageName} old-command --old-flag`,
        after: `// Updated CLI syntax (v${toMajor})\n${packageName} new-command --updated-flag\n// Check CLI help: ${packageName} --help`,
        reason: `CLI tools may update command syntax or flags in major versions`,
      });
      break;
    default:
      examples.push({
        before: `// Old import style from v${fromMajor}\nimport ${packageName.split('/').pop() || 'Package'} from '${packageName}';\n\n// Old API usage\nconst result = ${packageName.split('/').pop() || 'Package'}.method();`,
        after: `// New import style in v${toMajor}\nimport { method } from '${packageName}';\n\n// Updated API - check official docs\nconst result = method();`,
        reason: `Major versions typically restructure exports and APIs. Review the official ${packageName} migration guide for specific changes between v${fromMajor} and v${toMajor}`,
      });
  }

  // Add TypeScript-specific example if it looks like a typed package
  if (examples.length > 0) {
    examples.push({
      before: `// If using TypeScript with v${fromMajor}\nimport type { OldType } from '${packageName}';`,
      after: `// Updated types in v${toMajor}\nimport type { NewType } from '${packageName}';\n// Type definitions may be restructured`,
      reason: `TypeScript types often change in major versions - may be stricter or reorganized`,
    });
  }

  return examples;
}

// Generate detailed common issues with solutions
export function generateDetailedCommonIssues(
  packageName: string,
  fromMajor: number,
  toMajor: number,
  fromVersion: string,
  toVersion: string
): Array<{ issue: string; solution: string }> {
  const key = `${fromMajor}->${toMajor}`;
  if (PACKAGE_KNOWLEDGE[packageName]?.[key]?.commonIssues) {
    return PACKAGE_KNOWLEDGE[packageName][key].commonIssues;
  }

  const packageCategory = detectPackageCategory(packageName);
  const majorDiff = toMajor - fromMajor;

  // Start with universal common issues
  const issues: Array<{ issue: string; solution: string }> = [
    {
      issue: `❌ "Module not found" or import errors after upgrading to ${toVersion}`,
      solution: `1. Clear installation cache:\n   rm -rf node_modules package-lock.json\n   npm install\n\n2. Reinstall the package:\n   npm install ${packageName}@${toVersion}\n\n3. Check if package exports changed:\n   npm view ${packageName}@${toVersion} exports\n\n4. Update your import statements if the package restructured exports`,
    },
    {
      issue: '❌ TypeScript compilation errors after upgrade',
      solution: `1. Update type definitions:\n   npm install --save-dev @types/${packageName}@latest\n\n2. Update tsconfig.json if needed:\n   - Check "moduleResolution" setting\n   - Update "lib" array for new features\n   - Review "target" and "module" settings\n\n3. Clear TypeScript cache:\n   rm -rf node_modules/.cache\n\n4. Restart your IDE's TypeScript server`,
    },
    {
      issue: `⚠️ Deprecated API warnings in console`,
      solution: `1. Review the official migration guide:\n   npm home ${packageName}\n   Look for CHANGELOG.md or MIGRATION.md\n\n2. Search your codebase for deprecated usage:\n   grep -r "${packageName}" src/\n\n3. Replace deprecated APIs with new recommended patterns\n\n4. Use the package's codemod tool if available:\n   npx ${packageName}-codemod`,
    },
  ];

  // Add category-specific issues
  switch (packageCategory) {
    case 'framework':
      issues.push(
        {
          issue: '❌ Components not rendering or throwing errors',
          solution: `1. Check if component APIs changed (props, lifecycle methods)\n2. Review framework-specific breaking changes in changelog\n3. Update component imports if package structure changed\n4. Test with React DevTools or framework-specific dev tools\n5. Check console for specific error messages and warnings`,
        },
        {
          issue: '🔧 Build fails or dev server won't start',
          solution: `1. Update your build tool (Webpack/Vite/etc) to compatible version\n2. Update framework-specific plugins and loaders\n3. Review build configuration for deprecated options\n4. Clear build cache: rm -rf .cache dist build\n5. Check Node.js version compatibility`,
        },
        {
          issue: '🧪 Tests failing after framework upgrade',
          solution: `1. Update testing library (${packageName.includes('react') ? '@testing-library/react' : 'testing utilities'})\n2. Update test renderer if using snapshot tests\n3. Review test setup and configuration\n4. Update mock implementations\n5. Run: npm test -- --updateSnapshot for snapshots`,
        }
      );
      break;
    case 'build-tool':
      issues.push(
        {
          issue: '🔌 Plugins not working after upgrade',
          solution: `1. Update ALL plugins to versions compatible with ${packageName} v${toMajor}\n2. Check each plugin's compatibility matrix\n3. Remove unsupported plugins and find alternatives\n4. Update plugin configuration to new format\n5. Search for "[plugin-name] ${packageName} ${toMajor}" for compatibility info`,
        },
        {
          issue: '❌ Build fails with configuration errors',
          solution: `1. Review configuration file format - may have changed\n2. Check official migration guide for config changes\n3. Update deprecated config options\n4. Remove options that were removed\n5. Use new config format if available\n6. Try with minimal config first, then add options back`,
        },
        {
          issue: '📦 Output bundles are different or broken',
          solution: `1. Review output format changes in changelog\n2. Check if code splitting behavior changed\n3. Update public path or asset handling\n4. Test production build thoroughly\n5. Compare bundle analysis before/after: npm run build -- --analyze`,
        }
      );
      break;
    case 'ui-library':
      issues.push(
        {
          issue: '🎨 Components look different or styles broken',
          solution: `1. Check if CSS class names changed\n2. Update theme configuration to new format\n3. Review breaking changes in component APIs\n4. Import required CSS/styles if imports changed\n5. Check if global styles need updates\n6. Use browser DevTools to inspect applied styles`,
        },
        {
          issue: '⚠️ Component props warnings or errors',
          solution: `1. Review component API changes in documentation\n2. Update renamed props\n3. Replace removed props with alternatives\n4. Check if prop types changed (string to enum, etc.)\n5. Update event handler signatures if changed`,
        }
      );
      break;
    case 'testing':
      issues.push(
        {
          issue: '🧪 All tests failing after upgrade',
          solution: `1. Update test configuration file to new format\n2. Update test globals and setup files\n3. Check if test environment changed (jsdom/node)\n4. Update matchers and assertions to new API\n5. Clear test cache\n6. Update @types packages for TypeScript`,
        },
        {
          issue: '🎭 Mocks and spies not working',
          solution: `1. Review mock API changes in changelog\n2. Update mock function syntax\n3. Update spy implementation\n4. Check if mock module resolution changed\n5. Update manual mocks if structure changed`,
        }
      );
      break;
    case 'database':
      issues.push(
        {
          issue: '💾 Database queries failing',
          solution: `1. Review query API changes\n2. Update query method signatures\n3. Check if relation loading changed\n4. Update transaction handling\n5. Test queries in development first\n6. BACKUP production database before deploying`,
        },
        {
          issue: '🔄 Migration issues',
          solution: `1. Regenerate migration files if tool changed\n2. Update migration syntax to new format\n3. Test migrations on development database first\n4. Review schema definition changes\n5. Check migration tool version compatibility`,
        }
      );
      break;
  }

  // Add more universal issues
  issues.push(
    {
      issue: '⚠️ Peer dependency version conflicts',
      solution: `1. Check which packages have conflicts:\n   npm ls ${packageName}\n\n2. Update conflicting peer dependencies:\n   npm install peer-dep@compatible-version\n\n3. You may need to update multiple packages together:\n   npm install ${packageName}@${toVersion} peer-dep@new-version\n\n4. Use --legacy-peer-deps as last resort (not recommended):\n   npm install --legacy-peer-deps`,
    },
    {
      issue: '🚨 Runtime errors in production after deployment',
      solution: `1. Ensure all peer dependencies are updated\n2. Check browser console for specific errors\n3. Verify build process completed successfully\n4. Test production build locally:\n   npm run build && npm run preview\n5. Check if environment variables need updates\n6. Review error tracking (Sentry, etc.) for patterns\n7. Consider rolling back and debugging in staging`,
    }
  );

  if (majorDiff >= 2) {
    issues.push({
      issue: `🔥 Overwhelming number of errors after ${majorDiff}-major-version jump`,
      solution: `This ${fromMajor} → ${toMajor} upgrade is very large. STRONGLY RECOMMENDED:\n\n1. Roll back to v${fromVersion}\n2. Migrate incrementally:\n   - First: v${fromMajor} → v${fromMajor + 1}\n   - Then: v${fromMajor + 1} → v${fromMajor + 2}\n   - Continue until v${toMajor}\n\n3. This approach:\n   ✅ Makes debugging much easier\n   ✅ Lets you test at each step\n   ✅ Reduces risk of breaking production\n   ✅ Easier to identify which version introduced issues`,
    });
  }

  issues.push(
    {
      issue: `📚 Can't find specific migration documentation`,
      solution: `Try these resources:\n\n1. Package homepage:\n   npm home ${packageName}\n\n2. GitHub releases:\n   - Search for "v${toVersion} release notes"\n   - Look for CHANGELOG.md, MIGRATION.md\n\n3. Community resources:\n   - Search: "${packageName} ${fromMajor} to ${toMajor} migration"\n   - Check Stack Overflow for common issues\n   - Look for blog posts about migrating\n\n4. Package repository issues:\n   - Search closed issues for migration help\n   - Open an issue if you're stuck`,
    }
  );

  return issues;
}

// Generate detailed migration steps with package-specific knowledge
export function generateDetailedMigrationSteps(
  packageName: string,
  fromMajor: number,
  toMajor: number,
  toVersion: string
): string[] {
  const key = `${fromMajor}->${toMajor}`;
  if (PACKAGE_KNOWLEDGE[packageName]?.[key]?.migrationSteps) {
    return PACKAGE_KNOWLEDGE[packageName][key].migrationSteps;
  }

  const packageCategory = detectPackageCategory(packageName);
  const majorDiff = toMajor - fromMajor;

  // Generic detailed steps with category-specific guidance
  const steps: string[] = [
    `📖 Read the official ${packageName} changelog for v${fromMajor} → v${toMajor}`,
    `🔍 Identify all breaking changes listed in the migration guide`,
    `📁 Create a comprehensive list of files using ${packageName}`,
  ];

  if (majorDiff > 1) {
    steps.push(`⚠️ RECOMMENDED: Migrate incrementally through each major version (${fromMajor} → ${fromMajor + 1} → ... → ${toMajor})`);
  }

  // Add category-specific steps
  switch (packageCategory) {
    case 'framework':
  steps.push(
        '🔧 Update all component imports and framework-specific APIs',
        '🎨 Review and update component lifecycle methods if any',
        '🔌 Update related framework plugins and extensions',
        '📦 Check if router, state management, or other framework tools need updates',
        '🏗️ Update build configuration and dev server settings',
        '🧪 Update test utilities and component testing setup'
      );
      break;
    case 'build-tool':
      steps.push(
        '🔌 Update ALL build tool plugins to compatible versions',
        '⚙️ Update configuration file to match new format/options',
        '📦 Review and update loader/plugin configurations',
        '🔍 Test both development and production builds',
        '📊 Compare bundle sizes before and after',
        '⚡ Test build performance and hot reload'
      );
      break;
    case 'ui-library':
      steps.push(
        '🎨 Update all component imports and usages',
        '🎭 Review theme configuration and styling system',
        '📝 Update component props to match new API',
        '🎯 Check custom CSS classes and selectors',
        '♿ Test accessibility features',
        '📱 Verify responsive behavior across devices'
      );
      break;
    case 'testing':
      steps.push(
        '⚙️ Update test configuration files',
        '🧪 Update test imports and assertions',
        '🎭 Update mocks and spies to new API',
        '🔍 Review test environment setup',
        '📊 Update coverage configuration',
        '✅ Run full test suite and fix failures'
      );
      break;
    case 'database':
      steps.push(
        '💾 Review and update database schema definitions',
        '🔄 Update query builder or ORM method calls',
        '🔌 Check connection and pooling configuration',
        '📝 Update migration scripts if needed',
        '🧪 Test all database operations thoroughly',
        '⚠️ Backup database before deploying'
      );
      break;
    case 'cli':
      steps.push(
        '⌨️ Update CLI command syntax in scripts',
        '⚙️ Update CLI configuration files',
        '📝 Review command flags and options',
        '🔍 Test all CLI commands used in your project'
      );
      break;
    case 'utility':
      steps.push(
        '📦 Update all import statements',
        '🔧 Review API method signatures and update calls',
        '📊 Check return types and data structures',
        '🧪 Update unit tests for utility functions'
      );
      break;
  }

  // Add universal steps
  steps.push(
    `📦 Update all imports from ${packageName}`,
    '🔧 Update API calls to match new signatures',
    '🔍 Run linter and fix all errors and warnings',
    '📝 Update TypeScript types if using TypeScript',
    '🧪 Update test assertions for new behavior',
    '✅ Run complete test suite',
    '👁️ Manually test all critical user flows',
    '📦 Check final bundle size impact',
    '⚡ Review runtime performance impact',
    '📊 Monitor error tracking after deployment'
  );

  if (majorDiff >= 2) {
    steps.push('🚨 Consider canary/gradual rollout for such a large upgrade');
  }

  return steps;
}

// Generate required dependency updates
export function generateDependencyUpdates(
  packageName: string,
  fromMajor: number,
  toMajor: number
): Array<{ dep: string; reason: string; critical: boolean }> {
  const key = `${fromMajor}->${toMajor}`;
  const deps: Array<{ dep: string; reason: string; critical: boolean }> = [];

  if (PACKAGE_KNOWLEDGE[packageName]?.[key]?.dependencies) {
    PACKAGE_KNOWLEDGE[packageName][key].dependencies.forEach(dep => {
      deps.push({
        dep,
        reason: 'Required for compatibility',
        critical: true,
      });
    });
    return deps;
  }

  const packageCategory = detectPackageCategory(packageName);

  // Add category-specific common dependency updates
  switch (packageCategory) {
    case 'framework':
      if (packageName.includes('react')) {
        deps.push({
          dep: 'react-dom',
          reason: `Must match React version exactly (both should be v${toMajor})`,
          critical: true,
        });
        if (toMajor >= 18) {
          deps.push({
            dep: '@types/react',
            reason: 'TypeScript types must match React version',
            critical: false,
          });
          deps.push({
            dep: '@types/react-dom',
            reason: 'TypeScript types must match React DOM version',
            critical: false,
          });
        }
      } else if (packageName.includes('vue')) {
        deps.push({
          dep: 'vue-router',
          reason: `Vue Router major version should match Vue major version`,
          critical: true,
        });
        if (toMajor >= 3) {
          deps.push({
            dep: 'vuex or pinia',
            reason: 'State management library may need update for Vue 3+',
            critical: true,
          });
        }
      } else if (packageName.includes('angular')) {
        deps.push({
          dep: 'All @angular/* packages',
          reason: 'All Angular packages must be on the same major version',
          critical: true,
        });
        deps.push({
          dep: '@angular/cli',
          reason: 'CLI version should match Angular version',
          critical: true,
        });
      } else if (packageName.includes('next')) {
        deps.push({
          dep: 'react',
          reason: 'Next.js requires specific React versions',
          critical: true,
        });
        deps.push({
          dep: 'react-dom',
          reason: 'Must match React version',
          critical: true,
        });
      }
      break;
    case 'build-tool':
      deps.push({
        dep: 'All bundler plugins',
        reason: `Plugins must be compatible with ${packageName} v${toMajor}`,
        critical: true,
      });
      if (packageName.includes('webpack')) {
        deps.push({
          dep: 'webpack-cli',
          reason: 'CLI version must match Webpack major version',
          critical: true,
        });
        deps.push({
          dep: 'webpack-dev-server',
          reason: 'Dev server must be compatible with Webpack version',
          critical: true,
        });
      }
      break;
    case 'testing':
      if (packageName.includes('jest')) {
        deps.push({
          dep: '@types/jest',
          reason: 'TypeScript types must match Jest version',
          critical: false,
        });
        deps.push({
          dep: 'ts-jest',
          reason: 'Required for Jest with TypeScript',
          critical: false,
        });
      }
      deps.push({
        dep: 'test utilities and plugins',
        reason: `Ensure all testing plugins are compatible with ${packageName} v${toMajor}`,
        critical: true,
      });
      break;
    case 'ui-library':
      if (packageName.includes('mui') || packageName.includes('material')) {
        deps.push({
          dep: '@emotion/react',
          reason: 'MUI uses Emotion for styling',
          critical: true,
        });
        deps.push({
          dep: '@emotion/styled',
          reason: 'Required for styled components in MUI',
          critical: true,
        });
      }
      break;
    case 'database':
      if (packageName.includes('prisma')) {
        deps.push({
          dep: '@prisma/client',
          reason: 'Prisma Client must match Prisma CLI version exactly',
          critical: true,
        });
      }
      deps.push({
        dep: 'Database drivers',
        reason: 'Underlying database drivers may need updates',
        critical: true,
      });
      break;
  }

  // Add generic peer dependency updates
  if (packageName.startsWith('@types/')) {
    const basePackage = packageName.replace('@types/', '');
    deps.push({
      dep: basePackage,
      reason: 'Type definitions must match the package version',
      critical: true,
    });
  }

  // Add TypeScript check for all packages
  if (deps.length > 0 || toMajor - fromMajor >= 2) {
    deps.push({
      dep: 'TypeScript (if using)',
      reason: `Newer ${packageName} versions may require newer TypeScript for best type support`,
      critical: false,
    });
  }

  return deps;
}

// Generate testing strategy
export function generateTestingStrategy(
  majorDiff: number
): string[] {
  const strategy: string[] = [
    'Run existing unit test suite',
    'Run integration tests',
    'Test critical user paths manually',
  ];

  if (majorDiff > 1) {
    strategy.push(
      'Perform regression testing on all major features',
      'Load test to check performance impact',
      'Test on all supported browsers/platforms',
      'Run security audit: npm audit',
      'Check for console warnings and errors',
      'Monitor error tracking in staging environment'
    );
  } else {
    strategy.push(
      'Smoke test main features',
      'Check console for warnings',
      'Review error tracking'
    );
  }

  return strategy;
}
