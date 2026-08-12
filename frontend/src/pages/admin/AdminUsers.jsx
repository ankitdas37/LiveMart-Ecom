import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import {
  Users, Search, Edit, Trash2, Shield, User, Camera, X,
  CheckCircle2, Plus, Eye, Package, Mail, Calendar,
  Key, AlertCircle, ArrowUpRight, RefreshCw,
  MapPin, Monitor, Star, MessageSquare, Clock, Heart, Activity, Globe, Info, LayoutDashboard, Phone
} from 'lucide-react';
import { compressImage } from '../../utils/imageCompressor';
import AdminDeleteModal from '../../components/admin/AdminDeleteModal';

const AdminUsers = () => {
  const { adminUser: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // View Modal State
  const [viewingUser, setViewingUser] = useState(null);
  const [viewTab, setViewTab] = useState('overview');
  const [userDetails, setUserDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: '', profile_pic: '', newPassword: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Delete Modal State
  const [userToDelete, setUserToDelete] = useState(null); // null | user object | 'bulk'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Add User State
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addFormData, setAddFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [isAdding, setIsAdding] = useState(false);
  const [addMessage, setAddMessage] = useState(null);

  // Address Edit State
  const [editingAddress, setEditingAddress] = useState(null);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      const { data } = await axios.get('/api/users', config);
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewClick = async (u) => {
    setViewingUser(u);
    setViewTab('overview');
    setUserDetails(null);
    setIsLoadingDetails(true);
    try {
      const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      const { data } = await axios.get(`/api/users/${u.id}/details`, config);
      setUserDetails(data);
    } catch (error) {
      console.error('Failed to load user details', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleDeleteClick = (u) => {
    setUserToDelete(u);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      
      if (userToDelete === 'bulk') {
        await axios.delete('/api/users/bulk', { data: { ids: selectedUsers }, ...config });
        setUsers(users.filter(u => !selectedUsers.includes(u.id)));
        setSelectedUsers([]);
      } else {
        await axios.delete(`/api/users/${userToDelete.id}`, config);
        setUsers(users.filter(u => u.id !== userToDelete.id));
        if (viewingUser?.id === userToDelete.id) setViewingUser(null);
      }
      
      setUserToDelete(null);
      setShowDeleteModal(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
      throw error;
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleEditClick = (u) => {
    setEditingUser(u);
    setEditFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      profile_pic: u.profile_pic || '',
      newPassword: ''
    });
    setUpdateMessage(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const compressedFile = await compressImage(file, 400, 400, 0.7);
      const formData = new FormData();
      formData.append('image', compressedFile);
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditFormData(prev => ({ ...prev, profile_pic: data.url }));
    } catch (error) {
      setUpdateMessage({ type: 'error', text: 'Image upload failed.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      setUpdateMessage(null);
      const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      const payload = {
        name: editFormData.name,
        email: editFormData.email,
        role: editFormData.role,
        profile_pic: editFormData.profile_pic,
      };
      if (editFormData.newPassword) payload.password = editFormData.newPassword;
      const { data } = await axios.put(`/api/users/${editingUser.id}`, payload, config);
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...data } : u));
      if (viewingUser?.id === editingUser.id) setViewingUser(prev => ({ ...prev, ...data }));
      setUpdateMessage({ type: 'success', text: 'User updated successfully!' });
      setTimeout(() => setEditingUser(null), 1500);
    } catch (error) {
      setUpdateMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsAdding(true);
      setAddMessage(null);
      const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      const { data } = await axios.post('/api/users', addFormData, config);
      setUsers([data, ...users]);
      setAddMessage({ type: 'success', text: 'User created successfully!' });
      setTimeout(() => {
        setIsAddingUser(false);
        setAddFormData({ name: '', email: '', password: '', role: 'user' });
      }, 1500);
    } catch (error) {
      setAddMessage({ type: 'error', text: error.response?.data?.message || 'Creation failed' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    try {
      setIsUpdatingAddress(true);
      const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      await axios.put(`/api/users/addresses/${editingAddress.id}`, editingAddress, config);

      // Update local state
      setUserDetails(prev => ({
        ...prev,
        addresses: prev.addresses.map(a => a.id === editingAddress.id ? editingAddress : a)
      }));
      setEditingAddress(null);
    } catch (error) {
      alert('Failed to update address');
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  const initiateDeleteAddress = (address) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
    setAddressToDelete(address);
  };

  const confirmDeleteAddress = async () => {
    if (captchaInput !== captchaCode) return;
    try {
      const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      await axios.delete(`/api/users/addresses/${addressToDelete.id}`, config);
      setUserDetails(prev => ({
        ...prev,
        addresses: prev.addresses.filter(a => a.id !== addressToDelete.id)
      }));
      setAddressToDelete(null);
    } catch (error) {
      alert('Failed to delete address');
    }
  };

  const filteredUsers = users.filter(u => {
    if (!u) return false;
    const safeName = u?.name || '';
    const safeEmail = u?.email || '';
    const matchesSearch = safeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      safeEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u && u.role === 'admin').length,
    customers: users.filter(u => u && u.role === 'user').length,
    google: users.filter(u => u && u.googleId).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Full control over all user accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchUsers} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors" title="Refresh">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setIsAddingUser(true); setAddMessage(null); setAddFormData({ name: '', email: '', password: '', role: 'user' }); }}
            className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, color: 'bg-slate-900', icon: Users },
          { label: 'Admins', value: stats.admins, color: 'bg-indigo-600', icon: Shield },
          { label: 'Customers', value: stats.customers, color: 'bg-amber-600', icon: User },
          { label: 'Google Users', value: stats.google, color: 'bg-blue-600', icon: CheckCircle2 },
        ].map(stat => (
          <div key={stat.label} className={`${stat.color} text-white rounded-2xl p-4 flex items-center gap-3`}>
            <stat.icon className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-xs opacity-80 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-amber-500 outline-none"
          >
            <option value="all">All Roles</option>
            <option value="user">Customers</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {selectedUsers.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-3 border-b border-amber-100 dark:border-amber-900/50 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                {selectedUsers.length} Selected
              </div>
              <button
                onClick={() => setSelectedUsers([])}
                className="text-sm text-amber-700 dark:text-amber-400 font-medium hover:underline"
              >
                Clear Selection
              </button>
            </div>
            <button
              onClick={() => { setUserToDelete('bulk'); setShowDeleteModal(true); }}
              className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium text-sm whitespace-nowrap hover:bg-red-700 shadow-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete Selected
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold w-12">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                </th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Auth</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const isSelected = selectedUsers.includes(u.id);
                  return (
                  <tr key={u.id} className={`transition-colors ${isSelected ? 'bg-amber-50 dark:bg-amber-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, u.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-600">
                          {u.profile_pic ? (
                            <img src={u.profile_pic} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-slate-500 font-bold">{(u.name || 'User').charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {u.name}
                            {u.id === currentUser.id && (
                              <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded ml-2 border border-amber-200">You</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                        {u.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        {(u.role || 'user').charAt(0).toUpperCase() + (u.role || 'user').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.googleId ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                          🔵 Google
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          ✉️ Email
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewClick(u)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditClick(u)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(u)}
                          disabled={u.id === currentUser.id}
                          className={`p-2 rounded-lg transition-colors ${u.id === currentUser.id ? 'text-slate-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                          title={u.id === currentUser.id ? "Cannot delete yourself" : "Delete User"}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* ---- VIEW USER MODAL ---- */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" /> User Details
              </h2>
              <button onClick={() => setViewingUser(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Card */}
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700 rounded-2xl p-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 flex items-center justify-center text-3xl font-black text-slate-500 flex-shrink-0">
                  {viewingUser.profile_pic ? (
                    <img src={viewingUser.profile_pic} alt={viewingUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    (viewingUser.name || 'User').charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{viewingUser.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1"><Mail className="w-4 h-4" /> {viewingUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${viewingUser.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                      {viewingUser.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {(viewingUser.role || 'user').charAt(0).toUpperCase() + (viewingUser.role || 'user').slice(1)}
                    </span>
                    {viewingUser.googleId ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">🔵 Google</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">✉️ Email</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-100 dark:border-slate-700">
                {[
                  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                  { id: 'addresses', label: 'Addresses', icon: MapPin },
                  { id: 'devices', label: 'Devices', icon: Monitor },
                  { id: 'wishlist', label: 'Wishlist', icon: Heart },
                  { id: 'reviews', label: 'Reviews', icon: Star },
                  { id: 'tickets', label: 'Tickets', icon: MessageSquare }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setViewTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${viewTab === tab.id ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                      <Icon className="w-4 h-4" /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="min-h-[250px] max-h-[400px] overflow-y-auto pr-2">
                {isLoadingDetails ? (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="font-bold">Loading user data...</p>
                  </div>
                ) : !userDetails ? (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                    <p>Failed to load data</p>
                  </div>
                ) : (
                  <>
                    {/* OVERVIEW TAB */}
                    {viewTab === 'overview' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined</p>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{new Date(viewingUser.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><Package className="w-3 h-3" /> Total Orders</p>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{userDetails.orders.length}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Recent Orders
                          </h4>
                          {userDetails.orders.length === 0 ? (
                            <p className="text-sm text-slate-500 italic bg-slate-50 dark:bg-slate-700 p-4 rounded-xl text-center">No orders found.</p>
                          ) : (
                            <div className="space-y-2">
                              {userDetails.orders.slice(0, 5).map(order => (
                                <div key={order.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 rounded-xl px-4 py-3">
                                  <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">Order #LIVEMART{String(order.id).padStart(7, '0')}</p>
                                    <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">₹{order.total_amount ? parseFloat(order.total_amount).toFixed(2) : '0.00'}</p>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${order.status === 'Delivered' || order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'Cancelled' || order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{order.status}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ADDRESSES TAB */}
                    {viewTab === 'addresses' && (
                      <div className="space-y-3">
                        {userDetails.addresses.length === 0 ? (
                          <p className="text-sm text-slate-500 italic bg-slate-50 dark:bg-slate-700 p-4 rounded-xl text-center">No addresses saved.</p>
                        ) : (
                          userDetails.addresses.map(addr => (
                            <div key={addr.id} className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600 relative">
                              {addr.is_default && <span className="absolute top-4 right-4 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">DEFAULT</span>}
                              <p className="font-bold text-slate-900 dark:text-white mb-1">{addr.fullName} <span className="text-sm font-normal text-slate-500 ml-2">{addr.addressType}</span></p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{addr.street}, {addr.city}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{addr.state} - {addr.pincode}</p>
                              <p className="text-xs font-bold text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {addr.phone}</p>
                              {addr.location_lat && addr.location_lng && (
                                <a href={`https://www.google.com/maps/search/?api=1&query=${addr.location_lat},${addr.location_lng}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-2">
                                  <MapPin className="w-3 h-3" /> View Location Map ({addr.location_lat.substring(0, 6)}, {addr.location_lng.substring(0, 6)})
                                </a>
                              )}

                              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                                <button onClick={() => setEditingAddress(addr)} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"><Edit className="w-3 h-3" /> Edit</button>
                                <button onClick={() => initiateDeleteAddress(addr)} className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* DEVICES TAB */}
                    {viewTab === 'devices' && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Active Sessions</h4>
                          {userDetails.sessions.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No active sessions.</p>
                          ) : (
                            <div className="space-y-4">
                              {userDetails.sessions.map(s => (
                                <div key={s.id} className="border border-slate-200 dark:border-slate-600 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-700">
                                  <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-4">
                                      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-600">
                                        <Monitor className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-base flex items-center gap-3 text-slate-800 dark:text-slate-200">
                                          {s.browser} on {s.os}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Session: {s.id?.split('-')[0]}...</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                                    {[
                                      ['Device', s.device_type || 'Desktop'],
                                      ['OS', s.os || 'Windows 10'],
                                      ['Browser', s.browser || 'Chrome'],
                                      ['IP', s.ip_address || 'Unknown'],
                                      ['Location', s.location || 'Local Network'],
                                      ['Login Time', s.last_active ? new Date(s.last_active).toLocaleString() : 'Unknown']
                                    ].map(([k, v]) => (
                                      <div key={k} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-600 last:border-0">
                                        <span className="text-slate-500 text-xs">{k}</span>
                                        <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs text-right">{v}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Login History</h4>
                          {userDetails.loginActivities.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No login history.</p>
                          ) : (
                            <div className="space-y-2">
                              {userDetails.loginActivities.slice(0, 10).map(la => (
                                <div key={la.id} className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3">
                                  <div className="flex justify-between items-start mb-1">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{new Date(la.createdAt).toLocaleString()}</p>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${la.status === 'Success' || la.status === 'Successful' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{la.status}</span>
                                  </div>
                                  <p className="text-xs text-slate-500">{la.ip_address} • {la.device_type} • {la.browser}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* WISHLIST TAB */}
                    {viewTab === 'wishlist' && (
                      <div className="space-y-3">
                        {userDetails.wishlist.length === 0 ? (
                          <p className="text-sm text-slate-500 italic bg-slate-50 dark:bg-slate-700 p-4 rounded-xl text-center">Wishlist is empty.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {userDetails.wishlist.map(item => (
                              <div key={item.id} className="flex gap-3 bg-slate-50 dark:bg-slate-700 rounded-xl p-3 items-center">
                                <img src={(item.Product.images && item.Product.images[0]) || 'https://via.placeholder.com/50'} alt="product" className="w-12 h-12 rounded-lg object-cover bg-white" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.Product.name}</p>
                                  <p className="text-xs font-bold text-amber-600">₹{item.Product.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* REVIEWS TAB */}
                    {viewTab === 'reviews' && (
                      <div className="space-y-3">
                        {userDetails.reviews.length === 0 ? (
                          <p className="text-sm text-slate-500 italic bg-slate-50 dark:bg-slate-700 p-4 rounded-xl text-center">No reviews submitted.</p>
                        ) : (
                          userDetails.reviews.map(r => (
                            <div key={r.id} className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <img src={(r.Product?.images && r.Product.images[0]) || 'https://via.placeholder.com/30'} alt="prod" className="w-8 h-8 rounded object-cover bg-white" />
                                <p className="text-sm font-bold text-slate-900 dark:text-white flex-1 truncate">{r.Product?.name}</p>
                                <div className="flex text-amber-500">
                                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-current' : 'text-slate-300'}`} />)}
                                </div>
                              </div>
                              <p className="text-sm text-slate-700 dark:text-slate-300">{r.comment}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* TICKETS TAB */}
                    {viewTab === 'tickets' && (
                      <div className="space-y-3">
                        {userDetails.tickets.length === 0 ? (
                          <p className="text-sm text-slate-500 italic bg-slate-50 dark:bg-slate-700 p-4 rounded-xl text-center">No support tickets opened.</p>
                        ) : (
                          userDetails.tickets.map(t => (
                            <div key={t.id} className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{t.subject}</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.status === 'Open' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>{t.status}</span>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t.message}</p>
                              <p className="text-xs text-slate-400 font-bold">{new Date(t.createdAt).toLocaleDateString()}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => { setViewingUser(null); handleEditClick(viewingUser); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" /> Edit User
                </button>
                {viewingUser.id !== currentUser.id && (
                  <button
                    onClick={() => { setViewingUser(null); handleDeleteClick(viewingUser); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- EDIT USER MODAL ---- */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" /> Edit User
              </h2>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {updateMessage && (
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${updateMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {updateMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <p className="font-medium text-sm">{updateMessage.text}</p>
                </div>
              )}

              <form onSubmit={handleUpdateSubmit} className="space-y-5">
                {/* Avatar Upload */}
                <div className="flex justify-center mb-2">
                  <div className="relative group w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200">
                    {editFormData.profile_pic ? (
                      <img src={editFormData.profile_pic} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-400">
                        {(editFormData.name || 'User').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                      {isUploading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <><Camera className="w-6 h-6 mb-1" /><span className="text-[10px] font-bold uppercase">Upload</span></>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Key className="w-4 h-4" /> New Password <span className="text-slate-400 font-normal">(leave blank to keep current)</span>
                  </label>
                  <input
                    type="password"
                    value={editFormData.newPassword}
                    onChange={(e) => setEditFormData({ ...editFormData, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                    placeholder="Enter new password..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                    disabled={editingUser.id === currentUser.id}
                  >
                    <option value="user">Customer (User)</option>
                    <option value="admin">Administrator (Admin)</option>
                  </select>
                  {editingUser.id === currentUser.id && (
                    <p className="text-xs text-amber-600 mt-1">You cannot change your own role.</p>
                  )}
                </div>

                <div className="pt-4 flex gap-3 border-t border-slate-100 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 font-bold text-white hover:bg-amber-600 transition-colors disabled:opacity-70"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}



      {/* ---- DELETE ADDRESS CONFIRMATION MODAL ---- */}
      {addressToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-red-50 dark:bg-red-900/20">
              <h2 className="text-xl font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Delete Address
              </h2>
              <button onClick={() => setAddressToDelete(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                You are about to delete the address at <strong className="text-slate-900 dark:text-white">{addressToDelete.street}</strong>.
              </p>

              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl border border-slate-200 dark:border-slate-600 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Type this code to confirm</p>
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-[0.5em] select-none">
                  {captchaCode}
                </div>
              </div>

              <input
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                placeholder="Enter code"
                maxLength={4}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-center text-lg font-black tracking-widest focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setAddressToDelete(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAddress}
                  disabled={captchaInput !== captchaCode}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-40"
                >
                  Delete Address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- ADD USER MODAL ---- */}
      {isAddingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-600" /> Add New User
              </h2>
              <button onClick={() => setIsAddingUser(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {addMessage && (
                <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${addMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                  {addMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                  <p className="text-sm font-medium">{addMessage.text}</p>
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input type="text" required value={addFormData.name} onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input type="email" required value={addFormData.email} onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <input type="password" required value={addFormData.password} onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all" placeholder="Enter password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select value={addFormData.role} onChange={(e) => setAddFormData({ ...addFormData, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all">
                    <option value="user">Customer (User)</option>
                    <option value="admin">Administrator (Admin)</option>
                  </select>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                  <button type="button" onClick={() => setIsAddingUser(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isAdding}
                    className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isAdding ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Creating...</> : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* ---- EDIT ADDRESS MODAL ---- */}
      {editingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" /> Edit Address
              </h2>
              <button onClick={() => setEditingAddress(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateAddress} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input type="text" value={editingAddress.fullName} onChange={e => setEditingAddress({ ...editingAddress, fullName: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border-none rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Street Address</label>
                <input type="text" value={editingAddress.street} onChange={e => setEditingAddress({ ...editingAddress, street: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border-none rounded-xl" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
                  <input type="text" value={editingAddress.city} onChange={e => setEditingAddress({ ...editingAddress, city: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border-none rounded-xl" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">State</label>
                  <input type="text" value={editingAddress.state} onChange={e => setEditingAddress({ ...editingAddress, state: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border-none rounded-xl" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Pincode</label>
                  <input type="text" value={editingAddress.pincode} onChange={e => setEditingAddress({ ...editingAddress, pincode: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border-none rounded-xl" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input type="text" value={editingAddress.phone} onChange={e => setEditingAddress({ ...editingAddress, phone: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border-none rounded-xl" required />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditingAddress(null)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={isUpdatingAddress} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold flex justify-center items-center">
                  {isUpdatingAddress ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- ADMIN DELETE MODAL ---- */}
      <AdminDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={userToDelete === 'bulk' ? 'Selected Users' : (userToDelete?.name || 'User')}
        isBulk={userToDelete === 'bulk'}
      />
    </div>
  );
};

export default AdminUsers;
