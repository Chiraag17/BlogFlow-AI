import { ImageResponse } from "next/og";

export const alt =
  "BlogFlow AI — Research. Think. Publish. AI Content Research, Drafting & CMS Studio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "radial-gradient(circle at 80% 35%, #1E3D30 0%, #101E18 52%, #0A130F 100%)",
          color: "#F7F4EC",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* Top Brushed Brass Header Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #E5C98B 0%, #9E7832 100%)",
                color: "#0F1713",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: 700,
              }}
            >
              B
            </div>
            <span
              style={{
                fontSize: "26px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#F7F4EC",
              }}
            >
              BlogFlow AI
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 18px",
              borderRadius: "999px",
              border: "1px solid rgba(229, 201, 139, 0.45)",
              background: "rgba(229, 201, 139, 0.12)",
              color: "#E5C98B",
              fontSize: "15px",
              fontFamily: "sans-serif",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            AI Editorial &amp; SEO Studio
          </div>
        </div>

        {/* Center Headline & Value Proposition */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              fontSize: "78px",
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#F7F4EC",
              display: "flex",
              flexWrap: "wrap",
              gap: "18px",
            }}
          >
            <span>Research.</span>
            <span>Think.</span>
            <span style={{ color: "#E5C98B", fontStyle: "italic" }}>
              Publish.
            </span>
          </div>

          <div
            style={{
              fontSize: "26px",
              lineHeight: 1.45,
              color: "#C8D4CD",
              fontFamily: "sans-serif",
              maxWidth: "860px",
            }}
          >
            Transform any topic or website into citation-grounded, SEO-optimized
            articles with live web research, editorial review, and one-click
            WordPress publishing.
          </div>
        </div>

        {/* Bottom Telemetry & Capability Pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "28px",
            borderTop: "1px solid rgba(229, 201, 139, 0.28)",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                background: "rgba(22, 63, 50, 0.65)",
                border: "1px solid rgba(184, 213, 197, 0.3)",
                color: "#F7F4EC",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              01 · Live Tavily Citations
            </div>
            <div
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                background: "rgba(22, 63, 50, 0.65)",
                border: "1px solid rgba(184, 213, 197, 0.3)",
                color: "#F7F4EC",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              02 · 94+ On-Page SEO Score
            </div>
            <div
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                background: "rgba(22, 63, 50, 0.65)",
                border: "1px solid rgba(184, 213, 197, 0.3)",
                color: "#F7F4EC",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              03 · Encrypted WordPress Sync
            </div>
          </div>

          <div
            style={{
              fontSize: "17px",
              fontWeight: 700,
              color: "#E5C98B",
            }}
          >
            ★★★★★ 4.9/5 · 2,400+ Teams
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
