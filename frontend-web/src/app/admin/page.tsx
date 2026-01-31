
import React from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/grammar" className="block group">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group-hover:border-blue-400">
            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">Grammar</h3>
            <p className="text-gray-500">Manage Grammar Books, Units, and Exercises.</p>
          </div>
        </Link>
        
        {/* Placeholders for other sections */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 opacity-60">
           <h3 className="text-xl font-bold mb-2 text-gray-400">Vocabulary (Coming Soon)</h3>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 opacity-60">
           <h3 className="text-xl font-bold mb-2 text-gray-400">Pronunciation (Coming Soon)</h3>
        </div>
      </div>
    </div>
  );
}
