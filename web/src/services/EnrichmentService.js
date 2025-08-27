/**
 * Data Enrichment Service
 * Following SOLID principles: Single Responsibility for data enrichment
 */

import { BaseService, APIKeyError, ValidationError } from './BaseService.js';
import config from '@/config/environment.js';

export class EnrichmentService extends BaseService {
  constructor() {
    super();
  }

  /**
   * Enrich a single contact record
   */
  async enrichContact(contact) {
    this.validateRequired(contact, ['email']);
    
    const enrichedData = { ...contact };
    const enrichmentResults = {};

    try {
      // Email validation (if API key available)
      if (config.apis.emailCheck.enabled) {
        const emailData = await this.validateEmail(contact.email);
        enrichedData.email_valid = emailData.valid;
        enrichedData.email_deliverable = emailData.deliverable;
        enrichmentResults.email_validation = emailData;
      }

      // Company enrichment (if company name or domain available)
      if (contact.company_name || contact.company_domain) {
        const companyData = await this.enrichCompany({
          name: contact.company_name,
          domain: contact.company_domain
        });
        Object.assign(enrichedData, companyData);
        enrichmentResults.company_enrichment = companyData;
      }

      // Business data lookup (if local business API available)
      if (config.apis.localBusiness.enabled && (contact.company_name || contact.phone)) {
        const businessData = await this.enrichLocalBusiness({
          name: contact.company_name,
          phone: contact.phone,
          location: contact.location
        });
        Object.assign(enrichedData, businessData);
        enrichmentResults.business_data = businessData;
      }

      // Social media enrichment
      if (contact.first_name && contact.last_name && contact.company_name) {
        const socialData = await this.enrichSocialProfiles({
          firstName: contact.first_name,
          lastName: contact.last_name,
          company: contact.company_name
        });
        Object.assign(enrichedData, socialData);
        enrichmentResults.social_profiles = socialData;
      }

      enrichedData.enrichment_timestamp = new Date().toISOString();
      enrichedData.enrichment_sources = Object.keys(enrichmentResults);

      return {
        success: true,
        data: enrichedData,
        enrichment_details: enrichmentResults
      };

    } catch (error) {
      console.error('Contact enrichment failed:', error);
      return {
        success: false,
        data: contact,
        error: error.message,
        enrichment_details: enrichmentResults
      };
    }
  }

