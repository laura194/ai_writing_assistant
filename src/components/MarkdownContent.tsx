import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownContentProps {
  content: string;
}

/**
 * Component for rendering Markdown content with Tailwind styling.
 */
const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mt-2">{children}</p>,
        strong: ({ children }) => (
          <strong className="font-bold">{children}</strong>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-5 mt-2">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 mt-2">{children}</ol>
        ),
        li: ({ children }) => <li className="mt-1">{children}</li>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownContent;
