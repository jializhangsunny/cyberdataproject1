// components/UserManagement.js
"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import userService from '../services/users';
import { useAuth } from '../context/authContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    type: 'viewer'
  });

  const { hasRole } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (value) => {
    setFormData({
      ...formData,
      type: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userService.update(editingUser.id, {
          name: formData.name,
          email: formData.email,
          type: formData.type
        });
      } else {
        await userService.create(formData);
      }
      
      await fetchUsers();
      resetForm();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      type: user.type
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await userService.remove(userId);
        await fetchUsers();
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      type: 'viewer'
    });
    setEditingUser(null);
    setShowCreateForm(false);
  };

  if (!hasRole(['admin'])) {
    return (
      <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
        <Card className="p-8 bg-gray-800">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
          <p>You don't have permission to access user management.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {showCreateForm ? 'Cancel' : 'Add New User'}
          </button>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-4 rounded mb-4">
            {error}
          </div>
        )}

        {/* Create/Edit User Form */}
        {showCreateForm && (
          <Card className="p-6 mb-6 bg-gray-800 text-white">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-600 rounded bg-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-600 rounded bg-gray-700 text-white"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength="6"
                    className="w-full p-3 border border-gray-600 rounded bg-gray-700 text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">User Type</label>
                <Select onValueChange={handleSelectChange} value={formData.type}>
                  <SelectTrigger className="w-full p-3 border border-gray-600 rounded bg-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Users List */}
        <Card className="p-6 bg-gray-800 text-white">
          <h2 className="text-xl font-bold mb-4">Users</h2>
          
          {loading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Created</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm ${
                          user.type === 'admin' ? 'bg-red-600' :
                          user.type === 'analyst' ? 'bg-blue-600' : 'bg-green-600'
                        }`}>
                          {user.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No users found
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;