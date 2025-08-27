import useAuth from "@/utils/useAuth";

function MainComponent() {
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/account/signin",
      redirect: true,
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign Out</h1>
          <p className="text-gray-600">Are you sure you want to sign out?</p>
        </div>
        
        <div className="rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
          <button
            onClick={handleSignOut}
            className="w-full rounded-lg bg-red-600 px-4 py-3 text-base font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Sign Out
          </button>
          
          <div className="mt-4 text-center">
            <a
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Cancel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;