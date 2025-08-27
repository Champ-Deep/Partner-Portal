import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { navigationItems } from "@/config/icpConstants";

export default function Header({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Lake B2B Reseller Portal
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {user.name || user.email}
            </span>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="absolute right-4 top-16 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                  item.current ? "text-blue-600 bg-blue-50" : "text-gray-700"
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </a>
            ))}
            <div className="border-t border-gray-200 my-2"></div>
            <a
              href="/account/logout"
              className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
