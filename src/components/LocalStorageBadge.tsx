import { Database } from "lucide-react";
import { isUsingLocalStorage } from "../lib/supabase";

export function LocalStorageBadge() {
  if (!isUsingLocalStorage()) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg px-3 py-2 shadow-lg flex items-center gap-2">
        <Database className="w-4 h-4 text-blue-600" />
        <div className="text-xs">
          <div className="text-blue-900">Local Mode</div>
          <div className="text-blue-600">Browser storage</div>
        </div>
      </div>
    </div>
  );
}