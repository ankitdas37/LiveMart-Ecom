import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, EyeOff, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminDeleteModal from '../../components/admin/AdminDeleteModal';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Delete Modal State
  const [categoryToDelete, setCategoryToDelete] = useState(null); // null | id | 'bulk'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Form State
  const [formData, setFormData] = useState({ id: null, name: '', description: '', image_url: '', is_published: true, is_paused: false });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await axios.put(`/api/categories/${formData.id}`, formData);
      } else {
        await axios.post('/api/categories', formData);
      }
      fetchCategories();
      closeModal();
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error.response?.data?.message || 'Error saving category');
    }
  };

  const handleEdit = (category) => {
    setFormData(category);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setCategoryToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (categoryToDelete === 'bulk') {
        await axios.delete('/api/categories/bulk', { data: { ids: selectedCategories } });
        fetchCategories();
        setSelectedCategories([]);
      } else {
        await axios.delete(`/api/categories/${categoryToDelete}`);
        fetchCategories();
      }
      setCategoryToDelete(null);
      setShowDeleteModal(false);
      toast.success('Deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
      throw error;
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCategories(filteredCategories.map(c => c.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const toggleStatus = async (category) => {
    try {
      await axios.put(`/api/categories/${category.id}`, { ...category, is_published: !category.is_published });
      fetchCategories();
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const togglePause = async (category) => {
    try {
      await axios.put(`/api/categories/${category.id}`, { ...category, is_paused: !category.is_paused });
      fetchCategories();
    } catch (error) {
      console.error('Error toggling pause status:', error);
    }
  };

  const openModal = () => {
    setFormData({ id: null, name: '', description: '', image_url: '', is_published: true, is_paused: false });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      setIsUploading(true);
      const res = await axios.post('/api/upload', uploadData);
      setFormData(prev => ({ ...prev, image_url: res.data.url }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500">Manage your product categories</p>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Filters/Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>

      {selectedCategories.length > 0 && (
        <div className="bg-amber-50 px-6 py-3 border border-amber-200 rounded-xl mb-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-md">
              {selectedCategories.length} Selected
            </div>
            <button
              onClick={() => setSelectedCategories([])}
              className="text-sm text-amber-700 font-medium hover:underline"
            >
              Clear Selection
            </button>
          </div>
          <button
            onClick={() => { setCategoryToDelete('bulk'); setShowDeleteModal(true); }}
            className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium text-sm whitespace-nowrap hover:bg-red-700 shadow-sm flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                </th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center">Loading...</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center">No categories found.</td></tr>
              ) : (
                filteredCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                  <tr key={category.id} className={`transition-colors ${isSelected ? 'bg-amber-50' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, category.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{category.name}</td>
                    <td className="px-6 py-4">{category.description || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.is_paused ? 'bg-orange-100 text-orange-800' : category.is_published ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                        {category.is_paused ? 'Paused' : category.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => togglePause(category)}
                          title={category.is_paused ? "Resume Category" : "Pause Category"}
                          className={`transition-colors ${category.is_paused ? 'text-orange-600 hover:text-orange-700' : 'text-slate-400 hover:text-orange-600'}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {category.is_paused ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                            )}
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleStatus(category)}
                          title={category.is_published ? "Unpublish" : "Publish"}
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {category.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(category)}
                          title="Edit Category"
                          className="text-slate-400 hover:text-amber-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(category.id)}
                          title="Delete Category"
                          className="text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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
      </div>

      <AdminDeleteModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setCategoryToDelete(null); }}
        onConfirm={handleConfirmDelete}
        itemName={categoryToDelete === 'bulk' ? `${selectedCategories.length} Category(ies)` : 'Category'}
        isBulk={categoryToDelete === 'bulk'}
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {formData.id ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
                <div className="flex items-center space-x-4">
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Category" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                    />
                    {isUploading && <p className="text-xs text-amber-600 mt-1">Uploading...</p>}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-5 h-5 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Publish Category</span>
                </label>
                <p className="text-xs text-slate-500 mt-1 ml-8 mb-4">If unchecked, category will be hidden from store.</p>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_paused}
                    onChange={(e) => setFormData({ ...formData, is_paused: e.target.checked })}
                    className="w-5 h-5 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Pause Category</span>
                </label>
                <p className="text-xs text-slate-500 mt-1 ml-8">If checked, category shows as temporarily unavailable.</p>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
