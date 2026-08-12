import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Upload, FileText, Check, AlertCircle, File, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminDeleteModal from '../../components/admin/AdminDeleteModal';

const AdminNotes = () => {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Delete Modal State
  const [noteToDelete, setNoteToDelete] = useState(null); // null | id | 'bulk'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    target_type: 'all',
    target_user_email: '',
    target_product_id: '',
    target_order_status: '',
    target_order_id: '',
    file_url: '',
    file_type: 'other',
    file_name: '',
    is_active: true
  });

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('/api/admin-notes');
      setNotes(data);
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setIsUploading(true);
      const res = await axios.post('/api/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      let fileType = 'other';
      if (file.type.startsWith('image/')) fileType = 'image';
      else if (file.type === 'application/pdf') fileType = 'pdf';

      setFormData(prev => ({
        ...prev,
        file_url: res.data.url,
        file_type: fileType,
        file_name: file.name
      }));
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, file_url: '', file_type: 'other', file_name: '' }));
  };

  const openModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content || '',
        priority: note.priority,
        target_type: note.target_type,
        target_user_email: note.target_user_email || '',
        target_product_id: note.target_product_id || '',
        target_order_status: note.target_order_status || '',
        target_order_id: note.target_order_id || '',
        file_url: note.file_url || '',
        file_type: note.file_type || 'other',
        file_name: note.file_name || '',
        is_active: note.is_active
      });
    } else {
      setEditingNote(null);
      setFormData({
        title: '',
        content: '',
        priority: 'normal',
        target_type: 'all',
        target_user_email: '',
        target_product_id: '',
        target_order_status: '',
        target_order_id: '',
        file_url: '',
        file_type: 'other',
        file_name: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up target fields based on target_type
      const payload = { ...formData };
      if (payload.target_type !== 'user') payload.target_user_email = null;
      if (payload.target_type !== 'product') payload.target_product_id = null;
      if (payload.target_type !== 'order_status') payload.target_order_status = null;
      if (payload.target_type !== 'order') payload.target_order_id = null;

      if (editingNote) {
        await axios.put(`/api/admin-notes/${editingNote.id}`, payload);
        toast.success('Note updated');
      } else {
        await axios.post('/api/admin-notes', payload);
        toast.success('Note created');
      }
      setIsModalOpen(false);
      fetchNotes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save note');
    }
  };

  const handleDeleteClick = (id) => {
    setNoteToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (noteToDelete === 'bulk') {
        await axios.delete('/api/admin-notes/bulk', { data: { ids: selectedNotes } });
        toast.success('Notes deleted');
        fetchNotes();
        setSelectedNotes([]);
      } else {
        await axios.delete(`/api/admin-notes/${noteToDelete}`);
        toast.success('Note deleted');
        fetchNotes();
      }
      setNoteToDelete(null);
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Failed to delete note(s)');
      throw error;
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedNotes(notes.map(n => n.id));
    } else {
      setSelectedNotes([]);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading notes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Notes & Announcements</h1>
          <p className="text-slate-500">Create notes with attachments for specific users, products, or order statuses.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center hover:bg-slate-800 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Note
        </button>
      </div>

      {selectedNotes.length > 0 && (
        <div className="bg-amber-50 px-6 py-3 border border-amber-200 rounded-xl mb-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-md">
              {selectedNotes.length} Selected
            </div>
            <button
              onClick={() => setSelectedNotes([])}
              className="text-sm text-amber-700 font-medium hover:underline"
            >
              Clear Selection
            </button>
          </div>
          <button
            onClick={() => { setNoteToDelete('bulk'); setShowDeleteModal(true); }}
            className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium text-sm whitespace-nowrap hover:bg-red-700 shadow-sm flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete Selected
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedNotes.length === notes.length && notes.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                </th>
                <th className="p-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">Title & Content</th>
                <th className="p-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">Target</th>
                <th className="p-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">Priority</th>
                <th className="p-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">Attachment</th>
                <th className="p-4 text-xs font-semibold tracking-wide text-slate-500 uppercase text-center">Status</th>
                <th className="p-4 text-xs font-semibold tracking-wide text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No notes found. Create one to get started.
                  </td>
                </tr>
              ) : (
                notes.map(note => {
                  const isSelected = selectedNotes.includes(note.id);
                  return (
                  <tr key={note.id} className={`transition-colors ${isSelected ? 'bg-amber-50' : 'hover:bg-slate-50/50'}`}>
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedNotes([...selectedNotes, note.id]);
                          } else {
                            setSelectedNotes(selectedNotes.filter(id => id !== note.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{note.title}</div>
                      <div className="text-sm text-slate-500 mt-1 line-clamp-1 max-w-xs">{note.content}</div>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{note.target_type}</span>
                        {note.target_type === 'user' && <span className="text-sm font-medium text-slate-700">{note.target_user_email}</span>}
                        {note.target_type === 'product' && <span className="text-sm font-medium text-slate-700">ID: {note.target_product_id}</span>}
                        {note.target_type === 'order_status' && <span className="text-sm font-medium text-slate-700">{note.target_order_status}</span>}
                        {note.target_type === 'order' && <span className="text-sm font-medium text-slate-700">Order #{note.target_order_id}</span>}
                        {note.target_type === 'all_orders' && <span className="text-sm font-medium text-slate-700">All Orders Only</span>}
                        {note.target_type === 'all' && <span className="text-sm font-medium text-slate-700">Global</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getPriorityColor(note.priority)}`}>
                        {note.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      {note.file_url ? (
                        <a href={note.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors group">
                          {note.file_type === 'image' ? <ImageIcon className="w-4 h-4 mr-1.5" /> : <FileText className="w-4 h-4 mr-1.5" />}
                          <span className="truncate max-w-[120px] group-hover:underline">{note.file_name || 'View File'}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm italic">None</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${note.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        {note.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openModal(note)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-1">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteClick(note.id)} className="text-slate-400 hover:text-red-500 p-2 transition-colors" title="Delete Note">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminDeleteModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setNoteToDelete(null); }}
        onConfirm={handleConfirmDelete}
        itemName={noteToDelete === 'bulk' ? `${selectedNotes.length} Note(s)` : 'Note'}
        isBulk={noteToDelete === 'bulk'}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">{editingNote ? 'Edit Note' : 'Create New Note'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              <form id="noteForm" onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Note Title <span className="text-red-500">*</span></label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all" placeholder="Enter note title..." />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Content Details</label>
                    <textarea name="content" value={formData.content} onChange={handleInputChange} rows="4" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all resize-none" placeholder="Enter detailed note content here..."></textarea>
                  </div>

                  {/* Settings Grid */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority Level</label>
                      <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white">
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Audience</label>
                      <select name="target_type" value={formData.target_type} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white">
                        <option value="all">Global (All users/orders)</option>
                        <option value="all_orders">All Orders</option>
                        <option value="user">Specific User</option>
                        <option value="product">Specific Product</option>
                        <option value="order_status">Specific Order Status</option>
                        <option value="order">Specific Order No</option>
                      </select>
                    </div>

                    {/* Conditional Target Inputs */}
                    {formData.target_type === 'user' && (
                      <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">User Email Address <span className="text-red-500">*</span></label>
                        <input type="email" name="target_user_email" value={formData.target_user_email} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white" placeholder="e.g. user@example.com" />
                      </div>
                    )}

                    {formData.target_type === 'product' && (
                      <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product ID <span className="text-red-500">*</span></label>
                        <input type="number" name="target_product_id" value={formData.target_product_id} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white" placeholder="e.g. 15" />
                      </div>
                    )}

                    {formData.target_type === 'order_status' && (
                      <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Order Status <span className="text-red-500">*</span></label>
                        <select name="target_order_status" value={formData.target_order_status} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white">
                          <option value="">Select a status...</option>
                          <option value="Pending Confirmation">Pending Confirmation</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    )}

                    {formData.target_type === 'order' && (
                      <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Order ID / Number <span className="text-red-500">*</span></label>
                        <input type="number" name="target_order_id" value={formData.target_order_id} onChange={handleInputChange} required className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white" placeholder="e.g. 15" />
                      </div>
                    )}
                  </div>

                  {/* File Upload Section */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Attachment (Optional)</label>
                    {!formData.file_url ? (
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                        <input type="file" onChange={handleFileUpload} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" accept="image/*,.pdf" />
                        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                          <Upload className="w-8 h-8 text-slate-400" />
                          <div className="text-sm font-medium text-slate-900">
                            {isUploading ? 'Uploading...' : 'Click or drag file to attach'}
                          </div>
                          <div className="text-xs text-slate-500">Supports PDF or Image files</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                            {formData.file_type === 'image' ? <ImageIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-bold text-slate-900 truncate">{formData.file_name || 'Attached File'}</p>
                            <a href={formData.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">View File</a>
                          </div>
                        </div>
                        <button type="button" onClick={removeFile} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4 flex-shrink-0">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 flex items-center mt-2">
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="sr-only" />
                        <div className={`block w-14 h-8 rounded-full transition-colors ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.is_active ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                      <div className="ml-3 text-sm font-bold text-slate-700">
                        Active & Visible
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button type="submit" form="noteForm" disabled={isUploading} className="px-6 py-2.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50">
                {editingNote ? 'Save Changes' : 'Create Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotes;
