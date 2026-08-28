/**
 * `@grin/ui` — the GrinLife design system.
 *
 * The Lantern Trail tokens, primitives, patterns and hooks shared by every Grin
 * front-end. Nothing in here knows about GrinLife's copy: content arrives as props
 * from `@grin/content`, which is what lets two (and later three) sites share one
 * implementation instead of four copies of it.
 */

// Tokens — imported by each app's CSS entry as `@grin/ui/styles/tokens.css`.

// lib
export { cn, slugify, sectionId } from "./lib/cn";
export { accents, accentOf, accentStyles, type Accent } from "./lib/accent";

// hooks
export { useReducedMotion } from "./hooks/useReducedMotion";
export { useLocalStorage } from "./hooks/useLocalStorage";
export { useLocale } from "./hooks/useLocale";
export { useMediaQuery } from "./hooks/useMediaQuery";
export { useScrollSpy } from "./hooks/useScrollSpy";
export { useInView } from "./hooks/useInView";
export { useDocumentHead } from "./hooks/useDocumentHead";

// primitives
export { Container } from "./primitives/Container";
export { Section } from "./primitives/Section";
export { Eyebrow, Heading, Lede, Prose } from "./primitives/Typography";
export { Button, ButtonLink, buttonStyles } from "./primitives/Button";
export { Badge, StatusBadge } from "./primitives/Badge";
export { Card, CardHeader, CardTitle, CardBody } from "./primitives/Card";
export { Callout, type CalloutTone } from "./primitives/Callout";
export { DataTable, TermTable } from "./primitives/DataTable";
export { Stat, StatGrid } from "./primitives/Stat";
export { Accordion, type AccordionItem } from "./primitives/Accordion";
export { Tabs, type TabItem } from "./primitives/Tabs";
export { PrintButton } from "./primitives/PrintButton";
export { LanguageSwitch } from "./primitives/LanguageSwitch";
export { SkipLink } from "./primitives/SkipLink";
export { Reveal } from "./primitives/Reveal";
export { ErrorBoundary } from "./primitives/ErrorBoundary";

// patterns
export { Lantern, TrailLink } from "./patterns/Lantern";
export { SiteHeader, type NavLink } from "./patterns/SiteHeader";
export { SiteFooter, type FooterColumn } from "./patterns/SiteFooter";
export { PageHero } from "./patterns/PageHero";
export { SectionRail, SectionChips, type ChapterItem } from "./patterns/SectionRail";
export {
  DualViewProvider,
  DualViewToggle,
  DualView,
  ChildView,
  ParentView,
  useDualView,
  type ViewMode,
} from "./patterns/DualView";
export { GateCard } from "./patterns/GateCard";
export { GateBoard } from "./patterns/GateBoard";
export { GateTimeline } from "./patterns/GateTimeline";
export { IntentMeter } from "./patterns/IntentMeter";
export { CostCalculator } from "./patterns/CostCalculator";
export { ProcedureChecklist } from "./patterns/ProcedureChecklist";
export { ConsentSheet } from "./patterns/ConsentSheet";
export { UnitEconomicsTable } from "./patterns/UnitEconomicsTable";
export { PhaseCard } from "./patterns/PhaseCard";
export { RelayChart } from "./patterns/RelayChart";
export { SpineMatrix } from "./patterns/SpineMatrix";
export { MetricTable } from "./patterns/MetricTable";
export { RiskTable } from "./patterns/RiskTable";
export { PricingTable } from "./patterns/PricingTable";
export { Sources } from "./patterns/Sources";
export { ProductCard } from "./patterns/ProductCard";
export { ProductSite, type ProductSiteProps } from "./patterns/ProductSite";
