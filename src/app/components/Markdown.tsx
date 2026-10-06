import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toEmbedUrl } from "@/lib/video";
import VideoEmbed from "./VideoEmbed";

interface VideoItem { title: string; url: string; embed: string; caption: string }
type Block = { kind: "md"; text: string } | { kind: "videos"; items: VideoItem[] };

const LIST_LINE = /^\s*(?:[-*+]|\d+[.)])\s+/;
const VIDEO_LINE = /^\s*(?:[-*+]|\d+[.)])\s+\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\s*(.*)$/;

/**
 * Splits Markdown into blocks. Each contiguous list is examined: its video links
 * (YouTube / Vimeo / Loom) are pulled into one grid of embedded players with
 * captions, and any remaining non-video items stay as a normal list after it.
 */
function splitVideoBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  let md: string[] = [];
  let list: string[] = [];
  const flushMd = () => { if (md.length) { blocks.push({ kind: "md", text: md.join("\n") }); md = []; } };
  const flushList = () => {
    if (!list.length) return;
    const videos: VideoItem[] = [];
    const rest: string[] = [];
    for (const line of list) {
      const m = line.match(VIDEO_LINE);
      const embed = m ? toEmbedUrl(m[2]) : null;
      if (m && embed) videos.push({ title: m[1].trim(), url: m[2], embed, caption: m[3].replace(/^\s*[—–-]\s*/, "").trim() });
      else rest.push(line);
    }
    if (videos.length) {
      flushMd();
      blocks.push({ kind: "videos", items: videos });
      if (rest.length) blocks.push({ kind: "md", text: rest.join("\n") });
    } else {
      md.push(...list);
    }
    list = [];
  };

  for (const line of content.split("\n")) {
    if (LIST_LINE.test(line)) list.push(line);
    else { flushList(); md.push(line); }
  }
  flushList();
  flushMd();
  return blocks;
}

function VideoGrid({ items }: { items: VideoItem[] }) {
  return (
    <div className="hth-video-list">
      {items.map((v) => (
        <figure key={v.embed} className="hth-video-card">
          <figcaption>
            <a href={v.url} target="_blank" rel="noopener noreferrer">{v.title}</a>
            {v.caption && <span className="hth-video-source">, {v.caption}</span>}
          </figcaption>
          <div className="hth-video-frame">
            <VideoEmbed embed={v.embed} url={v.url} title={v.title} />
          </div>
        </figure>
      ))}
    </div>
  );
}

/**
 * Renders lesson/course Markdown with portal styling. Links open in a new tab.
 * List items that link to YouTube / Vimeo / Loom become embedded players with captions.
 */
export default function Markdown({ content, className = "", embedVideos = true }: { content: string; className?: string; embedVideos?: boolean }) {
  const blocks = embedVideos ? splitVideoBlocks(content) : [{ kind: "md", text: content } as Block];
  return (
    <div className={`hth-prose ${className}`}>
      {blocks.map((b, i) =>
        b.kind === "videos" ? (
          <VideoGrid key={i} items={b.items} />
        ) : (
          <ReactMarkdown
            key={i}
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
            }}
          >
            {b.text}
          </ReactMarkdown>
        ),
      )}
    </div>
  );
}
