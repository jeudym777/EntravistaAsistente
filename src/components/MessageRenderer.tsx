import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface MessageRendererProps {
  content: string;
}

export default function MessageRenderer({ content }: MessageRendererProps) {
  return (
    <div className="prose prose-invert max-w-none prose-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code block with syntax highlighting
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text';

            if (inline) {
              return (
                <code
                  className="bg-gray-800/50 text-orange-400 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-700/30"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <div className="my-2 rounded-lg overflow-hidden border border-gray-700/50">
                <div className="bg-gray-900 px-4 py-2 text-xs font-mono text-gray-500 border-b border-gray-700/50">
                  {language}
                </div>
                <SyntaxHighlighter
                  language={language}
                  style={atomDark}
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    backgroundColor: 'rgb(17, 24, 39)',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            );
          },

          // Paragraph with proper spacing
          p({ children }: any) {
            return <p className="my-2 text-gray-200 leading-relaxed">{children}</p>;
          },

          // List styling
          ul({ children }: any) {
            return <ul className="list-disc list-inside my-2 space-y-1 text-gray-200">{children}</ul>;
          },

          ol({ children }: any) {
            return <ol className="list-decimal list-inside my-2 space-y-1 text-gray-200">{children}</ol>;
          },

          li({ children }: any) {
            return <li className="text-gray-200">{children}</li>;
          },

          // Bold and italic
          strong({ children }: any) {
            return <strong className="font-bold text-gray-100">{children}</strong>;
          },

          em({ children }: any) {
            return <em className="italic text-gray-300">{children}</em>;
          },

          // Headings
          h1({ children }: any) {
            return <h1 className="text-lg font-bold my-3 text-blue-400">{children}</h1>;
          },

          h2({ children }: any) {
            return <h2 className="text-base font-bold my-2 text-blue-400">{children}</h2>;
          },

          h3({ children }: any) {
            return <h3 className="text-sm font-bold my-2 text-blue-400">{children}</h3>;
          },

          // Blockquote
          blockquote({ children }: any) {
            return (
              <blockquote className="border-l-4 border-blue-600/50 pl-4 my-2 text-gray-400 italic">
                {children}
              </blockquote>
            );
          },

          // Links
          a({ href, children }: any) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                {children}
              </a>
            );
          },

          // Horizontal rule
          hr() {
            return <hr className="my-3 border-gray-700/30" />;
          },

          // Table
          table({ children }: any) {
            return (
              <table className="my-2 border-collapse border border-gray-700/30 text-sm">
                {children}
              </table>
            );
          },

          thead({ children }: any) {
            return <thead className="bg-gray-800/50">{children}</thead>;
          },

          tbody({ children }: any) {
            return <tbody>{children}</tbody>;
          },

          tr({ children }: any) {
            return <tr className="border-b border-gray-700/30">{children}</tr>;
          },

          td({ children }: any) {
            return <td className="px-3 py-2 text-gray-300">{children}</td>;
          },

          th({ children }: any) {
            return <th className="px-3 py-2 text-gray-200 font-bold text-left">{children}</th>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
