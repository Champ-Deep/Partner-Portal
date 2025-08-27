/**
 * File Parser Service
 * Following SOLID principles: Single Responsibility for file parsing
 */

import { BaseService, ValidationError } from './BaseService.js';

export class FileParserService extends BaseService {
  constructor() {
    super();
    this.supportedFormats = ['csv', 'xlsx', 'xls'];
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
  }

  /**
   * Parse uploaded file and return structured data
   */
  async parseFile(fileUrl, fileName = '') {
    try {
      this.validateFileUrl(fileUrl);
      const fileExtension = this.getFileExtension(fileName || fileUrl);
      
      if (!this.supportedFormats.includes(fileExtension)) {
        throw new ValidationError(`Unsupported file format: ${fileExtension}`);
      }

      // Download file content
      const fileContent = await this.downloadFile(fileUrl);
      
      // Parse based on file type
      let parsedData;
      if (fileExtension === 'csv') {
        parsedData = await this.parseCSV(fileContent);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        parsedData = await this.parseExcel(fileContent);
      }

      // Validate and enhance parsed data
      const enhancedData = this.enhanceParseResults(parsedData);

      return {
        success: true,
        data: enhancedData,
        metadata: {
          fileName,
          fileSize: fileContent.length,
          fileType: fileExtension,
          rowCount: enhancedData.totalRows,
          columnCount: enhancedData.headers.length,
          parsedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('File parsing failed:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          fileName,
          parsedAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Download file from URL
   */
  async downloadFile(url) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > this.maxFileSize) {
        throw new ValidationError(`File too large. Maximum size: ${this.maxFileSize / 1024 / 1024}MB`);
      }

      return await response.text();

    } catch (error) {
      throw new Error(`File download failed: ${error.message}`);
    }
  }

  /**
   * Parse CSV content
   */
  async parseCSV(content) {
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new ValidationError('File appears to be empty');
    }

    // Detect delimiter
    const delimiter = this.detectCSVDelimiter(lines[0]);
    
    // Parse headers
    const headers = this.parseCSVLine(lines[0], delimiter);
    
    if (headers.length === 0) {
      throw new ValidationError('No headers found in CSV file');
    }

    // Parse sample data (first 5 rows)
    const sampleData = [];
    const maxSamples = Math.min(6, lines.length); // Skip header + 5 data rows max
    
    for (let i = 1; i < maxSamples; i++) {
      if (lines[i] && lines[i].trim()) {
        const row = this.parseCSVLine(lines[i], delimiter);
        const rowObject = {};
        
        headers.forEach((header, index) => {
          rowObject[header] = row[index] || '';
        });
        
        sampleData.push(rowObject);
      }
    }

    return {
      headers: headers.map(h => h.trim()),
      sampleData,
      totalRows: lines.length - 1, // Subtract header row
      delimiter
    };
  }

  /**
   * Parse Excel content (basic implementation)
   */
  async parseExcel(content) {
    // For a full implementation, you'd use a library like xlsx
    // This is a simplified mock implementation
    throw new ValidationError('Excel parsing requires additional setup. Please convert to CSV format.');
  }

  /**
   * Detect CSV delimiter
   */
  detectCSVDelimiter(firstLine) {
    const delimiters = [',', ';', '\t', '|'];
    let bestDelimiter = ',';
    let maxCount = 0;

    delimiters.forEach(delimiter => {
      const count = (firstLine.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
      if (count > maxCount) {
        maxCount = count;
        bestDelimiter = delimiter;
      }
    });

    return bestDelimiter;
  }

  /**
   * Parse a single CSV line handling quotes
   */
  parseCSVLine(line, delimiter = ',') {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // Field separator
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add last field
    result.push(current.trim());
    
    return result;
  }

  /**
   * Enhance parsed results with suggestions and validation
   */
  enhanceParseResults(parsedData) {
    const enhanced = { ...parsedData };
    
    // Generate field mapping suggestions
    enhanced.suggestedMapping = this.generateFieldMappingSuggestions(parsedData.headers);
    
    // Validate data quality
    enhanced.dataQuality = this.assessDataQuality(parsedData);
    
    // Detect data types
    enhanced.columnTypes = this.detectColumnTypes(parsedData);
    
    return enhanced;
  }

  /**
   * Generate intelligent field mapping suggestions
   */
  generateFieldMappingSuggestions(headers) {
    const suggestions = {};
    
    const mappingRules = {
      email: ['email', 'e-mail', 'email_address', 'mail', 'email address'],
      first_name: ['first_name', 'firstname', 'first name', 'fname', 'given_name'],
      last_name: ['last_name', 'lastname', 'last name', 'lname', 'surname', 'family_name'],
      company_name: ['company', 'company_name', 'organization', 'org', 'business', 'company name'],
      job_title: ['title', 'job_title', 'position', 'role', 'job title', 'job_position'],
      phone: ['phone', 'telephone', 'mobile', 'cell', 'phone_number', 'tel'],
      linkedin_url: ['linkedin', 'linkedin_url', 'linkedin profile', 'linkedin_profile'],
      industry: ['industry', 'sector', 'business_type'],
      location: ['location', 'address', 'city', 'country', 'region'],
      company_size: ['company_size', 'employees', 'employee_count', 'size']
    };

    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9_\s]/g, '').trim();
      
      for (const [fieldName, patterns] of Object.entries(mappingRules)) {
        if (patterns.some(pattern => normalizedHeader.includes(pattern))) {
          suggestions[fieldName] = header;
          break;
        }
      }
    });

    return suggestions;
  }

  /**
   * Assess data quality
   */
  assessDataQuality(parsedData) {
    const { headers, sampleData } = parsedData;
    const quality = {
      overall_score: 0,
      issues: [],
      recommendations: []
    };

    // Check for empty columns
    const emptyColumns = headers.filter(header => 
      sampleData.every(row => !row[header] || row[header].trim() === '')
    );

    if (emptyColumns.length > 0) {
      quality.issues.push(`Empty columns detected: ${emptyColumns.join(', ')}`);
      quality.recommendations.push('Consider removing empty columns before processing');
    }

    // Check for duplicate headers
    const duplicateHeaders = headers.filter((header, index) => 
      headers.indexOf(header) !== index
    );

    if (duplicateHeaders.length > 0) {
      quality.issues.push(`Duplicate headers detected: ${duplicateHeaders.join(', ')}`);
      quality.recommendations.push('Rename duplicate column headers');
    }

    // Check for email format in email-like columns
    const emailColumns = headers.filter(header => 
      header.toLowerCase().includes('email') || header.toLowerCase().includes('mail')
    );

    emailColumns.forEach(column => {
      const emailSamples = sampleData.map(row => row[column]).filter(Boolean);
      const validEmails = emailSamples.filter(email => this.isValidEmail(email));
      
      if (emailSamples.length > 0 && validEmails.length / emailSamples.length < 0.8) {
        quality.issues.push(`Poor email format in column: ${column}`);
        quality.recommendations.push('Clean email data before enrichment');
      }
    });

    // Calculate overall score
    const baseScore = 100;
    const issuesPenalty = quality.issues.length * 10;
    quality.overall_score = Math.max(0, baseScore - issuesPenalty);

    return quality;
  }

  /**
   * Detect column data types
   */
  detectColumnTypes(parsedData) {
    const { headers, sampleData } = parsedData;
    const types = {};

    headers.forEach(header => {
      const values = sampleData.map(row => row[header]).filter(Boolean);
      
      if (values.length === 0) {
        types[header] = 'unknown';
        return;
      }

      // Check for email
      if (values.some(value => this.isValidEmail(value))) {
        types[header] = 'email';
      }
      // Check for URL
      else if (values.some(value => this.isValidUrl(value))) {
        types[header] = 'url';
      }
      // Check for numbers
      else if (values.every(value => !isNaN(parseFloat(value)))) {
        types[header] = 'number';
      }
      // Check for dates
      else if (values.some(value => !isNaN(Date.parse(value)))) {
        types[header] = 'date';
      }
      // Default to text
      else {
        types[header] = 'text';
      }
    });

    return types;
  }

  /**
   * Validate file URL
   */
  validateFileUrl(url) {
    if (!url || typeof url !== 'string') {
      throw new ValidationError('Valid file URL is required');
    }

    try {
      new URL(url);
    } catch {
      throw new ValidationError('Invalid file URL format');
    }
  }

  /**
   * Get file extension from filename or URL
   */
  getFileExtension(fileName) {
    const match = fileName.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : '';
  }

  /**
   * Convert parsed data to standardized format for processing
   */
  convertToStandardFormat(parsedData, columnMapping) {
    const { sampleData } = parsedData;
    const standardized = [];

    sampleData.forEach(row => {
      const standardRow = {};
      
      Object.entries(columnMapping).forEach(([standardField, sourceColumn]) => {
        if (row[sourceColumn] !== undefined) {
          standardRow[standardField] = row[sourceColumn];
        }
      });

      standardized.push(standardRow);
    });

    return standardized;
  }
}

export const fileParserService = new FileParserService();