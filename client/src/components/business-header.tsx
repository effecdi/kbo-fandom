import { useTheme } from "@/components/theme-provider";
import {
  Search,
  Bell,
  Moon,
  Sun,
  Building2,
} from "lucide-react";

export function BusinessHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 bg-card border-b sticky top-0 z-10">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="검색..."
              className="w-full pl-10 pr-4 py-1.5 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-foreground"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-semibold">
            기업 모드
          </div>

          <button onClick={toggleTheme} className="p-2 hover:bg-muted rounded-lg transition-all">
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Sun className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          <button className="relative p-2 hover:bg-muted rounded-lg transition-all">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
