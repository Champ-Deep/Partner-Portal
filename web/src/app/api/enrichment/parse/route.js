import { auth } from "@/auth";
import { fileParserService } from "@/services/FileParserService.js";
import { databaseService } from "@/services/DatabaseService.js";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user context
    const userContext = await databaseService.getUserContext(session.user);

    const body = await request.json();
    const { fileUrl, fileName } = body;

    if (!fileUrl) {
      return Response.json({ error: "File URL is required" }, { status: 400 });
    }

    // Parse the file using the service
    const parseResult = await fileParserService.parseFile(fileUrl, fileName);

    if (!parseResult.success) {
      return Response.json(
        {
          error: "File parsing failed",
          details: parseResult.error,
        },
        { status: 400 },
      );
    }

    // Log audit event
    await databaseService.logAuditEvent({
      organizationId: userContext.organizationId,
      userId: userContext.userId,
      action: "parse_file",
      resourceType: "file",
      newValues: {
        fileName,
        fileUrl,
        rowCount: parseResult.data.totalRows,
        columnCount: parseResult.data.headers.length,
      },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return Response.json({
      ...parseResult.data,
      metadata: parseResult.metadata,
    });
  } catch (error) {
    console.error("Error parsing file:", error);
    return Response.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
