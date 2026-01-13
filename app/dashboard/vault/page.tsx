"use client";

import { useState } from "react";
import { FileText, Upload, Search, Filter, Eye, Download } from "lucide-react";

const initialDocs = [
  { id: 1, title: "Blood Test Report", type: "Lab", date: "Jan 10, 2026", status: "Analyzed", risk: "Normal" },
  { id: 2, title: "Anomaly Scan Report", type: "Scan", date: "Jan 05, 2026", status: "Analyzed", risk: "Normal" },
  { id: 3, title: "Prescription - Iron", type: "Rx", date: "Dec 12, 2025", status: "Analyzed", risk: "Normal" },
];

export default function VaultPage() {
  const [docs, setDocs] = useState(initialDocs);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newDoc = { 
        id: docs.length + 1, 
        title: "New Report (Uploaded)", 
        type: "Lab", 
        date: "Just Now", 
        status: "Processing OCR...", 
        risk: "Pending" 
      };
      setDocs([newDoc, ...docs]);
      setIsUploading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
       <div className="bg-white p-6 pb-4 sticky top-0 z-10 shadow-sm">
         <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
            <button className="p-2 bg-gray-100 rounded-full">
               <Search className="w-5 h-5 text-gray-500" />
            </button>
         </div>

         <button 
           onClick={handleUpload}
           disabled={isUploading}
           className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-700 shadow-md transition-all active:scale-95"
         >
            {isUploading ? (
              <span>Uploading...</span>
            ) : (
              <>
                 <Upload className="w-5 h-5" />
                 <span>Upload New Report</span>
              </>
            )}
         </button>
       </div>

       <div className="p-4 space-y-4">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
             {['All', 'Lab Reports', 'Prescriptions', 'Scans'].map((cat, i) => (
               <button key={cat} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium ${i===0 ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                 {cat}
               </button>
             ))}
          </div>

          {/* Doc List */}
          <div className="space-y-3">
             {docs.map((doc) => (
                <div key={doc.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-blue-500" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 truncate">{doc.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                         <span>{doc.date}</span>
                         <span>•</span>
                         <span className={doc.status === 'Analyzed' ? 'text-green-600 font-medium' : 'text-orange-500 font-medium'}>{doc.status}</span>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                         <Eye className="w-5 h-5" />
                      </button>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}
