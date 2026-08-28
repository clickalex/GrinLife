import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import {
  DualViewProvider,
  DualViewToggle,
  ErrorBoundary,
  LanguageSwitch,
  SiteFooter,
  SiteHeader,
  SkipLink,
  useDocumentHead,
  useLocale,
} from "@grin/ui";
import { navFor, pageDescriptionFor, pageTitleFor, portfolio } from "@grin/content";
import { Link, usePath } from "./router";
import Home from "./pages/Home";
import Roadmap from "./pages/Roadmap";
import Spine from "./pages/Spine";
import Gates from "./pages/Gates";
import Docs from "./pages/Docs";
import Legacy from "./pages/Legacy";
import Social from "./pages/Social";
import Serendipity from "./pages/Serendipity";
import Accessibility from "./pages/Accessibility";
import NotFound from "./pages/NotFound";

const footerColumns = [
  {
    title: "Portfolio",
    links: [
      { label: "Overview", href: "/" },
      { label: "36-month roadmap", href: "/roadmap" },
      { label: "Kill gates", href: "/gates" },
      { label: "Shared spine", href: "/spine" },
      { label: "Source documents", href: "/docs" },
    ],
  },
  {
    title: "About this site",
    links: [{ label: "Accessibility", href: "/accessibility" }],
  },
  {
    title: "Endorsed products",
    links: [
      { label: "Grin Legacy · Wave 1", href: "/products/legacy" },
      { label: "GrinSocial · Wave 2", href: "/products/social" },
    ],
  },
  {
    title: "Quarantined",
    links: [{ label: "Serendipity · Wave 3", href: "/products/serendipity" }],
  },
];

/** Returns the reader to the top when they navigate to a new trail stop. */
function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location]);
  return null;
}

export default function App() {
  const path = usePath();
  const [locale, setLocale] = useLocale();

  // Nine routes share one HTML shell; the head and the language have to follow the router.
  useDocumentHead({ title: pageTitleFor(path), description: pageDescriptionFor(path), path });

  return (
    <ErrorBoundary>
      <DualViewProvider>
        <SkipLink />
        <ScrollToTop />

        <SiteHeader
          brand={portfolio.name}
          tagline="Three products · one spine"
          links={navFor(locale)}
          currentPath={path}
          Link={Link}
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <LanguageSwitch locale={locale} onChange={setLocale} />
              <DualViewToggle />
            </div>
          }
        />

        <main id="main">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/roadmap" component={Roadmap} />
            <Route path="/gates" component={Gates} />
            <Route path="/spine" component={Spine} />
            <Route path="/docs" component={Docs} />
            <Route path="/accessibility" component={Accessibility} />
            <Route path="/products/legacy" component={Legacy} />
            <Route path="/products/social" component={Social} />
            <Route path="/products/serendipity" component={Serendipity} />
            <Route component={NotFound} />
          </Switch>
        </main>

        <SiteFooter
          brand={portfolio.name}
          blurb={portfolio.brandEssence}
          columns={footerColumns}
          legal={`Grin portfolio plan · ${portfolio.documentDate} · Serendipity is planned as a separate legal entity with its own brand; its plan is published here as part of this portfolio.`}
          Link={Link}
        />
      </DualViewProvider>
    </ErrorBoundary>
  );
}
