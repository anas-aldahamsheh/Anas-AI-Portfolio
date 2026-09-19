import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 18,
          background: "linear-gradient(135deg, #09090b 0%, #1e1b4b 50%, #4338ca 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#38bdf8",
          borderRadius: "6px",
          fontWeight: 800,
          fontFamily: "system-ui, sans-serif",
          border: "1px solid rgba(56, 189, 248, 0.5)",
        }}
      >
        A
      </div>
    ),
    {
      ...size,
    }
  );
}
