import sql from '@/app/api/utils/sql';
import { auth } from '@/auth';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const organizationId = 1;

    const result = await sql`
      SELECT 
        id,
        name,
        description,
        filters,
        estimated_count,
        created_at,
        updated_at
      FROM icp_filters 
      WHERE id = ${id} AND organization_id = ${organizationId}
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Filter not found' }, { status: 404 });
    }

    return Response.json({ filter: result[0] });
  } catch (error) {
    console.error('Error fetching ICP filter:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, description, filters, estimated_count } = body;
    const organizationId = 1;

    const result = await sql`
      UPDATE icp_filters 
      SET 
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        filters = COALESCE(${filters ? JSON.stringify(filters) : null}, filters),
        estimated_count = COALESCE(${estimated_count}, estimated_count),
        updated_at = NOW()
      WHERE id = ${id} AND organization_id = ${organizationId}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Filter not found' }, { status: 404 });
    }

    return Response.json({ filter: result[0] });
  } catch (error) {
    console.error('Error updating ICP filter:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const organizationId = 1;

    const result = await sql`
      DELETE FROM icp_filters 
      WHERE id = ${id} AND organization_id = ${organizationId}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Filter not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting ICP filter:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}