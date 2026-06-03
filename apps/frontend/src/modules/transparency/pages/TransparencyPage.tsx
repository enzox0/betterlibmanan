import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaSearch,
  FaFilter,
  FaRoad,
  FaWater,
  FaBuilding,
  FaCheckCircle,
  FaSpinner,
  FaClock,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaHardHat,
  FaChartLine,
  FaExternalLinkAlt,
  FaStream,
  FaTh,
  FaList,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import React from 'react';
import { Project, ProjectSummary, fetchProjects } from './api';

const categoryIcons: Record<string, any> = {
  'Roads': FaRoad,
  'Bridges': FaStream,
  'Flood Control and Drainage': FaWater,
  'Buildings and Facilities': FaBuilding
};

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  'Completed': { bg: 'bg-gray-900', text: 'text-white', border: 'border-gray-900' },
  'On-Going': { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-600' },
  'Not Started': { bg: 'bg-gray-300', text: 'text-gray-800', border: 'border-gray-300' },
  'For Procurement': { bg: 'bg-gray-500', text: 'text-white', border: 'border-gray-500' }
};

export function TransparencyPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [summary, setSummary] = useState<ProjectSummary>({
    totalProjects: 0,
    completed: 0,
    ongoing: 0,
    notStarted: 0,
    totalBudget: 0
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchProjects({
        page: 1,
        limit: 100,
        search: 'Libmanan',
        region: 'Region V',
        province: 'CAMARINES SUR'
      });
      
      setProjects(data.data.data);
      setSummary(data.data.summary);
      setLoading(false);
    } catch (err) {
      setError('Failed to load projects. Please try again later.');
      setLoading(false);
      console.error('Error fetching projects:', err);
    }
  };

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];
  const statuses = ['All', ...Array.from(new Set(projects.map(p => p.status)))];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.contractor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || project.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gray-900 py-12 sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              DPWH Projects Transparency
            </h1>
            <p className="mt-3 text-sm text-gray-300 sm:text-base">
              Track infrastructure projects in Libmanan, Camarines Sur
            </p>
          </div>
        </motion.div>
      </section>

      {/* Summary Cards */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">Total Projects</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{filteredProjects.length}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                  <FaBuilding className="text-base" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">Completed</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {filteredProjects.filter(p => p.status === 'Completed').length}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white">
                  <FaCheckCircle className="text-base" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">On-Going</p>
                  <p className="mt-1 text-2xl font-bold text-blue-600">
                    {filteredProjects.filter(p => p.status === 'On-Going').length}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <FaSpinner className="text-base" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">Total Budget</p>
                  <p className="mt-1 text-base font-bold text-gray-900">
                    {formatCurrency(filteredProjects.reduce((sum, p) => sum + p.budget, 0))}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 text-gray-700">
                  <FaMoneyBillWave className="text-base" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="bg-white py-6 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3">
            {/* Top Row: Search and View Toggle */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Search */}
              <div className="relative flex-1 lg:max-w-md">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search projects or contractors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <FaTh className="text-xs" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    viewMode === 'list'
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <FaList className="text-xs" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>

            {/* Bottom Row: Filters */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-8 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-auto"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-8 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-auto"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center text-xs text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length} projects
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <FaSpinner className="mx-auto h-12 w-12 animate-spin text-blue-600" />
                <p className="mt-4 text-gray-600">Loading projects...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-red-800">{error}</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
              <p className="text-gray-600">No projects found matching your criteria.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}
            >
              {currentProjects.map((project, index) => {
                const Icon = categoryIcons[project.category] || FaBuilding;
                const statusStyle = statusColors[project.status] || statusColors['Not Started'];

                if (viewMode === 'list') {
                  return (
                    <motion.div
                      key={project.contractId}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.02 }}
                      onClick={() => setSelectedProject(project)}
                      className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-lg"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        {/* Left: Icon and Content */}
                        <div className="flex flex-1 gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                            <Icon className="text-base" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="mb-2 flex items-center gap-2">
                              <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                {project.status}
                              </span>
                              {project.progress > 0 && (
                                <span className="text-xs font-medium text-gray-600">{project.progress}%</span>
                              )}
                            </div>
                            
                            <h3 className="mb-2 text-sm font-semibold text-gray-900 line-clamp-2">
                              {project.description}
                            </h3>
                            
                            <div className="grid gap-1.5 text-xs text-gray-600 sm:grid-cols-2 lg:grid-cols-4">
                              <div className="flex items-center gap-1.5">
                                <FaMoneyBillWave className="text-gray-400 shrink-0 text-xs" />
                                <span className="font-semibold text-gray-900 truncate text-xs">{formatCurrency(project.budget)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <FaHardHat className="text-gray-400 shrink-0 text-xs" />
                                <span className="truncate text-xs">{project.contractor.split('(')[0].trim()}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <FaCalendarAlt className="text-gray-400 shrink-0 text-xs" />
                                <span className="text-xs">{formatDate(project.startDate)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <FaMapMarkerAlt className="text-gray-400 shrink-0 text-xs" />
                                <span className="truncate text-xs">{project.location.province}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Action */}
                        <div className="flex items-center justify-end sm:justify-start">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-900 group-hover:text-blue-600">
                            <span>View Details</span>
                            <FaExternalLinkAlt className="text-xs" />
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar for list view */}
                      {project.progress > 0 && (
                        <div className="mt-3">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={project.contractId}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    onClick={() => setSelectedProject(project)}
                    className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-lg"
                  >
                    {/* Header */}
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                        <Icon className="text-base" />
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                        {project.status}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900">
                      {project.description}
                    </h3>

                    {/* Progress Bar */}
                    {project.progress > 0 && (
                      <div className="mb-3">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">Progress</span>
                          <span className="text-xs font-bold text-blue-600">{project.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Details */}
                    <div className="space-y-1.5 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <FaMoneyBillWave className="text-gray-400 text-xs" />
                        <span className="font-semibold text-gray-900 text-xs">{formatCurrency(project.budget)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FaHardHat className="text-gray-400 text-xs" />
                        <span className="line-clamp-1 text-xs">{project.contractor.split('(')[0].trim()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FaCalendarAlt className="text-gray-400 text-xs" />
                        <span className="text-xs">{formatDate(project.startDate)}</span>
                      </div>
                    </div>

                    {/* View Details */}
                    <div className="mt-3 flex items-center justify-end text-xs font-medium text-gray-900 group-hover:text-blue-600">
                      <span>View Details</span>
                      <FaExternalLinkAlt className="ml-1 text-xs" />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Pagination */}
          {!loading && !error && filteredProjects.length > 0 && (
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300"
              >
                <FaChevronLeft className="text-xs" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 rounded-lg text-xs font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-gray-900 text-white'
                          : 'border border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-gray-500 text-xs">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="h-8 w-8 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:border-gray-400"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300"
              >
                Next
                <FaChevronRight className="text-xs" />
              </button>
            </div>
          )}

          {/* Source Attribution */}
          {!loading && !error && filteredProjects.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-blue-600 bg-white">
                  <span className="text-xs font-bold text-blue-600">i</span>
                </div>
                <span className="font-medium text-gray-700">Source:</span>
                <a
                  href="https://www.dpwh.gov.ph/dpwh/transparency"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  DPWH Transparency Portal
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedProject(null)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-6">
              <button 
                className="absolute right-4 top-4 p-2 text-gray-500 hover:text-gray-900 transition-colors"
                onClick={() => setSelectedProject(null)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="pr-12">
                <div className="mb-3 flex items-center gap-3">
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusColors[selectedProject.status].bg} ${statusColors[selectedProject.status].text} ${statusColors[selectedProject.status].border}`}>
                    {selectedProject.status}
                  </span>
                  <span className="text-xs text-gray-500">Contract ID: {selectedProject.contractId}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  {selectedProject.description}
                </h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Progress */}
              {selectedProject.progress > 0 && (
                <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">Project Progress</span>
                    <span className="text-2xl font-bold text-blue-600">{selectedProject.progress}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${selectedProject.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Financial Info */}
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="mb-2 flex items-center gap-2 text-gray-600">
                    <FaMoneyBillWave />
                    <span className="text-sm font-medium">Total Budget</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedProject.budget)}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="mb-2 flex items-center gap-2 text-gray-600">
                    <FaChartLine />
                    <span className="text-sm font-medium">Amount Paid</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedProject.amountPaid)}</p>
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <FaHardHat className="text-gray-700" />
                    Contractor Information
                  </h3>
                  <p className="text-sm text-gray-700">{selectedProject.contractor}</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <FaMapMarkerAlt className="text-gray-700" />
                    Location
                  </h3>
                  <p className="text-sm text-gray-700">
                    {selectedProject.location.province}, {selectedProject.location.region}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <h3 className="mb-2 text-sm font-semibold text-gray-900">Start Date</h3>
                    <p className="text-sm text-gray-700">{formatDate(selectedProject.startDate)}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <h3 className="mb-2 text-sm font-semibold text-gray-900">Completion Date</h3>
                    <p className="text-sm text-gray-700">{formatDate(selectedProject.completionDate)}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">Project Category</h3>
                  <div className="flex items-center gap-2">
                    {React.createElement(categoryIcons[selectedProject.category] || FaBuilding, {
                      className: 'text-gray-700'
                    })}
                    <span className="text-sm text-gray-700">{selectedProject.category}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <h3 className="mb-2 text-sm font-semibold text-gray-900">Program & Funding</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><span className="font-medium">Program:</span> {selectedProject.programName}</p>
                    <p><span className="font-medium">Source of Funds:</span> {selectedProject.sourceOfFunds}</p>
                    <p><span className="font-medium">Infrastructure Year:</span> {selectedProject.infraYear}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

TransparencyPage.displayName = 'TransparencyPage';

export default TransparencyPage;
