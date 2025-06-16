'use client';

import React, { useState, useEffect } from 'react';
import { Wrench, Search, Plus, Eye, Edit, Trash2, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ProjectsTabProps {
  onAdd: () => void;
  onEdit: (data: any) => void;
  onView: (data: any) => void;
  onDelete: (data: any) => void;
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({ onAdd, onEdit, onView, onDelete }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase        .from('projects')
        .select(`
          *,
          project_categories:categoryId (
            id,
            name
          )
        `)
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('project_categories')
        .select('*')
        .eq('isActive', true)
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING':
        return 'bg-warning bg-opacity-10 text-warning';
      case 'IN_PROGRESS':
        return 'bg-info bg-opacity-10 text-info';
      case 'COMPLETED':
        return 'bg-success bg-opacity-10 text-success';
      case 'ON_HOLD':
        return 'bg-gray-100 text-gray-500';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">Projects Management</h2>
        <button onClick={onAdd} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-light" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          title="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="PLANNING">Planning</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="ON_HOLD">On Hold</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-text-light">Loading projects...</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.length > 0 ? filteredProjects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => onView(project)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-text-light" />
                    </button>
                    <button 
                      onClick={() => onEdit(project)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-text-light" />
                    </button>
                    <button 
                      onClick={() => onDelete(project)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                
                {project.beforeImages && project.beforeImages.length > 0 && (
                  <div className="mb-3">
                    <img 
                      src={project.beforeImages[0]} 
                      alt={project.title}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-project.jpg';
                      }}
                    />
                  </div>
                )}
                
                <h4 className="font-semibold text-text-primary mb-1">{project.title}</h4>
                <p className="text-sm text-text-light mb-2 line-clamp-2">{project.description}</p>
                <div className="text-xs text-text-light space-y-1">
                  {project.clientName && <p>Client: {project.clientName}</p>}
                  {project.location && <p>Location: {project.location}</p>}
                  <p>Budget: {formatCurrency(project.budget)}</p>
                  <p>Category: {project.project_categories?.name || 'N/A'}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-8 text-text-light">
                {searchTerm || filterStatus !== 'all' ? 'No projects found matching your criteria' : 'No projects found'}
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-text-light">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectsTab;
