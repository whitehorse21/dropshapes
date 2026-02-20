import { NextResponse } from 'next/server';

export function middleware(request) {
  // Special handling for discussions API routes
  if (request.nextUrl.pathname.includes('/discussions')) {
    // Check if this is a request for a specific discussion by ID
    const pathParts = request.nextUrl.pathname.split('/');
    const discussionIndex = pathParts.findIndex(part => part === 'discussions');
    
    if (discussionIndex !== -1 && discussionIndex < pathParts.length - 1) {
      const discussionId = pathParts[discussionIndex + 1];
      
      // If this is a numeric ID, it's a specific discussion request
      if (discussionId && /^\d+$/.test(discussionId)) {
        console.log(`Handling discussion request for ID: ${discussionId}`);
        
        // For GET requests to specific discussions that might 404,
        // remember to handle them specially in the client
        if (request.method === 'GET') {
          // We'll add a special header to indicate this is a discussion by ID request
          // so our frontend can handle it properly
          const response = NextResponse.next();
          response.headers.set('X-Discussion-ID', discussionId);
          return response;
        }
      }
    }
    
    // For regular discussions paths without trailing slash, add one
    if (!request.nextUrl.pathname.endsWith('/')) {
      // Add trailing slash to prevent redirects that cause CORS issues
      const url = request.nextUrl.clone();
      url.pathname = `${url.pathname}/`;
      
      // Don't redirect preflight requests as browsers don't follow redirects for OPTIONS
      if (request.method === 'OPTIONS') {
        return NextResponse.next();
      }
      
      return NextResponse.redirect(url, 308); // 308 is a permanent redirect preserving the method
    }
  }

  // Handle trailing slashes for both /proxy-api/ and /api/ routes to prevent redirects
  if ((request.nextUrl.pathname.startsWith('/proxy-api/') || request.nextUrl.pathname.startsWith('/api/')) && 
      !request.nextUrl.pathname.endsWith('/')) {
    // Redirect to the same URL but with a trailing slash to prevent server-side redirects
    const url = request.nextUrl.clone();
    url.pathname = `${url.pathname}/`;
    
    // Don't redirect preflight requests as browsers don't follow redirects for OPTIONS
    if (request.method === 'OPTIONS') {
      return NextResponse.next();
    }
    
    return NextResponse.redirect(url, 308); // 308 is a permanent redirect preserving the method
  }
  
  const origin = request.headers.get('origin') || '*';  
  const allowedOrigins = process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000', 'https://localhost:3000'] 
    : ['https://www.dropshapes.com'];
    
  // Always allow localhost in development mode
  const allowOrigin = allowedOrigins.includes(origin) ? origin : 
    (process.env.NODE_ENV === 'development' ? '*' : null);

  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 }); // No content needed for OPTIONS
    
    // Set CORS headers for preflight requests
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', allowOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Handle-As-API, DNT, User-Agent, If-Modified-Since, Cache-Control, Range');
    // Cache preflight responses
    response.headers.set('Access-Control-Max-Age', '86400');
    
    return response;
  }

  // For normal requests
  const response = NextResponse.next();
  
  // Add CORS headers to normal requests too
  if (allowOrigin) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', allowOrigin);
    
    // Also add Access-Control-Allow-Methods for normal requests
    if (request.nextUrl.pathname.startsWith('/proxy-api/')) {
      response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
    }
  }

  return response;
}

export const config = {
  // Apply this middleware to API routes and proxy routes
  matcher: ['/api/:path*', '/proxy-api/:path*'],
};
