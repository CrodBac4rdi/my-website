import { ImageResponse } from "next/og";

export const alt = "HORIZON — Anime Tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Gebrandetes Share-Bild (Cinematic Dark Glass) – ohne externes Asset.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(1200px 600px at 50% -10%, #14224d 0%, #060711 60%)",
          color: "#F3F5FB",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 104,
              height: 104,
              borderRadius: 26,
              background: "#2F5FE6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 68,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            H
          </div>
          <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -3 }}>HORIZON</div>
        </div>
        <div style={{ marginTop: 30, fontSize: 34, color: "#AAB1C4" }}>
          Dein Anime-Tracker · Entdecken · Tracken · Community
        </div>
      </div>
    ),
    { ...size }
  );
}
