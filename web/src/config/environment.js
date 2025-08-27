/**
 * Centralized Environment Configuration
 * Following SOLID principles: Single Responsibility for environment management
 */

// Validation helper
const required = (name) => {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
};

const optional = (name, defaultValue = null) => {
  return process.env[name] || defaultValue;
};

// Core Configuration
export const config = {
  // Database
  database: {
    url: required('DATABASE_URL'),
  },

  // Authentication
  auth: {
    secret: required('AUTH_SECRET'),
    url: required('AUTH_URL'),
  },

  // File Upload
  upload: {
    publicKey: required('UPLOADCARE_PUBLIC_KEY'),
    secretKey: required('UPLOADCARE_SECRET_KEY'),
  },

  // Environment
  environment: {
    nodeEnv: optional('NODE_ENV', 'development'),
    appEnv: optional('NEXT_PUBLIC_APP_ENV', 'development'),
    isDevelopment: optional('NODE_ENV', 'development') === 'development',
    isProduction: optional('NODE_ENV', 'development') === 'production',
  },

  // Feature Flags
  features: {
    realTimeEnrichment: optional('ENABLE_REAL_TIME_ENRICHMENT', 'true') === 'true',
    bulkProcessing: optional('ENABLE_BULK_PROCESSING', 'true') === 'true',
    aiSuggestions: optional('ENABLE_AI_SUGGESTIONS', 'true') === 'true',
    premiumFeatures: optional('ENABLE_PREMIUM_FEATURES', 'true') === 'true',
  },

  // Rate Limiting
  limits: {
    maxRecordsPerBatch: parseInt(optional('MAX_RECORDS_PER_BATCH', '10000')),
    maxApiCallsPerMinute: parseInt(optional('MAX_API_CALLS_PER_MINUTE', '100')),
  },

  // API Keys - Data Enrichment
  apis: {
    emailCheck: {
      key: optional('EMAIL_CHECK_API_KEY'),
      enabled: !!optional('EMAIL_CHECK_API_KEY'),
    },
    whois: {
      key: optional('WHOIS_API_KEY'),
      enabled: !!optional('WHOIS_API_KEY'),
    },
    lakeB2B: {
      key: optional('LAKE_B2B_API_KEY'),
      baseUrl: optional('LAKE_B2B_BASE_URL', 'https://api.lakeb2b.com/v1'),
      enabled: !!optional('LAKE_B2B_API_KEY'),
    },
    localBusiness: {
      key: optional('LOCAL_BUSINESS_DATA_API_KEY'),
      enabled: !!optional('LOCAL_BUSINESS_DATA_API_KEY'),
    },
    webScraper: {
      key: optional('WEB_SCRAPER_API_KEY'),
      enabled: !!optional('WEB_SCRAPER_API_KEY'),
    },
    openai: {
      key: optional('OPENAI_API_KEY'),
      model: optional('GPT_VISION_MODEL', 'gpt-4-vision-preview'),
      enabled: !!optional('OPENAI_API_KEY'),
    },
    seoKeyword: {
      key: optional('SEO_KEYWORD_API_KEY'),
      enabled: !!optional('SEO_KEYWORD_API_KEY'),
    },
    googleTranslate: {
      key: optional('GOOGLE_TRANSLATE_API_KEY'),
      enabled: !!optional('GOOGLE_TRANSLATE_API_KEY'),
    },
    googleMaps: {
      key: optional('GOOGLE_MAPS_API_KEY'),
      enabled: !!optional('GOOGLE_MAPS_API_KEY'),
    },
    fileConverter: {
      key: optional('FILE_CONVERTER_API_KEY'),
      enabled: !!optional('FILE_CONVERTER_API_KEY'),
    },
    resend: {
      key: optional('RESEND_API_KEY'),
      enabled: !!optional('RESEND_API_KEY'),
    },
  },

  // Webhook Configuration
  webhooks: {
    secret: optional('WEBHOOK_SECRET'),
  },
};

// Validation on import
if (config.environment.isProduction) {
  console.log('✅ Environment configuration loaded for production');
} else {
  console.log('🔧 Environment configuration loaded for development');
}

export default config;