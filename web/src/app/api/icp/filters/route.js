import sql from '@/app/api/utils/sql';
import { auth } from '@/auth';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, we'll use organization_id = 1 as default
    // In a real implementation, this would come from the user session
    const organizationId = 1;

    const filters = await sql`
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
    `;

    return Response.json({ filters });
  } catch (error) {
    console.error('Error fetching ICP filters:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, filters, estimated_count } = body;

    if (!name || !filters) {
      return Response.json({ error: 'Name and filters are required' }, { status: 400 });
    }

    // For now, we'll use organization_id = 1 and user_id = 1 as defaults
    const organizationId = 1;
    const userId = 1;

    const result = await sql`
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
        ${description || ''},
        ${JSON.stringify(filters)},
        ${estimated_count || 0}
      )
      RETURNING *
    `;

    return Response.json({ filter: result[0] });
  } catch (error) {
    console.error('Error creating ICP filter:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}