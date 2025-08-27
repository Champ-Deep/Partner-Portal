import { auth } from "@/auth";
import { databaseService } from "@/services/DatabaseService.js";
import { enrichmentService } from "@/services/EnrichmentService.js";
import { fileParserService } from "@/services/FileParserService.js";
import config from "@/config/environment.js";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user context
    const userContext = await databaseService.getUserContext(session.user);

    const jobs = await databaseService.getEnrichmentJobs(
      userContext.organizationId,
    );

    return Response.json({ jobs });
  } catch (error) {
    console.error("Error fetching enrichment jobs:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user context
    const userContext = await databaseService.getUserContext(session.user);

    const body = await request.json();
    const { name, input_file_url, column_mapping, total_records } = body;

    if (!name || !input_file_url || !column_mapping) {
      return Response.json(
        {
          error: "Name, input file URL, and column mapping are required",
        },
        { status: 400 },
      );
    }

    // Validate column mapping
    if (Object.keys(column_mapping).length === 0) {
      return Response.json(
        {
          error: "At least one column mapping is required",
        },
        { status: 400 },
      );
    }

    // Create enrichment job
    const job = await databaseService.createEnrichmentJob({
      userId: userContext.userId,
      organizationId: userContext.organizationId,
      name,
      inputFileUrl: input_file_url,
      columnMapping: column_mapping,
      totalRecords: total_records,
    });

    // Log audit event
    await databaseService.logAuditEvent({
      organizationId: userContext.organizationId,
      userId: userContext.userId,
      action: "create_enrichment_job",
      resourceType: "enrichment_job",
      resourceId: job.id,
      newValues: { name, total_records },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    // Start background processing
    if (config.features.realTimeEnrichment) {
      setImmediate(() =>
        processEnrichmentJob(job.id, userContext.organizationId),
      );
    } else {
      // In production, this would be queued to a job system like Bull/Redis
      setTimeout(
        () => processEnrichmentJob(job.id, userContext.organizationId),
        1000,
      );
    }

    return Response.json({ job });
  } catch (error) {
    console.error("Error creating enrichment job:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Process enrichment job in background
 */
async function processEnrichmentJob(jobId, organizationId) {
  try {
    // Update status to processing
    await databaseService.updateEnrichmentJob(jobId, {
      status: "processing",
    });

    // Get job details
    const job = await databaseService.getEnrichmentJob(jobId, organizationId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Parse input file to get actual data
    const parseResult = await fileParserService.parseFile(job.input_file_url);
    if (!parseResult.success) {
      throw new Error(`File parsing failed: ${parseResult.error}`);
    }

    // Convert to standard format
    const standardData = fileParserService.convertToStandardFormat(
      parseResult.data,
      job.column_mapping,
    );

    if (standardData.length === 0) {
      throw new Error("No valid data found after column mapping");
    }

    // Process enrichment in batches
    const batchSize = config.features.bulkProcessing ? 100 : 10;
    const enrichmentResult = await enrichmentService.enrichBatch(standardData, {
      batchSize,
    });

    // Update progress incrementally during processing
    let processedCount = 0;
    const totalRecords = standardData.length;

    for (let i = 0; i < enrichmentResult.results.length; i++) {
      processedCount++;
      const progress = Math.floor((processedCount / totalRecords) * 100);

      await databaseService.updateEnrichmentJob(jobId, {
        progress,
        processed_records: processedCount,
      });

      // Simulate processing delay
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // Generate output file (in production, upload to cloud storage)
    const outputUrl = await generateOutputFile(
      enrichmentResult.results,
      job.name,
    );

    // Mark as completed
    await databaseService.updateEnrichmentJob(jobId, {
      status: "completed",
      progress: 100,
      processed_records: enrichmentResult.total_processed,
      output_file_url: outputUrl,
    });
  } catch (error) {
    console.error("Error processing enrichment job:", error);

    // Mark as failed
    await databaseService.updateEnrichmentJob(jobId, {
      status: "failed",
      error_message: error.message,
    });
  }
}

/**
 * Generate output file (mock implementation)
 */
async function generateOutputFile(enrichedData, jobName) {
  // In production, this would:
  // 1. Convert data to CSV/Excel
  // 2. Upload to cloud storage (S3, etc.)
  // 3. Return public URL

  // For demo, return a mock URL
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `https://example.com/enriched-data/${jobName}-${timestamp}.csv`;
}
