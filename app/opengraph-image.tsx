import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Flourish — Sourdough Baking Companion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1c0f03 0%, #2d1a06 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "#b45309",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <div style={{ fontSize: 48, color: "#fff", fontWeight: 800, lineHeight: 1 }}>F</div>
        </div>

        {/* App name */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: "#fef3c7",
            letterSpacing: "-2px",
            marginBottom: 16,
            lineHeight: 1,
          }}
        >
          Flourish
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "#d97706",
            fontWeight: 500,
            marginBottom: 32,
          }}
        >
          Your sourdough baking companion
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 16 }}>
          {["Save Recipes", "Track Bakes", "Monitor Your Starter"].map((label) => (
            <div
              key={label}
              style={{
                background: "rgba(180, 83, 9, 0.2)",
                border: "1px solid rgba(180, 83, 9, 0.4)",
                borderRadius: 100,
                padding: "8px 20px",
                fontSize: 20,
                color: "#fbbf24",
                fontWeight: 500,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
