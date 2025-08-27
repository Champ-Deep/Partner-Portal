import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    // First, try to get cached posts from the database
    const cachedPosts = await sql`
      SELECT * FROM social_posts 
      WHERE platform = 'linkedin' 
      ORDER BY posted_at DESC 
      LIMIT 10
    `;

    // If we have cached posts, return them
    if (cachedPosts.length > 0) {
      return Response.json(cachedPosts);
    }

    // If no cached posts, return mock data for demonstration
    // In a real implementation, you would implement LinkedIn API integration
    // or a web scraping solution (following LinkedIn's terms of service)
    const mockPosts = [
      {
        id: 1,
        platform: 'linkedin',
        post_id: 'mock-post-1',
        content: '🚀 Exciting news! Our latest B2B data enrichment platform has helped over 1,000 sales teams increase their conversion rates by 35%. Real-time email validation, company insights, and prospect intelligence - all in one place. #B2BData #SalesIntelligence #DataEnrichment',
        engagement_metrics: {
          likes: 42,
          comments: 8,
          shares: 12
        },
        posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        id: 2,
        platform: 'linkedin',
        post_id: 'mock-post-2',
        content: '📊 Data Quality Matters! Did you know that 25% of B2B databases contain inaccurate information? Our advanced validation algorithms ensure 95%+ accuracy rates, helping you focus on real prospects instead of chasing dead ends. #DataQuality #B2BMarketing',
        engagement_metrics: {
          likes: 38,
          comments: 5,
          shares: 9
        },
        posted_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
      },
      {
        id: 3,
        platform: 'linkedin',
        post_id: 'mock-post-3',
        content: '🎯 New Feature Alert: Geographic targeting is now live! Filter your ideal customer profiles by country, region, or city to create hyper-targeted campaigns. Perfect for regional sales teams and location-specific marketing strategies.',
        engagement_metrics: {
          likes: 35,
          comments: 7,
          shares: 15
        },
        posted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
      },
      {
        id: 4,
        platform: 'linkedin',
        post_id: 'mock-post-4',
        content: '💡 Pro Tip Tuesday: Combine company size filters with industry targeting for the most effective B2B campaigns. Our ICP builder makes it easy to create these complex filters in just a few clicks. Try it today! #ProTip #B2BStrategy',
        engagement_metrics: {
          likes: 29,
          comments: 4,
          shares: 6
        },
        posted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
      }
    ];

    // In production, you might want to cache these mock posts to the database
    // for consistency across requests
    
    return Response.json(mockPosts);

  } catch (error) {
    console.error('Error fetching LinkedIn feed:', error);
    return Response.json(
      { error: 'Failed to fetch LinkedIn feed' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { content, postId, engagementMetrics } = await request.json();

    // Insert or update a social post in the database
    const result = await sql`
      INSERT INTO social_posts (
        platform, 
        post_id, 
        content, 
        engagement_metrics, 
        posted_at,
        organization_id
      ) VALUES (
        'linkedin',
        ${postId},
        ${content},
        ${JSON.stringify(engagementMetrics || {})},
        NOW(),
        1
      )
      ON CONFLICT (post_id) 
      DO UPDATE SET 
        content = EXCLUDED.content,
        engagement_metrics = EXCLUDED.engagement_metrics,
        posted_at = EXCLUDED.posted_at
      RETURNING *
    `;

    return Response.json(result[0]);

  } catch (error) {
    console.error('Error creating/updating social post:', error);
    return Response.json(
      { error: 'Failed to create/update social post' },
      { status: 500 }
    );
  }
}