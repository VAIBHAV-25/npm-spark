import { useState, useEffect } from 'react';
import { Code, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';

interface AICodeSnippetsProps {
  packageName: string;
  version: string;
}

interface CodeSnippet {
  title: string;
  description: string;
  code: string;
  language: string;
}

function generateCodeSnippets(packageName: string): CodeSnippet[] {
  const name = packageName.toLowerCase();
  
  if (name.includes('react') || name === 'react') {
    return [
      {
        title: 'Basic Component Setup',
        description: 'Import and use React in a functional component',
        code: `import React from '${packageName}';\n\nfunction MyComponent() {\n  const [count, setCount] = React.useState(0);\n\n  return (\n    <div>\n      <h1>Count: {count}</h1>\n      <button onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}\n\nexport default MyComponent;`,
        language: 'tsx',
      },
      {
        title: 'Using Hooks',
        description: 'Common React hooks pattern',
        code: `import { useState, useEffect } from '${packageName}';\n\nfunction DataFetcher() {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    fetch('/api/data')\n      .then(res => res.json())\n      .then(data => {\n        setData(data);\n        setLoading(false);\n      });\n  }, []);\n\n  if (loading) return <div>Loading...</div>;\n  return <div>{JSON.stringify(data)}</div>;\n}`,
        language: 'tsx',
      },
    ];
  }
  
  if (name.includes('express')) {
    return [
      {
        title: 'Basic Express Server',
        description: 'Create a simple Express.js server',
        code: `const express = require('${packageName}');\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.use(express.json());\n\napp.get('/', (req, res) => {\n  res.json({ message: 'Hello World!' });\n});\n\napp.listen(PORT, () => {\n  console.log(\`Server running on port \${PORT}\`);\n});`,
        language: 'javascript',
      },
      {
        title: 'RESTful API Routes',
        description: 'Create CRUD endpoints',
        code: `const express = require('${packageName}');\nconst router = express.Router();\n\nrouter.get('/items', (req, res) => {\n  res.json({ items: [] });\n});\n\nrouter.post('/items', (req, res) => {\n  const newItem = req.body;\n  res.status(201).json(newItem);\n});\n\nrouter.put('/items/:id', (req, res) => {\n  const { id } = req.params;\n  res.json({ id, ...req.body });\n});\n\nrouter.delete('/items/:id', (req, res) => {\n  res.status(204).send();\n});\n\nmodule.exports = router;`,
        language: 'javascript',
      },
    ];
  }
  
  if (name.includes('axios')) {
    return [
      {
        title: 'Basic GET Request',
        description: 'Fetch data from an API',
        code: `import axios from '${packageName}';\n\nasync function fetchData() {\n  try {\n    const response = await axios.get('https://api.example.com/data');\n    console.log(response.data);\n    return response.data;\n  } catch (error) {\n    console.error('Error fetching data:', error);\n    throw error;\n  }\n}`,
        language: 'typescript',
      },
      {
        title: 'POST Request with Headers',
        description: 'Send data with authentication',
        code: `import axios from '${packageName}';\n\nasync function createUser(userData) {\n  try {\n    const response = await axios.post(\n      'https://api.example.com/users',\n      userData,\n      {\n        headers: {\n          'Content-Type': 'application/json',\n          'Authorization': \`Bearer \${token}\`\n        }\n      }\n    );\n    return response.data;\n  } catch (error) {\n    console.error('Error creating user:', error.response?.data);\n    throw error;\n  }\n}`,
        language: 'typescript',
      },
    ];
  }

  return [
    {
      title: 'Basic Installation & Import',
      description: 'Get started with this package',
      code: `// Install the package\nnpm install ${packageName}\n\n// Import in your project\nimport ${packageName.split('/').pop()?.replace(/-/g, '')} from '${packageName}';\n\n// or with CommonJS\nconst ${packageName.split('/').pop()?.replace(/-/g, '')} = require('${packageName}');`,
      language: 'javascript',
    },
    {
      title: 'Basic Usage Example',
      description: 'Simple implementation example',
      code: `import ${packageName.split('/').pop()?.replace(/-/g, '')} from '${packageName}';\n\n// Initialize or use the package\nconst instance = new ${packageName.split('/').pop()?.replace(/-/g, '')}();\n\n// Use the functionality\ninstance.someMethod();\n\n// Or call directly if it's a function\n${packageName.split('/').pop()?.replace(/-/g, '')}();`,
      language: 'javascript',
    },
    {
      title: 'Advanced Configuration',
      description: 'Configure with options',
      code: `import ${packageName.split('/').pop()?.replace(/-/g, '')} from '${packageName}';\n\nconst config = {\n  option1: 'value1',\n  option2: true,\n  option3: {\n    nested: 'config'\n  }\n};\n\nconst instance = new ${packageName.split('/').pop()?.replace(/-/g, '')}(config);\n\n// Use with configuration\ninstance.execute();`,
      language: 'typescript',
    },
  ];
}

export function AICodeSnippets({ packageName, version }: AICodeSnippetsProps) {
  const [snippets, setSnippets] = useState<CodeSnippet[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const generated = generateCodeSnippets(packageName);
    setSnippets(generated);
  }, [packageName]);

  const copyToClipboard = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!snippets) {
    return null;
  }

  return (
    <div className="glass-card p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Code className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">AI Code Snippet Generator</h3>
            <p className="text-xs text-muted-foreground">Ready-to-use code examples for v{version}</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-primary/10 rounded-full">
          <span className="text-xs font-semibold text-primary">{snippets.length} Examples</span>
        </div>
      </div>

      <div className="space-y-4">
        {snippets.map((snippet, index) => (
          <div key={index} className="p-4 bg-muted/30 border border-border rounded-lg hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-foreground mb-1">{snippet.title}</h4>
                <p className="text-xs text-muted-foreground">{snippet.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(snippet.code, index)}
                className="gap-2 shrink-0"
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute top-2 right-2 px-2 py-1 bg-primary/20 rounded text-xs font-mono text-primary">
                {snippet.language}
              </div>
              <pre className="p-4 bg-background rounded-lg border border-border overflow-x-auto">
                <code className="text-sm font-mono text-foreground">{snippet.code}</code>
              </pre>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
        💡 Always refer to the official documentation for the most up-to-date usage patterns
      </div>
    </div>
  );
}
