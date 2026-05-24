import { signInWithGoogle } from "@/hooks/useAuth";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z" />
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z" />
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z" />
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z" />
    </svg>
  );
}

function MockCard({
  severity,
  severityColor,
  category,
  title,
  sub,
  style,
}: {
  severity: string;
  severityColor: string;
  category: string;
  title: string;
  sub: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: 10,
        padding: "14px 16px",
        marginBottom: 8,
        width: 340,
        ...style,
      }}
    >
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <span
          style={{
            background: severityColor,
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 20,
            letterSpacing: "0.05em",
          }}
        >
          {severity}
        </span>
        <span
          style={{
            background: "rgba(255,255,255,0.18)",
            color: "rgba(255,255,255,0.85)",
            fontSize: 10,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 20,
          }}
        >
          {category}
        </span>
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>{title}</p>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: "4px 0 0" }}>{sub}</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F7F6F3",
        display: "flex",
      }}
    >
      {/* Left panel */}
      <div
        style={{
          width: "55%",
          background: "#FFFFFF",
          borderRight: "1px solid #E2DED7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 360 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#1A6B3C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#1C1917", letterSpacing: "-0.01em" }}>
              ReviewBot AI
            </span>
            <span
              style={{
                background: "#DCFCE7",
                color: "#166534",
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 20,
                letterSpacing: "0.04em",
              }}
            >
              AI
            </span>
          </div>

          {/* Heading */}
          <div style={{ marginTop: 48 }}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: "#1C1917",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Welcome back
            </h1>
            <p style={{ fontSize: 15, color: "#57534E", marginTop: 8, marginBottom: 0 }}>
              Sign in to start reviewing code smarter.
            </p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={signInWithGoogle}
            style={{
              marginTop: 40,
              width: 320,
              height: 44,
              background: "#FFFFFF",
              border: "1px solid #E2DED7",
              borderRadius: 10,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              color: "#1C1917",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = "#F7F6F3";
              el.style.borderColor = "#C8C3BA";
              el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "#FFFFFF";
              el.style.borderColor = "#E2DED7";
              el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.98)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div
            style={{
              marginTop: 24,
              display: "flex",
              alignItems: "center",
              gap: 0,
            }}
          >
            <div style={{ flex: 1, height: 1, background: "#E2DED7" }} />
            <span
              style={{
                fontSize: 12,
                color: "#A8A29E",
                background: "#FFFFFF",
                padding: "0 12px",
              }}
            >
              or
            </span>
            <div style={{ flex: 1, height: 1, background: "#E2DED7" }} />
          </div>

          {/* Terms */}
          <p
            style={{
              fontSize: 12,
              color: "#A8A29E",
              textAlign: "center",
              marginTop: 24,
            }}
          >
            By signing in you agree to our{" "}
            <a href="#" style={{ color: "#57534E", textDecoration: "none" }}
              onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
              onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
            >
              Terms
            </a>{" "}
            and{" "}
            <a href="#" style={{ color: "#57534E", textDecoration: "none" }}
              onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
              onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div
        style={{
          width: "45%",
          background: "#16A34A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 40px",
        }}
      >
        <div style={{ maxWidth: 380 }}>
          {/* Mock cards */}
          <MockCard
            severity="CRITICAL"
            severityColor="#DC2626"
            category="Security"
            title="SQL injection vulnerability"
            sub="Unsanitized input passed directly to query"
          />
          <MockCard
            severity="WARNING"
            severityColor="#D97706"
            category="Performance"
            title="N+1 query detected in loop"
            sub="Database called 847 times unnecessarily"
            style={{ marginLeft: 16, opacity: 0.85 }}
          />
          <MockCard
            severity="SUGGESTION"
            severityColor="#059669"
            category="Best Practice"
            title="Add error boundary for async calls"
            sub="Unhandled promise rejection risk"
            style={{ marginLeft: 32, opacity: 0.65 }}
          />

          {/* Headline */}
          <div style={{ marginTop: 32 }}>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: "#FFFFFF",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Catch bugs before they ship.
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.75)",
                marginTop: 8,
                marginBottom: 0,
              }}
            >
              AI-powered code review that finds what humans miss.
            </p>
          </div>

          {/* Stats */}
          <div
            style={{
              marginTop: 32,
              display: "flex",
              gap: 32,
            }}
          >
            {[
              { num: "2,400+", label: "PRs Reviewed" },
              { num: "94%", label: "Issues Caught" },
              { num: "60s", label: "Avg Review Time" },
            ].map(({ num, label }) => (
              <div key={label}>
                <div style={{ fontSize: 22, fontWeight: 600, color: "#FFFFFF" }}>{num}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
