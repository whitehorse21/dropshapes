// Utility to test API connectivity
export const testAPIConnection = async (baseURL) => {
  try {
    const testURL = `${baseURL}health/` || `${baseURL}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(testURL, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      url: testURL
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.name,
      url: baseURL
    };
  }
};

// Test multiple API endpoints to find a working one
export const findWorkingAPI = async (urls) => {
  const results = [];
  
  for (const url of urls) {
    console.log(`Testing API connection to: ${url}`);
    const result = await testAPIConnection(url);
    results.push({ url, ...result });
    
    if (result.success) {
      console.log(`✅ Successfully connected to: ${url}`);
      return { success: true, workingURL: url, results };
    } else {
      console.log(`❌ Failed to connect to: ${url}`, result.error);
    }
  }
  
  console.log('❌ No working API endpoints found');
  return { success: false, workingURL: null, results };
};

// Predefined API URLs to test
export const API_URLS = [
  'https://api.www.dropshapes.com/api/',
  'https://flying-raven-gladly.ngrok-free.app/api/',
  'http://localhost:8000/api/',
  'http://127.0.0.1:8000/api/',
];

// Auto-detect working API
export const autoDetectAPI = async () => {
  console.log('🔍 Auto-detecting working API endpoint...');
  const result = await findWorkingAPI(API_URLS);
  
  if (result.success) {
    console.log(`🎉 Found working API: ${result.workingURL}`);
    return result.workingURL;
  } else {
    console.error('💥 No working API endpoints found. Using default.');
    return API_URLS[0]; // Fallback to the first URL
  }
};
