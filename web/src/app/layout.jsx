import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "@/components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const metadata = {
  title: "B2B Data Platform - Enrich, Discover, Convert",
  description:
    "Professional B2B data enrichment and marketplace platform for sales teams and marketers.",
  keywords:
    "B2B data, lead generation, email validation, data enrichment, sales intelligence",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#2563eb",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="B2B Data Platform" />
        <meta
          property="og:description"
          content="Professional B2B data enrichment and marketplace platform"
        />
        <meta property="og:type" content="website" />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <div id="root">{children}</div>
          </QueryClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
