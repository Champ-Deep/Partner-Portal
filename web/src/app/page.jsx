import { useEffect } from "react";
import useUser from "@/utils/useUser";

export default function HomePage() {
  const { data: user, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      if (user) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/account/signin";
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading LakeB2B Portal...</p>
        </div>
      </div>
    );
  }

  return null;
}