  /**
   * Email validation using external API
   */
  async validateEmail(email) {
    if (!config.apis.emailCheck.enabled) {
      throw new APIKeyError('email validation');
    }

    try {
      await this.checkRateLimit('email_validation', config.limits.maxApiCallsPerMinute);

      const response = await this.makeRequest(
        'https://api.emailvalidation.io/v1/email',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apis.emailCheck.key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        }
      );

      return {
        valid: response.valid || false,
        deliverable: response.deliverable || false,
        reason: response.reason || 'unknown',
        risk_score: response.risk_score || null,
        provider: response.provider || null
      };

    } catch (error) {
      console.error('Email validation failed:', error);
      return {
        valid: null,
        deliverable: null,
        reason: 'validation_failed',
        error: error.message
      };
    }
  }

  /**
   * Company enrichment using domain and business data
   */
  async enrichCompany({ name, domain }) {
    const companyData = {};

    try {
      // Domain WHOIS lookup
      if (domain && config.apis.whois.enabled) {
        const whoisData = await this.getWhoisData(domain);
        companyData.domain_info = whoisData;
        companyData.company_age_years = whoisData.age_years;
      }

      // Lake B2B company lookup
      if (name && config.apis.lakeB2B.enabled) {
        const lakeData = await this.getLakeB2BCompanyData(name);
        Object.assign(companyData, lakeData);
      }

      // Web scraping for additional data
      if (domain && config.apis.webScraper.enabled) {
        const webData = await this.scrapeCompanyWebsite(domain);
        companyData.website_info = webData;
      }

      return companyData;

    } catch (error) {
      console.error('Company enrichment failed:', error);
      return { enrichment_error: error.message };
    }
  }

  /**
   * WHOIS domain lookup
   */
  async getWhoisData(domain) {
    if (!config.apis.whois.enabled) {
      throw new APIKeyError('WHOIS lookup');
    }

    try {
      const response = await this.makeRequest(
        `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${config.apis.whois.key}&domainName=${domain}&outputFormat=JSON`
      );

      const whoisRecord = response.WhoisRecord;
      const createdDate = new Date(whoisRecord.createdDate);
      const ageYears = (new Date() - createdDate) / (1000 * 60 * 60 * 24 * 365);

      return {
        created_date: whoisRecord.createdDate,
        updated_date: whoisRecord.updatedDate,
        expires_date: whoisRecord.expiresDate,
        registrar: whoisRecord.registrarName,
        age_years: Math.floor(ageYears),
        nameservers: whoisRecord.nameServers?.hostNames || []
      };

    } catch (error) {
      console.error('WHOIS lookup failed:', error);
      throw error;
    }
  }

  /**
   * Lake B2B company data lookup
   */
  async getLakeB2BCompanyData(companyName) {
    if (!config.apis.lakeB2B.enabled) {
      throw new APIKeyError('Lake B2B');
    }

    try {
      const response = await this.makeRequest(
        `${config.apis.lakeB2B.baseUrl}/company/search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apis.lakeB2B.key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            company_name: companyName,
            limit: 1
          })
        }
      );

      if (response.results && response.results.length > 0) {
        const company = response.results[0];
        return {
          company_size: company.employee_count,
          industry: company.industry,
          revenue: company.annual_revenue,
          company_description: company.description,
          headquarters: company.headquarters,
          founded_year: company.founded_year,
          technologies: company.technologies || []
        };
      }

      return {};

    } catch (error) {
      console.error('Lake B2B lookup failed:', error);
      throw error;
    }
  }

  /**
   * Local business data enrichment
   */
  async enrichLocalBusiness({ name, phone, location }) {
    if (!config.apis.localBusiness.enabled) {
      throw new APIKeyError('local business data');
    }

    try {
      const searchParams = new URLSearchParams();
      if (name) searchParams.append('query', name);
      if (phone) searchParams.append('phone', phone);
      if (location) searchParams.append('location', location);

      const response = await this.makeRequest(
        `https://api.localbusinessdata.com/search?${searchParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${config.apis.localBusiness.key}`
          }
        }
      );

      if (response.results && response.results.length > 0) {
        const business = response.results[0];
        return {
          business_rating: business.rating,
          business_reviews_count: business.reviews_count,
          business_hours: business.hours,
          business_address: business.address,
          business_website: business.website,
          business_categories: business.categories || []
        };
      }

      return {};

    } catch (error) {
      console.error('Local business lookup failed:', error);
      throw error;
    }
  }

  /**
   * Social profile enrichment
   */
  async enrichSocialProfiles({ firstName, lastName, company }) {
    try {
      const profiles = {};

      // LinkedIn profile generation (heuristic-based)
      if (firstName && lastName && company) {
        const linkedinUrl = this.generateLinkedInUrl(firstName, lastName, company);
        profiles.linkedin_url = linkedinUrl;
      }

      // If web scraping is available, verify social profiles
      if (config.apis.webScraper.enabled) {
        const verifiedProfiles = await this.verifySocialProfiles(profiles);
        return { ...profiles, ...verifiedProfiles };
      }

      return profiles;

    } catch (error) {
      console.error('Social profile enrichment failed:', error);
      return {};
    }
  }

  /**
   * Generate LinkedIn URL heuristically
   */
  generateLinkedInUrl(firstName, lastName, company) {
    const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
    const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
    
    // Common LinkedIn username patterns
    const patterns = [
      `${cleanFirst}-${cleanLast}`,
      `${cleanFirst}${cleanLast}`,
      `${cleanFirst}.${cleanLast}`,
      `${cleanFirst[0]}${cleanLast}`
    ];

    // Return most likely pattern (first one)
    return `https://www.linkedin.com/in/${patterns[0]}/`;
  }

  /**
   * Website scraping for company information
   */
  async scrapeCompanyWebsite(domain) {
    if (!config.apis.webScraper.enabled) {
      throw new APIKeyError('web scraping');
    }

    try {
      const response = await this.makeRequest(
        'https://api.webscraper.io/scrape',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apis.webScraper.key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: `https://${domain}`,
            elements: [
              { selector: 'title', extract: 'text' },
              { selector: 'meta[name="description"]', extract: 'content' },
              { selector: 'h1', extract: 'text' },
              { selector: '.about, #about', extract: 'text' }
            ]
          })
        }
      );

      return {
        page_title: response.title,
        meta_description: response.description,
        main_heading: response.h1,
        about_text: response.about
      };

    } catch (error) {
      console.error('Website scraping failed:', error);
      throw error;
    }
  }

  /**
   * Batch enrichment for multiple contacts
   */
  async enrichBatch(contacts, options = {}) {
    const batchSize = options.batchSize || 10;
    const results = [];
    const errors = [];

    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      
      try {
        const batchPromises = batch.map(contact => this.enrichContact(contact));
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            errors.push({
              index: i + index,
              contact: batch[index],
              error: result.reason.message
            });
          }
        });

        // Add delay between batches to respect rate limits
        if (i + batchSize < contacts.length) {
          await this.delay(1000);
        }

      } catch (error) {
        console.error(`Batch ${Math.floor(i / batchSize)} failed:`, error);
        errors.push({
          batch: Math.floor(i / batchSize),
          error: error.message
        });
      }
    }

    return {
      results,
      errors,
      total_processed: results.length,
      total_errors: errors.length
    };
  }
}

export const enrichmentService = new EnrichmentService();