import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  Search,
  Trash2,
  FileText,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { KnowledgeDocument, DocumentSource } from '../../types';
import { api } from '../../lib/api';

export const KnowledgeBaseView: React.FC = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<KnowledgeDocument['category']>('Education');
  const [docLanguage, setDocLanguage] = useState<'all' | 'en' | 'hi' | 'gu'>('all');
  const [docContent, setDocContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Retrieval Sandbox state
  const [sandboxQuery, setSandboxQuery] = useState('How does Binary Search Tree work?');
  const [sandboxCategory, setSandboxCategory] = useState('all');
  const [searchResults, setSearchResults] = useState<DocumentSource[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await api.getKnowledgeDocs();
      if (res.documents) {
        setDocuments(res.documents);
        setTotalChunks(res.totalChunks || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;
    setIsUploading(true);
    try {
      const res = await api.uploadKnowledgeDoc({
        title: docTitle.trim(),
        category: docCategory,
        language: docLanguage,
        content: docContent.trim(),
      });
      if (res.document) {
        setDocuments(prev => [res.document, ...prev]);
        setTotalChunks(prev => prev + res.document.chunkCount);
        setDocTitle('');
        setDocContent('');
        setUploadSuccess(true);
        setTimeout(() => {
          setUploadSuccess(false);
          setIsUploadOpen(false);
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document from the RAG knowledge base?')) {
      return;
    }
    try {
      await api.deleteKnowledgeDoc(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSandboxSearch = async () => {
    if (!sandboxQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await api.queryKnowledge(
        sandboxQuery.trim(),
        sandboxCategory === 'all' ? undefined : sandboxCategory,
        4
      );
      if (res.results) {
        setSearchResults(res.results);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-2.5 sm:p-6 md:p-8 min-w-0">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Database className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Knowledge Base & RAG Pipeline
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Document ingestion, semantic chunking, and similarity-grounded retrieval.
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs min-h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* RAG Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] sm:text-xs text-slate-400 block font-medium">Ingested Docs</span>
            <span className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5 block">
              {documents.length}
            </span>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] sm:text-xs text-slate-400 block font-medium">Total Chunks</span>
            <span className="text-lg sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
              {totalChunks || 18}
            </span>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] sm:text-xs text-slate-400 block font-medium">Embedding Dim</span>
            <span className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              768-D
            </span>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] sm:text-xs text-slate-400 block font-medium">Vector Index</span>
            <span className="text-sm sm:text-lg font-bold text-purple-600 dark:text-purple-400 mt-0.5 block truncate">
              pgvector / IVF
            </span>
          </div>
        </div>

        {/* Live Vector Retrieval Sandbox */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
              Live Vector Similarity Search
            </h2>
            <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
              Cos-Sim Engine Ready
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Type any query to test how the Retrieval Agent extracts semantic text chunks and ranks them by cosine similarity score.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <input
              type="text"
              value={sandboxQuery}
              onChange={e => setSandboxQuery(e.target.value)}
              placeholder="Search knowledge documents..."
              className="flex-1 p-2.5 sm:p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 min-w-0"
            />
            <select
              value={sandboxCategory}
              onChange={e => setSandboxCategory(e.target.value)}
              className="p-2.5 sm:p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="Education">Education</option>
              <option value="Daily Tech">Daily Tech</option>
              <option value="Career">Career</option>
              <option value="Health & Safety">Health & Safety</option>
            </select>
            <button
              onClick={handleSandboxSearch}
              disabled={isSearching || !sandboxQuery.trim()}
              className="w-full sm:w-auto px-5 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs flex items-center justify-center gap-2 min-h-[38px]"
            >
              <Search className="w-4 h-4" />
              <span>Query RAG</span>
            </button>
          </div>

          {/* Sandbox Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Top Grounded Chunks ({searchResults.length})
              </span>
              <div className="grid grid-cols-1 gap-2">
                {searchResults.map((res, i) => (
                  <div
                    key={i}
                    className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs gap-1">
                      <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                        {res.documentTitle}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold text-[9px] sm:text-[10px] shrink-0">
                        Score: {res.similarityScore}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 italic break-words leading-relaxed">
                      "{res.snippet}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ingested Documents Table */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 sm:space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
            Approved Knowledge Corpus
          </h2>

          <div className="overflow-x-auto no-scrollbar w-full">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-2.5 sm:p-3 rounded-l-lg">Document Title</th>
                  <th className="p-2.5 sm:p-3">Category</th>
                  <th className="p-2.5 sm:p-3">Chunks</th>
                  <th className="p-2.5 sm:p-3">Status</th>
                  <th className="p-2.5 sm:p-3 rounded-r-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-2.5 sm:p-3 font-semibold text-slate-900 dark:text-white max-w-[200px]">
                      <div>
                        <span className="truncate block">{doc.title}</span>
                        <p className="text-[10px] text-slate-400 font-normal line-clamp-1">{doc.summary}</p>
                      </div>
                    </td>
                    <td className="p-2.5 sm:p-3">
                      <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium text-[10px] whitespace-nowrap">
                        {doc.category}
                      </span>
                    </td>
                    <td className="p-2.5 sm:p-3 font-mono text-[11px] whitespace-nowrap">{doc.chunkCount} chk</td>
                    <td className="p-2.5 sm:p-3 whitespace-nowrap">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        Ready
                      </span>
                    </td>
                    <td className="p-2.5 sm:p-3 text-right">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-lg"
                        title="Delete document"
                        aria-label="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upload Modal */}
        {isUploadOpen && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-2xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-3.5 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
                Upload Knowledge Document
              </h3>

              {uploadSuccess ? (
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-center font-bold text-xs sm:text-sm">
                  Document successfully parsed, chunked, and indexed into vector store!
                </div>
              ) : (
                <form onSubmit={handleUpload} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">Document Title</label>
                    <input
                      type="text"
                      required
                      value={docTitle}
                      onChange={e => setDocTitle(e.target.value)}
                      placeholder="E.g., Gujarat University Exam Regulations 2026"
                      className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-500 block mb-1">Category</label>
                      <select
                        value={docCategory}
                        onChange={e => setDocCategory(e.target.value as any)}
                        className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="Education">Education</option>
                        <option value="Daily Tech">Daily Tech</option>
                        <option value="Career">Career</option>
                        <option value="Health & Safety">Health & Safety</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-500 block mb-1">Language</label>
                      <select
                        value={docLanguage}
                        onChange={e => setDocLanguage(e.target.value as any)}
                        className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="all">Multilingual / All</option>
                        <option value="en">English</option>
                        <option value="hi">Hindi (हिन्दी)</option>
                        <option value="gu">Gujarati (ગુજરાતી)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-500 block mb-1">Document Text Content</label>
                    <textarea
                      required
                      rows={5}
                      value={docContent}
                      onChange={e => setDocContent(e.target.value)}
                      placeholder="Paste document content, study notes, or official guidelines here..."
                      className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsUploadOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs"
                    >
                      {isUploading ? 'Chunking...' : 'Index Document'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
