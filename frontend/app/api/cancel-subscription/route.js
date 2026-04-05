import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/";

/**
 * POST /api/cancel-subscription
 * Same-origin route that proxies to backend to avoid CORS and ensure cancel works.
 * Expects Authorization: Bearer <token> on the request.
 */
export async function POST(request) {
  const auth = request.headers.get("authorization") || "";
  const url = `${API_BASE.replace(/\/+$/, "")}/subscriptions/cancel`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: auth,
      },
      body: JSON.stringify({}),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { detail: data?.detail ?? "Failed to cancel subscription" },
        { status: res.status },
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Cancel subscription proxy error:", err);
    return NextResponse.json(
      { detail: "Unable to reach the server. Please try again." },
      { status: 503 },
    );
  }
}
