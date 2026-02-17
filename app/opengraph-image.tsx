import { ImageResponse } from "next/og";

export const alt = "Optinest Digital - Small Web Design & SEO Agency";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(125deg, #f7de46 0%, #ffd86a 32%, #ffb457 70%, #ff5f4a 100%)",
          color: "#111"
        }}
      >
        <div
          style={{
            border: "4px solid #111",
            borderRadius: 28,
            padding: "20px 34px",
            background: "#f5f6ef",
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            boxShadow: "12px 12px 0 #111"
          }}
        >
          Optinest Digital
        </div>
        <div
          style={{
            marginTop: 44,
            fontSize: 92,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: -2,
            textTransform: "uppercase",
            textAlign: "center",
            textShadow: "8px 8px 0 rgba(0,0,0,0.15)"
          }}
        >
          Web Design & SEO
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: 1,
            textAlign: "center"
          }}
        >
          That Drives Growth
        </div>
      </div>
    ),
    size
  );
}
