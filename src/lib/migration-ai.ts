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
        'Native event system changes',
      ],
      migrationSteps: [
        'Remove any event.persist() calls - they are no longer needed',
        'Update any code that relies on synchronous event access',
        'Review useEffect cleanup functions for async timing issues',
        'Test all event handlers thoroughly',
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
        'New lib.d.ts updates',
        'Better const type inference',
        'Decorator changes',
        'Module resolution improvements',
      ],
      migrationSteps: [
        'Update tsconfig.json for new module resolution',
        'Review const type parameter usage',
        'Update decorator usage if applicable',
        'Recompile all TypeScript code',
      ],
      codeExamples: [],
      commonIssues: [
        {
          issue: 'Module resolution errors',
          solution: 'Update moduleResolution in tsconfig.json to "bundler" for modern tools',
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

  // Generic AI-powered analysis based on version gap
  const majorDiff = toMajor - fromMajor;
  
  if (majorDiff >= 3) {
    changes.push(`Massive API overhaul expected - ${majorDiff} major versions ahead`);
    changes.push('Core architecture may have completely changed');
    changes.push('Deprecated features from old versions definitely removed');
    changes.push('New features and patterns introduced across multiple versions');
    changes.push('Consider migrating incrementally: one major version at a time');
  } else if (majorDiff === 2) {
    changes.push('Significant API changes across 2 major versions');
    changes.push('Multiple deprecated features removed');
    changes.push('Core functionality may work differently');
    changes.push('Plugin/extension ecosystem may have changed');
  } else if (majorDiff === 1) {
    changes.push('Breaking API changes in this major release');
    changes.push('Some deprecated features from previous version removed');
    changes.push('New recommended patterns may be introduced');
    changes.push('Configuration changes may be required');
  }

  // Add common breaking change patterns
  changes.push('Minimum supported runtime versions may have increased (Node.js, browsers)');
  changes.push('Peer dependencies may have been updated');
  changes.push('Default behavior changes possible');
  
  return changes;
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

  // Generic examples based on package type
  if (packageName.includes('react') || packageName.includes('vue') || packageName.includes('@angular')) {
    return [
      {
        before: `// Old import style\nimport ${packageName.split('/').pop()} from '${packageName}';`,
        after: `// Check official docs for new import style\nimport { /* specific exports */ } from '${packageName}';`,
        reason: 'Major versions often restructure exports for better tree-shaking',
      },
    ];
  }

  return [];
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

  // Generic common issues
  return [
    {
      issue: 'Module not found or import errors after upgrade',
      solution: `Delete node_modules and package-lock.json, then run:\nnpm install\nnpm install ${packageName}@${toVersion}`,
    },
    {
      issue: 'TypeScript compilation errors',
      solution: `Update type definitions:\nnpm install --save-dev @types/${packageName}@latest\nAlso check if tsconfig.json needs updates for compatibility`,
    },
    {
      issue: 'Deprecated API warnings in console',
      solution: `Review the official migration guide at:\nhttps://www.npmjs.com/package/${packageName}\nReplace deprecated APIs with new recommended patterns`,
    },
    {
      issue: 'Tests failing after upgrade',
      solution: 'Update test utilities and mocks. Many packages change their testing API in major versions. Check test library compatibility.',
    },
    {
      issue: 'Build errors with bundler (Webpack/Vite/etc)',
      solution: 'Update your bundler configuration. Major package updates often require bundler config changes for proper module resolution.',
    },
    {
      issue: 'Runtime errors in production',
      solution: 'Ensure all peer dependencies are updated. Run: npm ls to check for version conflicts.',
    },
    {
      issue: `Peer dependency conflicts with ${packageName}@${toVersion}`,
      solution: 'Use npm ls to identify conflicts, then update conflicting packages. May need to update multiple packages together.',
    },
  ];
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

  // Generic detailed steps
  const steps: string[] = [
    `Read the official ${packageName} changelog thoroughly`,
    'Identify all breaking changes that affect your codebase',
    'Create a list of files that need updating',
  ];

  if (toMajor - fromMajor > 1) {
    steps.push('Consider migrating one major version at a time for safer upgrade');
  }

  steps.push(
    'Update all imports and API calls',
    'Run linter and fix all errors',
    'Update test assertions for new behavior',
    'Test all critical user flows manually',
    'Check bundle size impact',
    'Review performance impact'
  );

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
