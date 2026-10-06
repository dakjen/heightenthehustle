/**
 * Plain video embed (YouTube / Vimeo / Loom). No third-party script needed, so it
 * renders even with ad blockers. The caption link under each video is the fallback
 * if a video ever refuses to play inside the page.
 */
export default function VideoEmbed({ embed, title, className = "" }: { embed: string; url?: string; title: string; className?: string }) {
  return (
    <iframe
      src={embed}
      title={title}
      className={`absolute inset-0 h-full w-full ${className}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
