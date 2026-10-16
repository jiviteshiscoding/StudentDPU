import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  ChevronDown, 
  Folder, 
  MoreHorizontal, 
  ArrowRight, 
  Upload, 
  X, 
  Check, 
  File,
  FileCode,
  FileSpreadsheet
} from 'lucide-react';
import { FileItem, Project } from '../types';

interface FilesProps {
  files: FileItem[];
  projects: Project[];
  onUploadFile: (newFile: FileItem) => void;
  onNavigate: (screen: string, projectId?: string) => void;
}

export const Files: React.FC<FilesProps> = ({
  files,
  projects,
  onUploadFile,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'folders' | 'shared' | 'starred'>('all');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState<'PDF' | 'Figma' | 'Word' | 'Excel'>('PDF');
  const [uploadProject, setUploadProject] = useState('campus-events');

  const folderCards = [
    { id: 'campus-events', name: 'Campus Events Platform', count: '12 files', color: '#2563EB', bg: '#EFF6FF' },
    { id: 'sustainability-hackathon', name: 'Sustainability Hackathon', count: '8 files', color: '#10B981', bg: '#ECFDF5' },
    { id: 'library-redesign', name: 'Library Redesign', count: '10 files', color: '#8B5CF6', bg: '#FAF5FF' },
    { id: 'ai-study-buddy', name: 'AI Study Buddy', count: '7 files', color: '#F59E0B', bg: '#FFFBEB' },
  ];

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;

    const proj = projects.find(p => p.id === uploadProject);

    const newFileItem: FileItem = {
      id: `file-${Date.now()}`,
      name: uploadFileName.endsWith(`.${uploadFileType.toLowerCase()}`) 
        ? uploadFileName 
        : `${uploadFileName}.${uploadFileType === 'Word' ? 'docx' : uploadFileType === 'Excel' ? 'xlsx' : uploadFileType === 'Figma' ? 'fig' : 'pdf'}`,
      size: '1.5 MB · ' + uploadFileType,
      type: uploadFileType,
      projectId: uploadProject,
      projectName: proj?.name || 'Campus Events Platform',
      projectColor: proj?.color || '#2563EB',
      lastModified: 'Just now',
      ownerId: 'member-alex',
      ownerName: 'Alex Rivera',
      ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      category: 'All',
    };

    onUploadFile(newFileItem);
    setUploadFileName('');
    setShowUploadModal(false);
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || f.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesProject = projectFilter === 'all' || f.projectId === projectFilter;
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'starred' && f.isStarred) ||
                       (activeTab === 'shared' && f.ownerId !== 'member-alex');

    return matchesSearch && matchesType && matchesProject && matchesTab;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#1E60FF] flex items-center justify-center shadow-xs">
            <FileText className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Files</h1>
            <p className="text-sm text-[#64748B] mt-0.5 font-normal">
              Shared project files, organized for your team.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1E60FF] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Upload</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#E2E8F0] text-sm font-semibold">
        {[
          { id: 'all', label: 'All files' },
          { id: 'folders', label: 'Project folders' },
          { id: 'shared', label: 'Shared with me' },
          { id: 'starred', label: 'Starred' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`pb-3 transition-colors cursor-pointer border-b-2 ${
              activeTab === t.id
                ? 'border-[#1E60FF] text-[#1E60FF]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search files and folders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm placeholder-[#94A3B8] focus:border-[#1E60FF] focus:ring-1 focus:ring-[#1E60FF] outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#334155] focus:outline-none focus:border-[#1E60FF] cursor-pointer"
          >
            <option value="all">All file types</option>
            <option value="pdf">PDF</option>
            <option value="figma">Figma</option>
            <option value="word">Word</option>
            <option value="excel">Excel</option>
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#334155] focus:outline-none focus:border-[#1E60FF] cursor-pointer"
          >
            <option value="all">All projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#334155] hover:bg-slate-50 cursor-pointer">
            <span>↑↓ Last modified</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
          </button>
        </div>
      </div>

      {/* Project Folders Cards Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#0F172A]">Project folders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {folderCards.map((fld) => (
            <div
              key={fld.id}
              onClick={() => onNavigate('project-workspace', fld.id)}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:border-blue-200 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5 truncate">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: fld.bg, color: fld.color }}
                >
                  <Folder className="w-6 h-6 fill-current" />
                </div>
                <div className="truncate">
                  <div className="text-sm font-bold text-[#0F172A] truncate">{fld.name}</div>
                  <div className="text-xs text-[#64748B] mt-0.5">{fld.count}</div>
                </div>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); }}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Files Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0F172A]">Recent files</h2>
          <button className="text-xs font-semibold text-[#1E60FF] hover:text-blue-700 flex items-center gap-1 cursor-pointer">
            <span>View all files</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-50 text-[11px] font-semibold text-[#64748B] border-b border-slate-100">
            <div className="col-span-4">Name</div>
            <div className="col-span-3">Project</div>
            <div className="col-span-2">Last modified ↓</div>
            <div className="col-span-2">Owner</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-12 gap-2 px-4 py-3.5 items-center hover:bg-slate-50/60 transition-colors"
              >
                {/* File Icon & Name */}
                <div className="col-span-4 flex items-center gap-3 truncate">
                  {file.type === 'PDF' && (
                    <div className="w-8 h-8 rounded-lg bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      PDF
                    </div>
                  )}
                  {file.type === 'Figma' && (
                    <div className="w-8 h-8 rounded-lg bg-[#2C2D30] text-purple-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                      FIG
                    </div>
                  )}
                  {file.type === 'Word' && (
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      W
                    </div>
                  )}
                  {file.type === 'Excel' && (
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      X
                    </div>
                  )}

                  <div className="truncate">
                    <div className="font-bold text-[#0F172A] truncate hover:text-[#1E60FF] cursor-pointer">
                      {file.name}
                    </div>
                    <div className="text-[11px] text-[#64748B]">{file.size}</div>
                  </div>
                </div>

                {/* Project */}
                <div className="col-span-3 flex items-center gap-1.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: file.projectColor }}
                  />
                  <span className="text-xs text-[#334155] font-medium truncate">
                    {file.projectName}
                  </span>
                </div>

                {/* Last Modified */}
                <div className="col-span-2 text-xs text-[#64748B]">
                  {file.lastModified}
                </div>

                {/* Owner */}
                <div className="col-span-2 flex items-center gap-2 truncate">
                  <img
                    src={file.ownerAvatar}
                    alt={file.ownerName}
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                  />
                  <span className="text-xs text-[#334155] font-medium truncate">
                    {file.ownerName}
                  </span>
                </div>

                {/* Action */}
                <div className="col-span-1 text-right">
                  <button className="text-slate-400 hover:text-slate-700 p-1 rounded-md">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload File Modal (Frontend-only mock) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Upload Project File</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">File name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Architecture_diagram"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-[#1E60FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={uploadFileType}
                    onChange={(e) => setUploadFileType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  >
                    <option value="PDF">PDF</option>
                    <option value="Figma">Figma</option>
                    <option value="Word">Word (.docx)</option>
                    <option value="Excel">Excel (.xlsx)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Project</label>
                  <select
                    value={uploadProject}
                    onChange={(e) => setUploadProject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center hover:bg-slate-50 cursor-pointer">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-slate-600 font-medium">Click to select file from computer</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Frontend mock simulation</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E60FF] hover:bg-blue-700 text-white font-semibold rounded-xl cursor-pointer"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
