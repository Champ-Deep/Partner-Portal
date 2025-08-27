/**
 * Base Service Class
 * Following SOLID principles: Interface Segregation & Dependency Inversion
 */

export class BaseService {
  constructor(config = {}) {
    this.config = config;
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;
  }

  /**
   * Generic HTTP request with retry logic and error handling
   */
  async makeRequest(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, defaultOptions);
        
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorBody}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }
        
        return await response.text();
      } catch (error) {
        console.error(`Request attempt ${attempt} failed:`, error);
        
        if (attempt === this.retryAttempts) {
          throw new ServiceError(
            `Request failed after ${this.retryAttempts} attempts: ${error.message}`,
            'REQUEST_FAILED',
            { originalError: error, url, options: defaultOptions }
          );
        }
        
        // Wait before retry
        await this.delay(this.retryDelay * attempt);
      }
    }
  }

  /**
   * Validate required parameters
   */
  validateRequired(params, requiredFields) {
    const missing = requiredFields.filter(field => !params[field]);
    if (missing.length > 0) {
      throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Sanitize and validate data
   */
  sanitizeData(data, schema) {
    const sanitized = {};
    for (const [key, config] of Object.entries(schema)) {
      const value = data[key];
      
      if (config.required && (value === undefined || value === null)) {
        throw new ValidationError(`${key} is required`);
      }
      
      if (value !== undefined && value !== null) {
        sanitized[key] = this.applyValidation(value, config);
      }
    }
    return sanitized;
  }

  /**
   * Apply validation rules
   */
  applyValidation(value, config) {
    if (config.type === 'email' && !this.isValidEmail(value)) {
      throw new ValidationError(`Invalid email format: ${value}`);
    }
    
    if (config.type === 'url' && !this.isValidUrl(value)) {
      throw new ValidationError(`Invalid URL format: ${value}`);
    }
    
    if (config.maxLength && value.length > config.maxLength) {
      throw new ValidationError(`Value exceeds maximum length of ${config.maxLength}`);
    }
    
    return value;
  }

  /**
   * Utility methods
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Rate limiting helper
   */
  async checkRateLimit(key, limit, windowMs = 60000) {
    // Simple in-memory rate limiting
    if (!this.rateLimitStore) {
      this.rateLimitStore = new Map();
    }

    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.rateLimitStore.has(key)) {
      this.rateLimitStore.set(key, []);
    }
    
    const requests = this.rateLimitStore.get(key);
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    if (validRequests.length >= limit) {
      throw new RateLimitError(`Rate limit exceeded for ${key}`);
    }
    
    validRequests.push(now);
    this.rateLimitStore.set(key, validRequests);
  }
}

/**
 * Custom Error Classes
 */
export class ServiceError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_FAILED';
  }
}

export class RateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RateLimitError';
    this.code = 'RATE_LIMIT_EXCEEDED';
  }
}

export class APIKeyError extends Error {
  constructor(service) {
    super(`API key not configured for ${service}`);
    this.name = 'APIKeyError';
    this.code = 'API_KEY_MISSING';
    this.service = service;
  }
}