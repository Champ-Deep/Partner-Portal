import {
  Home,
  Megaphone,
  BarChart3,
  Database,
  Target,
  Activity,
} from "lucide-react";

export const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Campaigns", href: "/campaigns", icon: Megaphone },
  { name: "Marketplace", href: "/marketplace", icon: BarChart3 },
  { name: "Enrichment", href: "/enrichment", icon: Database },
  { name: "ICP Builder", href: "/icp", icon: Target, current: true },
  { name: "Analytics", href: "/analytics", icon: Activity },
];

export const industryOptions = [
  "Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Education",
  "Real Estate",
  "Consulting",
  "Marketing",
  "Legal",
  "E-commerce",
  "SaaS",
  "Fintech",
  "Biotech",
  "Automotive",
];

export const companySizeOptions = [
  { value: "1-10", label: "1-10 employees (Startup)" },
  { value: "11-50", label: "11-50 employees (Small)" },
  { value: "51-200", label: "51-200 employees (Medium)" },
  { value: "201-500", label: "201-500 employees (Large)" },
  { value: "501-1000", label: "501-1000 employees (Enterprise)" },
  { value: "1000+", label: "1000+ employees (Corporate)" },
];

export const regionOptions = [
  "North America",
  "Europe",
  "Asia Pacific",
  "Latin America",
  "Middle East",
  "Africa",
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Australia",
  "India",
  "Singapore",
];

export const technologyOptions = [
  "Salesforce",
  "HubSpot",
  "Microsoft",
  "Google Workspace",
  "Slack",
  "Zoom",
  "AWS",
  "Azure",
  "Docker",
  "Kubernetes",
  "React",
  "Node.js",
  "Python",
  "Java",
  "Shopify",
  "WordPress",
  "Mailchimp",
];
