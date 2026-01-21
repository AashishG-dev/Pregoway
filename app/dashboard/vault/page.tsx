"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Upload, Search, Filter, Eye, Download, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

type Doc = {
   id: string;
   title: string;
   type: string;
   created_at: string;
   status: string;
   file_url: string;
};

export default function VaultPage() {
   const { user } = useAuth();
   const fileInputRef = useRef<HTMLInputElement>(null);

   const [docs, setDocs] = useState<Doc[]>([]);
   const [loading, setLoading] = useState(true);
   const [uploading, setUploading] = useState(false);

   async function loadDocs() {
      if (!user) return;
      try {
         const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

         if (data) setDocs(data);
      } catch (err) {
         console.error("Error fetching docs:", err);
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      loadDocs();
   }, [user]);

   const handleUploadClick = () => {
      fileInputRef.current?.click();
   };

   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0 || !user) return;

      const file = e.target.files[0];
      setUploading(true);

      try {
         // 1. Upload to Storage
         const fileExt = file.name.split('.').pop();
         const fileName = `${user.id}/${Date.now()}.${fileExt}`;

         const { data: storageData, error: storageError } = await supabase.storage
            .from('vault')
            .upload(fileName, file);

         if (storageError) throw storageError;

         // 2. Insert Metadata
         const { error: dbError } = await supabase.from('documents').insert({
            user_id: user.id,
            title: file.name,
            type: 'Lab', // Default for now
            file_url: storageData.path,
            status: 'Analyzed',
            risk_status: 'Normal'
         });

         if (dbError) throw dbError;

         // 3. Refresh
         await loadDocs();

      } catch (err) {
         console.error("Upload failed", err);
         alert("Failed to upload document. Please ensure your network is connected and try again.");
      } finally {
         setUploading(false);
         if (fileInputRef.current) fileInputRef.current.value = "";
      }
   };

   const handleView = async (path: string) => {
      // Get signed URL
      const { data } = await supabase.storage.from('vault').createSignedUrl(path, 60);
      if (data?.signedUrl) {
         window.open(data.signedUrl, '_blank');
      }
   };

   const handleDelete = async (id: string, path: string) => {
      if (!confirm("Are you sure you want to delete this document?")) return;

      try {
         await supabase.from('documents').delete().eq('id', id);
         await supabase.storage.from('vault').remove([path]);
         setDocs(docs.filter(d => d.id !== id));
      } catch (err) {
         console.error("Delete failed", err);
      }
   };

   if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>;

   return (
      <div className="flex flex-col min-h-screen bg-gray-50">
         <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,.pdf"
         />

         <div className="bg-white p-6 pb-4 sticky top-0 z-10 shadow-sm">
            <div className="flex justify-between items-center mb-4">
               <h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
               <button className="p-2 bg-gray-100 rounded-full">
                  <Search className="w-5 h-5 text-gray-500" />
               </button>
            </div>

            <button
               onClick={handleUploadClick}
               disabled={uploading}
               className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-700 shadow-md transition-all active:scale-95 disabled:bg-brand-400 disabled:scale-100"
            >
               {uploading ? (
                  <>
                     <Loader2 className="w-5 h-5 animate-spin" />
                     <span>Uploading...</span>
                  </>
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
                  <button key={cat} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium ${i === 0 ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                     {cat}
                  </button>
               ))}
            </div>

            {/* Doc List */}
            <div className="space-y-3">
               {docs.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                     <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                     <p>No documents yet.</p>
                  </div>
               ) : (
                  docs.map((doc) => (
                     <div key={doc.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                           <FileText className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-gray-900 truncate">{doc.title}</h4>
                           <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className="text-green-600 font-medium">{doc.status || 'Analyzed'}</span>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => handleView(doc.file_url)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                              <Eye className="w-5 h-5" />
                           </button>
                           <button onClick={() => handleDelete(doc.id, doc.file_url)} className="p-2 hover:bg-gray-100 rounded-lg text-red-300 hover:text-red-500">
                              <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>
   );
}
