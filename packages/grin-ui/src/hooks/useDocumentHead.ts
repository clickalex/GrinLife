import { useEffect } from "react";

/**
 * Keeps `<title>` and the meta description in step with the current route.
 *
 * A single-page app ships one `<title>` in `index.html`, so without this every
 * route opens a tab with the same name and every search result shows the same
 * blurb. Kept in the design system because it is chrome, not page content.
 */
export function useDocumentHead({
  title,
  description,
  path,
}: {
  title: string;
  description?: string;
  /** Route path, used for the canonical link and og:url. */
  path?: string;
}) {
  useEffect(() => {
    document.title = title;

    const upsertMeta = (attr: "name" | "property", key: string, content: string) => {
      let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
    }
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:type", "website");

    if (path && typeof window !== "undefined") {
      const url = `${window.location.origin}${path === "/" ? "/" : path}`;
      upsertMeta("property", "og:url", url);

      let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = url;
    }
  }, [title, description, path]);
}
