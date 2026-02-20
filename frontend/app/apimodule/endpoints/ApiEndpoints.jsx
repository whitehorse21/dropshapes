// ADD trailing slashes to prevent redirect issues with CORS
// The server is redirecting URLs without trailing slashes to ones with slashes,
// which causes CORS preflight issues
const formatEndpoint = (endpoint) => {
  // If endpoint doesn't end with a slash, add it
  if (!endpoint.endsWith('/')) {
    return `${endpoint}/`;
  }
  return endpoint;
};

// Special formatting for subscription endpoints to avoid redirects
const formatSubscriptionEndpoint = (endpoint) => {
  // For subscription endpoints, DON'T add trailing slashes
  // as they cause redirects which break CORS
  if (endpoint.endsWith('/')) {
    return endpoint.slice(0, -1);
  }
  return endpoint;
};

// Don't include api/ prefix as it's already part of the baseURL
const endpoints = {
  login: "auth/login", // Remove trailing slash for auth endpoints
  register: "auth/register", // Remove trailing slash for auth endpoints
  contactUs: formatEndpoint("contact"),
  logout: "auth/logout", // Remove trailing slash for auth endpoints
  courseUnits: formatEndpoint('course-units'),  
  assignments: formatEndpoint('assignments'),  
  discussions: formatEndpoint('discussions'),
  // Use our custom API endpoint for individual discussions to avoid 404 errors
  discussion: id => `/api/discussions/${id}`,
  resources: formatEndpoint('resources'),  
  
  // Subscription endpoints - these match the backend API routes
  subscriptions: formatSubscriptionEndpoint('subscriptions/plans'), // Get available plans
  subscriptionUsage: formatSubscriptionEndpoint('subscriptions/usage'), // Get usage data
  canCreateResume: formatSubscriptionEndpoint('subscriptions/can-create-resume'),
  canCreateCoverLetter: formatSubscriptionEndpoint('subscriptions/can-create-cover-letter'),
  mySubscription: formatSubscriptionEndpoint('subscriptions/my'), // Get current user's subscription
  subscribeToplan: formatSubscriptionEndpoint('subscriptions/subscribe'), // Subscribe to a plan  
  
  // Resume and cover letter endpoints
  resumes: 'resumes',
  coverLetters: formatEndpoint('cover-letters'),

  // AI Services endpoints
  ai: {
    // Text-to-Speech Service
    textToSpeech: {
      synthesize: formatEndpoint('ai/text-to-speech/synthesize'),
      voices: formatEndpoint('ai/text-to-speech/voices')
    },
    
    // Grammar Check Service
    grammarCheck: {
      check: formatEndpoint('ai/grammar-check/check'),
      improve: formatEndpoint('ai/grammar-check/improve')
    },
    
    // Task Management Service
    tasks: {
      add: formatEndpoint('ai/tasks/add'),
      update: id => formatEndpoint(`ai/tasks/${id}`),
      delete: id => formatEndpoint(`ai/tasks/${id}`),
      list: formatEndpoint('ai/tasks'),
      prioritize: formatEndpoint('ai/tasks/prioritize'),
      suggestions: formatEndpoint('ai/tasks/suggestions'),
      analytics: formatEndpoint('ai/tasks/analytics')
    },
    
    // Interview Training Service
    interview: {
      generateQuestion: formatEndpoint('ai/interview/generate-question'),
      evaluateAnswer: formatEndpoint('ai/interview/evaluate-answer'),
      transcribeAudio: formatEndpoint('ai/interview/transcribe-audio'),
      sessions: formatEndpoint('ai/interview/sessions')
    },
    
    // Professional Networking Service
    networking: {
      suggestConnections: formatEndpoint('ai/networking/suggest-connections'),
      generateMessage: formatEndpoint('ai/networking/generate-message'),
      analyzeProfile: formatEndpoint('ai/networking/analyze-profile'),
      opportunities: formatEndpoint('ai/networking/opportunities')
    }
  }
};

export default endpoints;
