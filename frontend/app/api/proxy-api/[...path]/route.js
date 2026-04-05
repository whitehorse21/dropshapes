import { NextRequest, NextResponse } from "next/server";

/**
 * Robust proxy API route to handle CORS issues with the backend API
 * Uses multiple strategies to avoid redirect loops
 */

// Ensure trailing slash so path concatenation doesn't produce e.g. .../apiadmin/users
const rawBase =
  process.env.NEXT_PUBLIC_API_URL || "https://api.www.dropshapes.com/api/";
const API_BASE_URL = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

export async function GET(request, context) {
  const params = await context.params;
  return handleProxyRequest(request, params, "GET");
}

export async function POST(request, context) {
  const params = await context.params;
  return handleProxyRequest(request, params, "POST");
}

export async function PUT(request, context) {
  const params = await context.params;
  return handleProxyRequest(request, params, "PUT");
}

export async function DELETE(request, context) {
  const params = await context.params;
  return handleProxyRequest(request, params, "DELETE");
}

export async function PATCH(request, context) {
  const params = await context.params;
  return handleProxyRequest(request, params, "PATCH");
}

async function handleProxyRequest(request, params, method) {
  try {
    // Get the path from the dynamic route parameters
    const path = params?.path ? params.path.join("/") : "";

    console.log(`Proxy ${method} request for path: ${path}`);

    // For subscription endpoints, try different URL patterns to avoid redirects
    if (path.startsWith("subscriptions/")) {
      return await handleSubscriptionEndpoint(request, path, method);
    }

    // For other endpoints, use the standard approach
    return await handleStandardEndpoint(request, path, method);
  } catch (error) {
    console.error("Proxy request error:", error);

    // Provide more specific error information
    let status = 502;
    let errorMessage = "Proxy request failed";
    let details = "The proxy could not forward your request to the API server";

    if (error.message.includes("fetch")) {
      status = 503;
      errorMessage = "Service unavailable";
      details = "Unable to connect to the backend API server";
    } else if (error.message.includes("timeout")) {
      status = 504;
      errorMessage = "Gateway timeout";
      details = "The backend API server took too long to respond";
    }

    return NextResponse.json(
      {
        error: errorMessage,
        message: error.message,
        details,
        path: params?.path ? params.path.join("/") : "",
        timestamp: new Date().toISOString(),
      },
      { status },
    );
  }
}

async function handleSubscriptionEndpoint(request, path, method) {
  // API_BASE_URL has trailing slash so path joins correctly
  let apiUrl = `${API_BASE_URL}${path}`;

  // Don't add trailing slashes for subscription endpoints
  // as this may cause redirects that lead to loops

  // Preserve query parameters
  const url = new URL(request.url);
  if (url.search) {
    apiUrl += url.search;
  }

  console.log(`Subscription endpoint: ${path} -> ${apiUrl}`);

  try {
    const fetchOpts = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("authorization") || "",
        Accept: "application/json",
      },
      redirect: "manual",
    };
    if (["POST", "PUT", "PATCH"].includes(method)) {
      try {
        const body = await request.text();
        if (body) fetchOpts.body = body;
      } catch (_) {}
    }
    const response = await fetch(apiUrl, fetchOpts);

    console.log(
      `Subscription response: ${response.status} ${response.statusText}`,
    );

    // If we get a redirect, try the redirect URL once with protocol fix
    if ([301, 302, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (location) {
        console.log(`Handling subscription redirect: ${location}`);

        // Fix HTTP to HTTPS if needed
        const fixedLocation = location.startsWith("http://")
          ? location.replace("http://", "https://")
          : location;

        const redirectResponse = await fetch(fixedLocation, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: request.headers.get("authorization") || "",
            Accept: "application/json",
          },
          redirect: "manual", // Still don't follow further redirects
        });

        return createProxyResponse(redirectResponse);
      }
    }

    return createProxyResponse(response);
  } catch (error) {
    console.error(`Subscription endpoint error for ${path}:`, error);
    throw error;
  }
}

