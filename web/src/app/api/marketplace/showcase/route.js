import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    // If DB is not configured, return sample data immediately
    if (!process.env.DATABASE_URL) {
      return Response.json(getSampleListings());
    }

    // Get the latest 6 data segments for the showcase
    const listings = await sql`
      SELECT 
        id,
        name,
        description,
        category,
        price_per_record,
        total_records,
        metadata,
        created_at,
        updated_at
      FROM data_segments 
      WHERE is_active = true
      ORDER BY created_at DESC 
      LIMIT 6
    `;

    // If no real data, return sample data for demonstration
    if (listings.length === 0) {
      return Response.json(getSampleListings());
    }

    return Response.json(listings);
  } catch (error) {
    console.error("Error fetching marketplace showcase:", error);
    // Serve sample data instead of erroring so UI remains functional
    return Response.json(getSampleListings());
  }
}

function getSampleListings() {
  return [
    {
      id: 1,
      name: "Enterprise Tech Decision Makers",
      description:
        "C-level executives and IT decision makers from Fortune 1000 companies with verified contact information and technology stack details.",
      category: "Technology",
      price_per_record: 0.25,
      total_records: 45000,
      metadata: {
        industries: ["Software", "Technology", "IT Services"],
        regions: ["North America", "Europe"],
        company_sizes: ["1000-5000", "5000+"],
      },
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Healthcare Industry Contacts",
      description:
        "Healthcare professionals including doctors, administrators, and procurement specialists from hospitals and medical facilities.",
      category: "Healthcare",
      price_per_record: 0.18,
      total_records: 32000,
      metadata: {
        industries: ["Healthcare", "Medical Devices", "Pharmaceuticals"],
        regions: ["United States", "Canada"],
        job_levels: ["Manager", "Director", "VP", "C-Level"],
      },
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      name: "Financial Services Professionals",
      description:
        "Banking, insurance, and fintech professionals with investment decision-making authority and high-value service requirements.",
      category: "Financial Services",
      price_per_record: 0.32,
      total_records: 28000,
      metadata: {
        industries: ["Banking", "Insurance", "Investment", "Fintech"],
        regions: ["North America", "Europe", "Asia Pacific"],
        seniority: ["Senior", "Executive"],
      },
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 4,
      name: "Manufacturing & Supply Chain",
      description:
        "Operations managers, supply chain directors, and procurement specialists from manufacturing companies worldwide.",
      category: "Manufacturing",
      price_per_record: 0.15,
      total_records: 52000,
      metadata: {
        industries: ["Manufacturing", "Automotive", "Aerospace", "Industrial"],
        regions: ["Global"],
        departments: ["Operations", "Supply Chain", "Procurement"],
      },
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 5,
      name: "E-commerce & Retail Leaders",
      description:
        "Digital marketing managers, e-commerce directors, and retail executives driving online and omnichannel strategies.",
      category: "Retail",
      price_per_record: 0.22,
      total_records: 38000,
      metadata: {
        industries: ["E-commerce", "Retail", "Consumer Goods"],
        regions: ["North America", "Europe"],
        focus_areas: ["Digital Marketing", "E-commerce", "Customer Experience"],
      },
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 6,
      name: "Educational Institution Contacts",
      description:
        "Decision makers from universities, colleges, and educational technology companies including administrators and procurement officers.",
      category: "Education",
      price_per_record: 0.12,
      total_records: 25000,
      metadata: {
        industries: ["Education", "EdTech", "Training"],
        regions: ["United States", "Canada", "United Kingdom"],
        institution_types: ["Universities", "Colleges", "Training Centers"],
      },
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}
