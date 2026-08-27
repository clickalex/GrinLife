import { useEffect } from "react";

/**
 * Keeps `<title>` and the meta description in step with the current route.
 *
 * A single-page app ships one `<title>` in `index.html`, so without this every
 * route opens a tab with the same name and every search result shows the same
 * blurb. Kept in the design system because it is chrome, not page content.
 */
export function useDocumentHead({ title, description }: { title: string; description?: string }) {
  useEffect(() => {
    document.title = title;

    if (!description) return;
    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.name = "description";
      document.head.appendChild(tag);
    }
    tag.content = description;
  }, [title, description]);
}
