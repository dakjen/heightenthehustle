import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toEmbedUrl } from "@/lib/video";

/**
 * Renders lesson/course Markdown with portal styling. Links open in a new tab.
 * Links to YouTube, Vimeo or Loom are rendered as an inline video player with
 * the link text as the caption, so "Required videos" lists play in place.
 */
export default function Markdown({ content, className = "", embedVideos = true }: { content: string; className?: string; embedVideos?: boolean }) {
  return (
    <div className={`hth-prose ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const embed = embedVideos && href ? toEmbedUrl(href) : null;
            if (embed) {
              return (
                <span className="hth-video">
                  <span className="hth-video-frame">
                    <iframe src={embed} title={typeof children === "string" ? children : "Video"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" />
                  </span>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="hth-video-caption">{children}</a>
                </span>
              );
            }
            return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
