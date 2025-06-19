'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Search, Plus, Eye, Edit, Trash2, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

interface AITrainingTabProps {
  onAdd: () => void;
  onEdit: (data: any) => void;
  onView: (data: any) => void;
  onDelete: (data: any) => void;
}

const AITrainingTab: React.FC<AITrainingTabProps> = ({ onAdd, onEdit, onView, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [trainingData, setTrainingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchTrainingData = async () => {    try {
      setLoading(true);
      const response = await fetch('/api/ai-training-data');
      if (response.ok) {
        const result = await response.json();
        setTrainingData(result.trainingData || []);
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingData();
  }, []);

  const filteredData = trainingData.filter(item => {
    const searchText = `${item.category} ${item.question} ${item.answer}`.toLowerCase();
    const matchesSearch = searchText.includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesLanguage = filterLanguage === 'all' || item.language === filterLanguage;
    return matchesSearch && matchesCategory && matchesLanguage;
  });
  // Get unique categories and languages for filters
  const categories = Array.from(new Set(trainingData.map(item => item.category)));
  const languages = Array.from(new Set(trainingData.map(item => item.language)));  const toggleActive = async (id: string, is_active: boolean) => {
    try {
      const response = await fetch('/api/ai-training-data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          is_active: !is_active, 
          updated_at: new Date().toISOString() 
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      // Update local state
      setTrainingData(prev => prev.map(item => 
        item.id === id ? { ...item, is_active: !is_active } : item
      ));
      
      alert(`Training data ${!is_active ? 'activated' : 'deactivated'} successfully`);    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };
  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">AI Training Data</h2>
        <button onClick={onAdd} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Add Training Data
        </button>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">AI Assistant Quick Actions</h3>
            <p className="text-blue-800 text-sm mb-2">
              Questions from this training data automatically become quick action buttons on the AI Assistant page. 
              Active questions will appear as clickable suggestions for users.
            </p>
            <ul className="text-blue-700 text-xs space-y-1">
              <li>• Questions are grouped by category and displayed as quick action buttons</li>
              <li>• Only active training data items appear as quick actions</li>
              <li>• Up to 6 questions are shown as quick actions to users</li>
              <li>• Changes here update the AI Assistant interface immediately</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-light" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions, answers, or categories..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          title="Filter by category"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={filterLanguage}
          onChange={(e) => setFilterLanguage(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          title="Filter by language"
        >
          <option value="all">All Languages</option>
          {languages.map(lang => (
            <option key={lang} value={lang}>{lang.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-text-light">Loading AI training data...</p>
        </div>
      ) : (
        <>
          {/* Training Data Grid */}
          <div className="grid gap-4">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                        <Brain className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {item.category}
                          </span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            {item.language.toUpperCase()}
                          </span>
                          <button
                            onClick={() => toggleActive(item.id, item.is_active)}
                            className={`p-1 rounded ${item.is_active ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                            title={item.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {item.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </button>
                        </div>
                        <h3 className="font-medium text-text-primary mb-2 line-clamp-2">
                          Q: {item.question}
                        </h3>
                        <p className="text-sm text-text-light line-clamp-3 mb-2">
                          A: {item.answer}
                        </p>
                        <div className="text-xs text-text-light">
                          Created: {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onView(item)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-text-light" />
                      </button>
                      <button 
                        onClick={() => onEdit(item)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-text-light" />
                      </button>
                      <button 
                        onClick={() => onDelete(item)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-text-light">
                {searchTerm || filterCategory !== 'all' || filterLanguage !== 'all' 
                  ? 'No training data found matching your criteria' 
                  : 'No AI training data found'}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="mt-4 text-sm text-text-light flex justify-between">
            <span>Showing {filteredData.length} of {trainingData.length} training entries</span>
            <span>
              Active: {trainingData.filter(item => item.is_active).length} | 
              Inactive: {trainingData.filter(item => !item.is_active).length}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default AITrainingTab;
