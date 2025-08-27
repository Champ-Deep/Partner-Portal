/**
 * Database Service
 * Following SOLID principles: Single Responsibility for database operations
 */

import sql from "@/app/api/utils/sql";
import { BaseService, ValidationError } from "./BaseService.js";

export class DatabaseService extends BaseService {
  constructor() {
    super();
  }

  /**
   * Get or create organization for authenticated user
   */
  async getOrCreateUserOrganization(authUser) {
    if (!authUser?.id) {
      throw new ValidationError("Valid authenticated user required");
    }

    try {
      // First check if user already exists in our users table
      const existingUser = await sql`
        SELECT u.*, o.id as organization_id, o.name as organization_name, o.slug as organization_slug
        FROM users u 
        JOIN organizations o ON u.organization_id = o.id
        WHERE u.email = ${authUser.email}
        LIMIT 1
      `;

      if (existingUser.length > 0) {
        return {
          user: existingUser[0],
          organization: {
            id: existingUser[0].organization_id,
            name: existingUser[0].organization_name,
            slug: existingUser[0].organization_slug,
          },
        };
      }

      // Create new organization for new user
      const organizationSlug = this.generateSlug(
        authUser.name || authUser.email,
      );

      // Use transaction to ensure atomicity
      const [organization, user] = await sql.transaction([
        sql`
          INSERT INTO organizations (name, slug)
          VALUES (${authUser.name || authUser.email}, ${organizationSlug})
          RETURNING *
        `,
        sql`
          INSERT INTO users (organization_id, email, name, role, status)
          VALUES (
            (SELECT id FROM organizations WHERE slug = ${organizationSlug}),
            ${authUser.email},
            ${authUser.name},
            'admin',
            'active'
          )
          RETURNING *
        `,
      ]);

      return {
        user: user[0],
        organization: organization[0],
      };
    } catch (error) {
      console.error("Error getting/creating user organization:", error);
      throw error;
    }
  }

  /**
   * Get user context with organization
   */
  async getUserContext(authUser) {
    const context = await this.getOrCreateUserOrganization(authUser);
    return {
      userId: context.user.id,
      organizationId: context.organization.id,
      userRole: context.user.role,
      userStatus: context.user.status,
      organizationName: context.organization.name,
    };
  }

  /**
   * Enrichment Jobs Operations
   */
  async createEnrichmentJob({
    userId,
    organizationId,
    name,
    inputFileUrl,
    columnMapping,
    totalRecords,
  }) {
    this.validateRequired(
      { userId, organizationId, name, inputFileUrl, columnMapping },
      ["userId", "organizationId", "name", "inputFileUrl", "columnMapping"],
    );

    const job = await sql`
      INSERT INTO enrichment_jobs (
        organization_id,
        user_id,
        name,
        status,
        input_file_url,
        column_mapping,
        total_records,
        progress,
        processed_records
      ) VALUES (
        ${organizationId},
        ${userId},
        ${name},
        'pending',
        ${inputFileUrl},
        ${JSON.stringify(columnMapping)},
        ${totalRecords || 0},
        0,
        0
      )
      RETURNING *
    `;

    return job[0];
  }

  async getEnrichmentJobs(organizationId, limit = 50) {
    return await sql`
      SELECT 
        id,
        name,
        status,
        input_file_url,
        output_file_url,
        column_mapping,
        progress,
        total_records,
        processed_records,
        error_message,
        created_at,
        updated_at
      FROM enrichment_jobs 
      WHERE organization_id = ${organizationId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  }

  async getEnrichmentJob(jobId, organizationId) {
    const jobs = await sql`
      SELECT 
        id,
        name,
        status,
        input_file_url,
        output_file_url,
        column_mapping,
        progress,
        total_records,
        processed_records,
        error_message,
        created_at,
        updated_at
      FROM enrichment_jobs 
      WHERE id = ${jobId} AND organization_id = ${organizationId}
      LIMIT 1
    `;

    return jobs[0] || null;
  }

  async updateEnrichmentJob(jobId, updates) {
    const allowedFields = [
      "status",
      "progress",
      "processed_records",
      "output_file_url",
      "error_message",
    ];

    const updateFields = [];
    const updateValues = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${updateValues.length + 1}`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    updateFields.push(`updated_at = NOW()`);

    const query = `
      UPDATE enrichment_jobs 
      SET ${updateFields.join(", ")}
      WHERE id = $${updateValues.length + 1}
      RETURNING *
    `;

    const result = await sql(query, [...updateValues, jobId]);
    return result[0];
  }

  /**
   * ICP Filters Operations
   */
  async createICPFilter({
    userId,
    organizationId,
    name,
    description,
    filters,
    estimatedCount,
  }) {
    this.validateRequired({ userId, organizationId, name, filters }, [
      "userId",
      "organizationId",
      "name",
      "filters",
    ]);

    const filter = await sql`
      INSERT INTO icp_filters (
        organization_id,
        user_id,
        name,
        description,
        filters,
        estimated_count
      ) VALUES (
        ${organizationId},
        ${userId},
        ${name},
        ${description || ""},
        ${JSON.stringify(filters)},
        ${estimatedCount || 0}
      )
      RETURNING *
    `;

    return filter[0];
  }

