import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders lesson/course Markdown with portal styling. Links open in a new tab. */
export default function Markdown({ content, className = "" }: { content: string; className?: string }) {
  return (
    <div className={`hth-prose ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
