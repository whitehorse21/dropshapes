import { NextResponse } from "next/server";

/**
 * This is a custom API endpoint that handles fetching individual discussions
 * It works around the issue where the backend API returns 404 for individual discussion endpoints
 * but returns a list of discussions at the /discussions/ endpoint
 */
export async function GET(request, { params }) {
  const discussionId = params.id;

  // Use environment variable for the API URL, or default to production
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://api.www.dropshapes.com";

  let baseUrl = apiUrl;

  // Ensure URL ends with /api/
  if (!baseUrl.endsWith("/api/")) {
    if (baseUrl.endsWith("/api")) {
      baseUrl += "/";
    } else if (baseUrl.endsWith("/")) {
      baseUrl += "api/";
    } else {
      baseUrl += "/api/";
    }
  }

  // Normalize URL to avoid domain resolution errors
  if (baseUrl.includes("www.www.")) {
    baseUrl = baseUrl.replace("www.www.", "www.");
  }

  try {
    // First fetch all discussions and then filter for the one we need
    const discussionsUrl = `${baseUrl}discussions/`;

    console.log(`Fetching from: ${discussionsUrl}`);

    // Fetch the discussions list
    const response = await fetch(discussionsUrl, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-cache", // Don't cache this request
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch discussions list: ${response.status} ${response.statusText}`,
      );
      return NextResponse.json(
        {
          error: "Failed to fetch discussions list",
          statusCode: response.status,
        },
        { status: response.status },
      );
    }

    // Parse the list of discussions
    const discussions = await response.json();

    // Find the discussion with matching ID
    const discussion = discussions.find(
      (d) => d.id.toString() === discussionId.toString(),
    );

    if (!discussion) {
      console.error(
        `Discussion ID ${discussionId} not found in list of ${discussions.length} discussions`,
      );
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 },
      );
    }

    // Return the found discussion
    return NextResponse.json(discussion);
  } catch (error) {
    console.error("Error fetching discussion:", error);

    return NextResponse.json(
      { error: `Failed to fetch discussion: ${error.message}` },
      { status: 500 },
    );
  }
}
