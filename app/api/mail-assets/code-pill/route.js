import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";

const MINT = "#c8f5e8";
const BLACK = "#080808";

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .slice(0, 24)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "") || "A1B2C3";
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = normalizeCode(searchParams.get("code"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            borderRadius: "999px",
            background: MINT,
            color: BLACK,
            fontSize: 42,
            fontWeight: 400,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            fontFamily: "Arial",
          }}
        >
          {code}
        </div>
      </div>
    ),
    {
      width: 720,
      height: 112,
    }
  );
}
