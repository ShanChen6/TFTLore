/** Hiển thị HTML đã được lib/format.ts làm sạch (chỉ chứa <span>/<br> do ta sinh ra). */
export default function HtmlText({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
