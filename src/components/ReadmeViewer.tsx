import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ReadmeViewerProps {
  content: string;
  packageName?: string;
}

export function ReadmeViewer({ content, packageName }: ReadmeViewerProps) {
  // Fix relative image URLs to use unpkg
  const processedContent = content.replace(
    /!\[([^\]]*)\]\((?!http)([^)]+)\)/g,
    (_, alt, src) => {
      if (packageName) {
        return `![${alt}](https://unpkg.com/${packageName}/${src})`;
      }
      return `![${alt}](${src})`;
    }
  );

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !className;
            
            if (isInline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }

            return (
              <SyntaxHighlighter
                style={oneDark}
                language={match?.[1] || 'text'}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
