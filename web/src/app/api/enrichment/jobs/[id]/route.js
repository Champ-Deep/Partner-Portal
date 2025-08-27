import { auth } from "@/auth";
import { databaseService } from "@/services/DatabaseService.js";
import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user context
    const userContext = await databaseService.getUserContext(session.user);

    const { id } = params;

    if (!id) {
      return Response.json({ error: "Job ID is required" }, { status: 400 });
    }

    const job = await databaseService.getEnrichmentJob(
      parseInt(id),
      userContext.organizationId,
    );

    if (!job) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    return Response.json({ job });
  } catch (error) {
    console.error("Error fetching enrichment job:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user context
    const userContext = await databaseService.getUserContext(session.user);

    const { id } = params;
    const body = await request.json();

    if (!id) {
      return Response.json({ error: "Job ID is required" }, { status: 400 });
    }

    // First verify the job belongs to the user's organization
    const existingJob = await databaseService.getEnrichmentJob(
      parseInt(id),
      userContext.organizationId,
    );

    if (!existingJob) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    // Update the job
    const updatedJob = await databaseService.updateEnrichmentJob(
      parseInt(id),
      body,
    );

    // Log audit event
    await databaseService.logAuditEvent({
      organizationId: userContext.organizationId,
      userId: userContext.userId,
      action: "update_enrichment_job",
      resourceType: "enrichment_job",
      resourceId: parseInt(id),
      oldValues: existingJob,
      newValues: body,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return Response.json({ job: updatedJob });
  } catch (error) {
    console.error("Error updating enrichment job:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user context
    const userContext = await databaseService.getUserContext(session.user);

    const { id } = params;

    if (!id) {
      return Response.json({ error: "Job ID is required" }, { status: 400 });
    }

    // First verify the job belongs to the user's organization
    const existingJob = await databaseService.getEnrichmentJob(
      parseInt(id),
      userContext.organizationId,
    );

    if (!existingJob) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    // Delete the job
    const result = await sql`
      DELETE FROM enrichment_jobs 
      WHERE id = ${parseInt(id)} AND organization_id = ${userContext.organizationId}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    // Log audit event
    await databaseService.logAuditEvent({
      organizationId: userContext.organizationId,
      userId: userContext.userId,
      action: "delete_enrichment_job",
      resourceType: "enrichment_job",
      resourceId: parseInt(id),
      oldValues: existingJob,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return Response.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting enrichment job:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
