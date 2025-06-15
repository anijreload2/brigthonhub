'use client';

import React from 'react';

export function EnvDebug() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div className="p-4 m-4 border rounded bg-yellow-50">
      <h3 className="font-bold text-lg mb-2">Environment Variables Debug</h3>
      <div className="space-y-2">
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> 
          <span className={supabaseUrl ? "text-green-600" : "text-red-600"}>
            {supabaseUrl || "❌ Missing"}
          </span>
        </div>
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> 
          <span className={supabaseAnonKey ? "text-green-600" : "text-red-600"}>
            {supabaseAnonKey ? `✅ Present (${supabaseAnonKey.substring(0, 20)}...)` : "❌ Missing"}
          </span>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          <strong>Node Env:</strong> {process.env.NODE_ENV || "undefined"}
        </div>
      </div>
    </div>
  );
}
