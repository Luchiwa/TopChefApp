import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #8C2612 0%, #A83318 55%, #C95A1A 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 22,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            color: "rgba(245, 239, 224, 0.75)",
            fontSize: 13,
            letterSpacing: 6,
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          Top
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#F5EFE0",
            fontSize: 110,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: -4,
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
          }}
        >
          C
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            color: "rgba(245, 239, 224, 0.75)",
            fontSize: 13,
            letterSpacing: 5,
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          Chef
        </div>
      </div>
    ),
    { ...size },
  );
}
