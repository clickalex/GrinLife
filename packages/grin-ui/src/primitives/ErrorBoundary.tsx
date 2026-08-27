import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Fallback content. Defaults to a plain recovery message. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Keeps a render failure in one section from blanking the whole site.
 * The original scaffold's audit listed "an intermittent blank-render symptom" as a
 * known defect; this is the shared guard against it.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface it in the console; a real deployment would forward it to monitoring.
    console.error("[grin-ui] Render error:", error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div
        role="alert"
        style={{
          margin: "3rem auto",
          maxWidth: "38rem",
          padding: "1.5rem",
          borderRadius: "0.9rem",
          border: "1px solid rgba(0,0,0,0.12)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem" }}>This section could not be drawn</h2>
        <p style={{ margin: "0 0 1rem", opacity: 0.75 }}>
          The rest of the page is still readable. Reloading usually clears it.
        </p>
        <button
          type="button"
          onClick={this.reset}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "999px",
            border: "1px solid rgba(0,0,0,0.2)",
            background: "transparent",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Try again
        </button>
      </div>
    );
  }
}
