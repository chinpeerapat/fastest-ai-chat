import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Link } from 'lucide-react';

const MarkdownRenderer = ({ content }: { content: string }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';

                    if (!inline && match) {
                        return (
                            <div className="relative group my-4">
                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => navigator.clipboard.writeText(String(children))}
                                        className="text-gray-400 hover:text-white bg-gray-800/50 rounded p-1"
                                        title="Copy code"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                    </button>
                                </div>
                                {language && (
                                    <div className="absolute left-4 top-0 -translate-y-[calc(100%+2px)] text-xs text-gray-400 font-mono bg-[#1E1E1E] px-2 py-0.5 rounded-t-md border-x border-t border-gray-700">
                                        {language}
                                    </div>
                                )}
                                <div className="rounded-md overflow-hidden">
                                    <SyntaxHighlighter
                                        language={language}
                                        style={vscDarkPlus}
                                        customStyle={{
                                            margin: 0,
                                            padding: '1.5rem',
                                            background: '#1E1E1E',
                                            fontSize: '0.875rem',
                                            lineHeight: '1.25rem',
                                        }}
                                        showLineNumbers={true}
                                        wrapLines={true}
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <code className="bg-gray-800 text-gray-200 rounded px-1 py-0.5 text-sm" {...props}>
                            {children}
                        </code>
                    );
                },
                // Text content rendering
                p: ({ children }) => <p className="text-gray-200 my-3 leading-relaxed">{children}</p>,
                h1: ({ children }) => <h1 className="text-gray-100 text-2xl font-bold mt-6 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-gray-100 text-xl font-bold mt-5 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-gray-100 text-lg font-bold mt-4 mb-2">{children}</h3>,
                ul: ({ children }) => <ul className="text-gray-200 list-disc list-inside my-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="text-gray-200 list-decimal list-inside my-3 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-gray-200">{children}</li>,
                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-600 pl-4 my-3 italic text-gray-300">
                        {children}
                    </blockquote>
                ),
                a: ({ href, children }) => (
                    <a
                        href={href}
                        className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {children}
                        <Link className="h-3 w-3" />
                    </a>
                ),
                strong: ({ children }) => <strong className="text-gray-100 font-semibold">{children}</strong>,
                em: ({ children }) => <em className="text-gray-200 italic">{children}</em>,
            }}
            className="prose prose-invert max-w-none
                prose-p:text-gray-200
                prose-headings:text-gray-100
                prose-strong:text-gray-100
                prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300
                prose-code:text-gray-200
                prose-pre:bg-[#1E1E1E] prose-pre:border prose-pre:border-gray-700
                prose-blockquote:border-gray-600 prose-blockquote:text-gray-300
                prose-ul:text-gray-200 prose-ol:text-gray-200
                prose-li:text-gray-200"
        >
            {content}
        </ReactMarkdown>
    );
};

export default MarkdownRenderer;