async function handleStandardEndpoint(request, path, method) {
  // API_BASE_URL is normalized to end with / so we get .../api/admin/users not .../apiadmin/users
  let apiUrl = `${API_BASE_URL}${path}`;

  // Don't add trailing slash for auth, admin, or paths that break on redirect (backend expects no slash)
  const noTrailingSlash = path.startsWith("auth/") || path.startsWith("admin/");
  if (!apiUrl.includes("?") && !apiUrl.endsWith("/") && !noTrailingSlash) {
    apiUrl += "/";
  }

  // Preserve query parameters
  const url = new URL(request.url);
  if (url.search) {
    apiUrl += url.search;
  }

  console.log(`Standard endpoint: ${path} -> ${apiUrl}`);

  const response = await makeApiRequest(request, apiUrl, method);

  // Handle redirects for standard endpoints (try once)
  if ([301, 302, 307, 308].includes(response.status)) {
    const location = response.headers.get("location");
    console.log(
      `Standard endpoint redirect: ${response.status} -> ${location}`,
    );

    if (location) {
      // Fix protocol if needed
      let fixedLocation = location.startsWith("http://")
        ? location.replace("http://", "https://")
        : location;

      try {
        const redirectResponse = await makeApiRequest(
          request,
          fixedLocation,
          method,
        );
        return createProxyResponse(redirectResponse);
      } catch (redirectError) {
        console.error("Redirect failed:", redirectError);
        return createProxyResponse(response); // Return original response
      }
    }
  }

  return createProxyResponse(response);
}

async function makeApiRequest(request, apiUrl, method) {
  // Prepare headers
  const headers = new Headers();

  // Copy relevant headers from the original request
  const headersToForward = [
    "authorization",
    "content-type",
    "accept",
    "user-agent",
    "x-requested-with",
  ];

  headersToForward.forEach((headerName) => {
    const headerValue = request.headers.get(headerName);
    if (headerValue) {
      headers.set(headerName, headerValue);
    }
  });

  // Ensure JSON content type for POST/PUT/PATCH
  if (
    !headers.has("content-type") &&
    ["POST", "PUT", "PATCH"].includes(method)
  ) {
    headers.set("content-type", "application/json");
  }
  // Prepare fetch options - NEVER follow redirects automatically
  const fetchOptions = {
    method,
    headers,
    redirect: "manual",
    // Add a timeout to prevent hanging requests
    signal: AbortSignal.timeout(10000), // 10 second timeout
  };

  // Add body for POST, PUT, PATCH requests
  if (["POST", "PUT", "PATCH"].includes(method)) {
    try {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    } catch (error) {
      console.warn("Error reading request body:", error);
    }
  }
  // Make the API request
  try {
    return await fetch(apiUrl, fetchOptions);
  } catch (fetchError) {
    console.error(`Fetch error for ${apiUrl}:`, fetchError);
    // Re-throw with more context
    const enhancedError = new Error(
      `Failed to fetch ${apiUrl}: ${fetchError.message}`,
    );
    enhancedError.originalError = fetchError;
    enhancedError.apiUrl = apiUrl;
    throw enhancedError;
  }
}

async function createProxyResponse(apiResponse) {
  try {
    // Get response body
    const responseText = await apiResponse.text();
    let responseData;

    // Try to parse as JSON, fallback to text
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    // Create response headers
    const responseHeaders = new Headers();

    // Copy important headers from the API response
    const headersToForward = [
      "content-type",
      "cache-control",
      "etag",
      "last-modified",
    ];

    headersToForward.forEach((headerName) => {
      const headerValue = apiResponse.headers.get(headerName);
      if (headerValue) {
        responseHeaders.set(headerName, headerValue);
      }
    });

    // Add CORS headers
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    );
    responseHeaders.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With",
    );
    responseHeaders.set("Access-Control-Allow-Credentials", "true");

    // Return the response
    return NextResponse.json(responseData, {
      status: apiResponse.status,
      statusText: apiResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Error creating proxy response:", error);

    return NextResponse.json(
      {
        error: "Failed to process API response",
        message: error.message,
      },
      { status: 500 },
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
    },
  });
}