  async getICPFilters(organizationId, limit = 50) {
    return await sql`
      SELECT 
        id,
        name,
        description,
        filters,
        estimated_count,
        created_at,
        updated_at
      FROM icp_filters 
      WHERE organization_id = ${organizationId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  }

  async updateICPFilter(filterId, organizationId, updates) {
    const allowedFields = ["name", "description", "filters", "estimated_count"];

    const updateFields = [];
    const updateValues = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${updateValues.length + 1}`);
        updateValues.push(key === "filters" ? JSON.stringify(value) : value);
      }
    });

    if (updateFields.length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    updateFields.push(`updated_at = NOW()`);

    const query = `
      UPDATE icp_filters 
      SET ${updateFields.join(", ")}
      WHERE id = $${updateValues.length + 1} AND organization_id = $${updateValues.length + 2}
      RETURNING *
    `;

    const result = await sql(query, [
      ...updateValues,
      filterId,
      organizationId,
    ]);
    return result[0];
  }

  /**
   * Data Segments Operations
   */
  async createDataSegment({
    organizationId,
    name,
    description,
    category,
    pricePerRecord,
    totalRecords,
    metadata,
  }) {
    this.validateRequired({ organizationId, name, category, pricePerRecord }, [
      "organizationId",
      "name",
      "category",
      "pricePerRecord",
    ]);

    const segment = await sql`
      INSERT INTO data_segments (
        organization_id,
        name,
        description,
        category,
        price_per_record,
        total_records,
        metadata,
        is_active
      ) VALUES (
        ${organizationId},
        ${name},
        ${description || ""},
        ${category},
        ${pricePerRecord},
        ${totalRecords || 0},
        ${JSON.stringify(metadata || {})},
        true
      )
      RETURNING *
    `;

    return segment[0];
  }

  async getDataSegments(organizationId = null, activeOnly = true) {
    // Gracefully handle missing database configuration so callers can fallback
    if (!process.env.DATABASE_URL) {
      return [];
    }

    // Use explicit query variants instead of composing tagged templates
    if (organizationId && activeOnly) {
      return await sql`
        SELECT 
          id,
          organization_id,
          name,
          description,
          category,
          price_per_record,
          total_records,
          metadata,
          is_active,
          created_at,
          updated_at
        FROM data_segments 
        WHERE organization_id = ${organizationId} AND is_active = true
        ORDER BY created_at DESC
      `;
    }

    if (organizationId && !activeOnly) {
      return await sql`
        SELECT 
          id,
          organization_id,
          name,
          description,
          category,
          price_per_record,
          total_records,
          metadata,
          is_active,
          created_at,
          updated_at
        FROM data_segments 
        WHERE organization_id = ${organizationId}
        ORDER BY created_at DESC
      `;
    }

    if (!organizationId && activeOnly) {
      return await sql`
        SELECT 
          id,
          organization_id,
          name,
          description,
          category,
          price_per_record,
          total_records,
          metadata,
          is_active,
          created_at,
          updated_at
        FROM data_segments 
        WHERE is_active = true
        ORDER BY created_at DESC
      `;
    }

    return await sql`
      SELECT 
        id,
        organization_id,
        name,
        description,
        category,
        price_per_record,
        total_records,
        metadata,
        is_active,
        created_at,
        updated_at
      FROM data_segments 
      ORDER BY created_at DESC
    `;
  }

  /**
   * Campaigns Operations
   */
  async createCampaign({
    userId,
    organizationId,
    name,
    description,
    targetAudience,
    startDate,
    endDate,
  }) {
    this.validateRequired({ userId, organizationId, name }, [
      "userId",
      "organizationId",
      "name",
    ]);

    const campaign = await sql`
      INSERT INTO campaigns (
        organization_id,
        user_id,
        name,
        description,
        status,
        target_audience,
        start_date,
        end_date
      ) VALUES (
        ${organizationId},
        ${userId},
        ${name},
        ${description || ""},
        'draft',
        ${JSON.stringify(targetAudience || {})},
        ${startDate || null},
        ${endDate || null}
      )
      RETURNING *
    `;

    return campaign[0];
  }

  async getCampaigns(organizationId, limit = 50) {
    return await sql`
      SELECT 
        id,
        name,
        description,
        status,
        target_audience,
        metrics,
        start_date,
        end_date,
        created_at,
        updated_at
      FROM campaigns 
      WHERE organization_id = ${organizationId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  }

  /**
   * Audit Logging
   */
  async logAuditEvent({
    organizationId,
    userId,
    action,
    resourceType,
    resourceId,
    oldValues,
    newValues,
    ipAddress,
    userAgent,
  }) {
    await sql`
      INSERT INTO audit_logs (
        organization_id,
        user_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        ip_address,
        user_agent
      ) VALUES (
        ${organizationId},
        ${userId || null},
        ${action},
        ${resourceType},
        ${resourceId || null},
        ${oldValues ? JSON.stringify(oldValues) : null},
        ${newValues ? JSON.stringify(newValues) : null},
        ${ipAddress || null},
        ${userAgent || null}
      )
    `;
  }

  /**
   * Utility Functions
   */
  generateSlug(text) {
    return (
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim() +
      "-" +
      Math.random().toString(36).substr(2, 9)
    );
  }

  /**
   * Health check for database connection
   */
  async healthCheck() {
    try {
      const result = await sql`SELECT 1 as status`;
      return { status: "healthy", timestamp: new Date() };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date(),
      };
    }
  }
}

export const databaseService = new DatabaseService();
