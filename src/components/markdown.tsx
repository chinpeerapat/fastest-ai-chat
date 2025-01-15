import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Custom syntax highlighting theme
const customTheme = {
    ...atomDark,
    'comment': { color: '#7c858c' },
    'function': { color: '#61afef' },
    'keyword': { color: '#c678dd' },
    'string': { color: '#98c379' },
    'number': { color: '#d19a66' },
    'class-name': { color: '#e5c07b' },
    'operator': { color: '#56b6c2' },
    'linenumber': { color: '#636d83' },
    'background': { background: '#282c34' }
};
import { Link } from 'lucide-react';

const MarkdownRenderer = ({ content }: {
    content: string
}) => {
    // Custom styles for the code blocks
    const customStyle = {
        backgroundColor: '#1e1e1e',
        padding: '1rem',
        borderRadius: '0.5rem',
        margin: '1rem 0',
        fontSize: '0.9rem',
        lineHeight: '1.5',
    };

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                // Enhanced code block rendering
                code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';

                    if (!inline && match) {
                        return (
                            <div className="relative group">
                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => navigator.clipboard.writeText(String(children))}
                                        className="text-gray-400 hover:text-white bg-gray-800 rounded p-1"
                                        title="Copy code"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="absolute left-2 top-2 text-xs text-gray-500 font-mono">
                                    {language}
                                </div>
                                <SyntaxHighlighter
                                    style={customTheme}
                                    language={language}
                                    customStyle={{
                                        ...customStyle,
                                        background: '#282c34',
                                        padding: '1.5rem',
                                        fontSize: '0.875rem',
                                        lineHeight: '1.25rem'
                                    }}
                                    showLineNumbers={true}
                                    {...props}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            </div>
                        );
                    }
                    return (
                        <code className="bg-gray-800 text-gray-200 rounded px-1 py-0.5" {...props}>
                            {children}
                        </code>
                    );
                },
                // Enhanced link rendering
                a({ node, children, href, ...props }) {
                    return (
                        <a
                            href={href}
                            className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                        >
                            {children}
                            <Link className="h-3 w-3" />
                        </a>
                    );
                },
                // Enhanced heading rendering
                h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>,
                // Enhanced paragraph rendering
                p: ({ children }) => <p className="my-3 leading-relaxed text-gray-800">{children}</p>,
                // Enhanced list rendering
                ul: ({ children }) => <ul className="list-disc list-inside my-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside my-3 space-y-1">{children}</ol>,
                // Enhanced blockquote rendering
                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-600 pl-4 my-3 italic">
                        {children}
                    </blockquote>
                ),
            }}
            className="prose prose-invert max-w-none 
        prose-headings:font-semibold
        prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300
        prose-strong:text-white
        prose-code:text-gray-200 prose-code:bg-gray-800 prose-code:rounded prose-code:px-1 prose-code:py-0.5
        prose-pre:bg-[#1e1e1e] prose-pre:border prose-pre:border-gray-800
        prose-blockquote:border-l-4 prose-blockquote:border-gray-600 prose-blockquote:pl-4 prose-blockquote:italic
        prose-ul:list-disc prose-ul:list-inside
        prose-ol:list-decimal prose-ol:list-inside"
        >
            {content}
        </ReactMarkdown>
    );
};

export default MarkdownRenderer;
