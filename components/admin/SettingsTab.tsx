'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Search, Plus, Eye, Edit, Trash2, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SettingsTabProps {
  onAdd: () => void;
  onEdit: (data: any) => void;
  onView: (data: any) => void;
  onDelete: (data: any) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ onAdd, onEdit, onView, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('key', { ascending: true });

      if (error) {
        console.error('Error fetching settings:', error);
      } else {
        console.log('Fetched settings:', data);
        setSettings(data || []);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const filteredSettings = settings.filter(setting => {
    const searchText = `${setting.key} ${setting.value}`.toLowerCase();
    return searchText.includes(searchTerm.toLowerCase());
  });
  const handleQuickUpdate = async (id: string, value: string) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ value, updatedAt: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setSettings(prev => prev.map(setting => 
        setting.id === id ? { ...setting, value } : setting
      ));
      
      alert('Setting updated successfully');
    } catch (error: any) {
      console.error('Error updating setting:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const addOpenRouterDefaults = async () => {
    const openRouterDefaults = [
      { key: 'openrouter_api_key', value: '', type: 'password' },
      { key: 'openrouter_model', value: 'microsoft/wizardlm-2-8x22b', type: 'string' },
      { key: 'ai_system_prompt', value: 'You are a helpful AI assistant for BrightonHub, a real estate and business services platform in Lagos, Nigeria. Help users with property searches, food supply, marketplace needs, and project planning. Be professional, helpful, and knowledgeable about Nigerian business practices.', type: 'text' }
    ];

    try {
      for (const setting of openRouterDefaults) {
        // Check if setting already exists
        const exists = settings.find(s => s.key === setting.key);
        if (!exists) {
          const { error } = await supabase
            .from('site_settings')
            .insert([{
              id: crypto.randomUUID(),
              key: setting.key,
              value: setting.value,
              type: setting.type,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }]);

          if (error) throw error;
        }
      }
      
      alert('OpenRouter settings initialized successfully!');
      fetchSettings(); // Refresh the list
    } catch (error: any) {
      console.error('Error adding OpenRouter defaults:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const openRouterModels = [
    'microsoft/wizardlm-2-8x22b',
    'anthropic/claude-3-sonnet',
    'openai/gpt-4o',
    'openai/gpt-3.5-turbo',
    'google/gemini-pro',
    'meta-llama/llama-3-70b-instruct',
    'mistralai/mistral-7b-instruct'
  ];
  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">Site Settings</h2>
        <div className="flex gap-2">
          <button 
            onClick={addOpenRouterDefaults}
            className="btn btn-secondary text-sm"
          >
            <Settings className="w-4 h-4" />
            Add AI Settings
          </button>
          <button onClick={onAdd} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Add Setting
          </button>
        </div>
      </div>

      {/* OpenRouter Quick Setup Guide */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">🤖 AI Assistant Setup</h3>
        <p className="text-blue-800 text-sm mb-3">
          Configure OpenRouter to enable intelligent AI responses. 
          <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline ml-1">
            Get your API key here →
          </a>
        </p>
        <div className="text-xs text-blue-700">
          <strong>Required settings:</strong> openrouter_api_key, openrouter_model, ai_system_prompt
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-light" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search settings..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-text-light">Loading settings...</p>
        </div>
      ) : (
        <>
          {/* Settings Grid */}
          <div className="grid gap-4">
            {filteredSettings.length > 0 ? (
              filteredSettings.map((setting) => (
                <div key={setting.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                        <Settings className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">{setting.key}</h3>
                        <span className="text-xs text-text-light bg-gray-100 px-2 py-1 rounded">
                          {setting.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onView(setting)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-text-light" />
                      </button>
                      <button 
                        onClick={() => onEdit(setting)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-text-light" />
                      </button>
                      <button 
                        onClick={() => onDelete(setting)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Quick edit for simple string values */}
                  {setting.type === 'string' ? (
                    <div className="mt-3">
                      <label className="block text-sm text-text-light mb-1">Value:</label>
                      <div className="flex gap-2">                        <input
                          type="text"
                          defaultValue={setting.value}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-primary focus:outline-none"
                          title="Setting value"
                          placeholder="Enter setting value"
                          onBlur={(e) => {
                            if (e.target.value !== setting.value) {
                              handleQuickUpdate(setting.id, e.target.value);
                            }
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleQuickUpdate(setting.id, (e.target as HTMLInputElement).value);
                            }
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <label className="block text-sm text-text-light mb-1">Value:</label>
                      <div className="bg-gray-50 p-2 rounded text-sm text-text-primary">
                        {setting.value}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-text-light mt-2">
                    Updated: {new Date(setting.updatedAt).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-text-light">
                {searchTerm ? 'No settings found matching your search' : 'No site settings found'}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="mt-4 text-sm text-text-light">
            Showing {filteredSettings.length} of {settings.length} settings
          </div>
        </>
      )}
    </div>
  );
};

export default SettingsTab;
