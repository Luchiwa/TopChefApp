import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
            top: 80,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            color: "rgba(245, 239, 224, 0.75)",
            fontSize: 34,
            letterSpacing: 18,
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
            fontSize: 300,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: -12,
            textShadow: "0 4px 24px rgba(0, 0, 0, 0.25)",
          }}
        >
          C
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 84,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "rgba(245, 239, 224, 0.75)",
            fontSize: 34,
            letterSpacing: 14,
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          Chef
        </div>

        <div
          style={{
            position: "absolute",
            top: 152,
            left: 176,
            right: 176,
            height: 2,
            background: "rgba(245, 239, 224, 0.35)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 152,
            left: 176,
            right: 176,
            height: 2,
            background: "rgba(245, 239, 224, 0.35)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
