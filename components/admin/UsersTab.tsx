'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UsersTabProps {
  onAdd: () => void;
  onEdit: (data: any) => void;
  onView: (data: any) => void;
  onDelete: (data: any) => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ onAdd, onEdit, onView, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Join users with user_profiles to get complete user information
      const { data, error } = await supabase        .from('users')
        .select(`
          *,
          user_profiles (
            first_name,
            last_name,
            avatar,
            bio,
            business_name,
            business_address,
            business_phone,
            location,
            preferences,
            notifications
          )
        `)
        .order('created_at', { ascending: false });      if (!error) {
        setUsers(data || []);
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);  const filteredUsers = users.filter(user => {
    const profile = user.user_profiles?.[0]; // Get the first profile if it exists
    const searchText = `${profile?.first_name || ''} ${profile?.last_name || ''} ${user.name || ''} ${user.email || ''}`.toLowerCase();
    const matchesSearch = searchText.includes(searchTerm.toLowerCase()) || 
                         profile?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role?.toLowerCase() === filterRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">User Management</h2>
        <button onClick={onAdd} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Add User
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
            placeholder="Search by name, business, or ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          title="Filter by user role"
        >
          <option value="all">All Roles</option>
          <option value="REGISTERED">Registered Users</option>
          <option value="VENDOR">Vendors</option>
          <option value="AGENT">Agents</option>
          <option value="ADMIN">Admins</option>
          <option value="GUEST">Guests</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-text-light">Loading users...</p>
        </div>
      ) : (
        <>
          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">Joined</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const profile = user.user_profiles?.[0]; // Get the first profile if it exists
                    return (
                    <tr key={user.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-text-primary">
                              {profile?.first_name && profile?.last_name 
                                ? `${profile.first_name} ${profile.last_name}` 
                                : user.name || 'No name'}
                            </div>
                            <div className="text-sm text-text-light">ID: {user.id.slice(0, 8)}...</div>
                            {profile?.businessName && (
                              <div className="text-sm text-text-light">{profile.businessName}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-text-primary">{user.email}</div>
                        {user.phone && (
                          <div className="text-sm text-text-light">{user.phone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          user.role === 'AGENT' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'VENDOR' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role || 'REGISTERED'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.is_active ? 'bg-success bg-opacity-10 text-success' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-light">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => onView(user)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-text-light" />
                          </button>
                          <button 
                            onClick={() => onEdit(user)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-text-light" />
                          </button>
                          <button 
                            onClick={() => onDelete(user)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-text-light">
                      {searchTerm || filterRole !== 'all' ? 'No users found matching your criteria' : 'No users found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-4 text-sm text-text-light">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </>
      )}
    </div>
  );
};

export default UsersTab;
