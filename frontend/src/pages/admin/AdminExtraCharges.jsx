import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';

const AdminExtraCharges = () => {
  const [charges, setCharges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    isActive: true,
    targetCategories: [],
    targetProducts: []
  });

  const fetchInitialData = async () => {
    try {
      const [chargesRes, categoriesRes, productsRes] = await Promise.all([
        axios.get('/api/extracharges'),
        axios.get('/api/categories'),
        axios.get('/api/products')
      ]);
      setCharges(chargesRes.data);
      setCategories(categoriesRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCharges = async () => {
    try {
      const { data } = await axios.get('/api/extracharges');
      setCharges(data);
    } catch (error) {
      console.error('Failed to fetch extra charges', error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleArrayToggle = (arrayName, id) => {
    const current = formData[arrayName] || [];
    if (current.includes(id)) {
      setFormData({ ...formData, [arrayName]: current.filter(item => item !== id) });
    } else {
      setFormData({ ...formData, [arrayName]: [...current, id] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/extracharges/${editingId}`, formData);
      } else {
        await axios.post('/api/extracharges', formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        isActive: true,
        targetCategories: [],
        targetProducts: []
      });
      fetchCharges();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving extra charge');
    }
  };

  const handleEdit = (charge) => {
    setEditingId(charge.id);
    setFormData({
      name: charge.name,
      description: charge.description || '',
      price: charge.price,
      isActive: charge.isActive,
      targetCategories: [],
      targetProducts: []
    });
    setShowForm(true);
  };

  const handleToggleActive = async (charge) => {
    try {
      await axios.put(`/api/extracharges/${charge.id}`, { isActive: !charge.isActive });
      fetchCharges();
    } catch (error) {
      alert('Failed to update extra charge status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this extra charge?')) {
      try {
        await axios.delete(`/api/extracharges/${id}`);
        fetchCharges();
      } catch (error) {
        alert('Failed to delete extra charge');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Extra Charges</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage additional fees like Gift Wrap, Extended Warranty, etc.</p>
        </div>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingId(null);
              setFormData({ name: '', description: '', price: '', isActive: true, targetCategories: [], targetProducts: [] });
            }
          }}
          className="bg-amber-600 text-white px-4 py-2 rounded-xl flex items-center hover:bg-amber-700 transition-colors"
        >
          {showForm ? 'Cancel' : <><Plus className="w-5 h-5 mr-2" /> Add Charge</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Extra Charge' : 'Create New Extra Charge'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name / Title</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. Gift Wrap" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Short Description (Optional)</label>
              <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. Include a personalized message and premium wrapping paper." />
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50 h-48 overflow-y-auto">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 border-b pb-2 mb-2">Apply to Categories (One-Time Bulk Update)</label>
                {categories.length === 0 ? <p className="text-xs text-slate-500 dark:text-slate-400">No categories found.</p> : categories.map(cat => (
                  <label key={cat.id} className="flex items-center space-x-2 py-1 cursor-pointer">
                    <input type="checkbox" checked={formData.targetCategories.includes(cat.id)} onChange={() => handleArrayToggle('targetCategories', cat.id)} className="text-amber-600 rounded" />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50 h-48 overflow-y-auto">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 border-b pb-2 mb-2">Apply to Specific Products (One-Time Update)</label>
                {products.length === 0 ? <p className="text-xs text-slate-500 dark:text-slate-400">No products found.</p> : products.map(prod => (
                  <label key={prod.id} className="flex items-center space-x-2 py-1 cursor-pointer">
                    <input type="checkbox" checked={formData.targetProducts.includes(prod.id)} onChange={() => handleArrayToggle('targetProducts', prod.id)} className="text-amber-600 rounded" />
                    <span className="text-sm truncate">{prod.title}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-6 mt-4 md:col-span-2">
              <div className="flex items-center">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="isActive" className="w-4 h-4 text-amber-600 rounded" />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium">Is Active</label>
              </div>
            </div>
            <div className="md:col-span-2 mt-4">
              <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-xl hover:bg-slate-800 transition-colors">
                Save Extra Charge
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Name</th>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Description</th>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Price</th>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Status</th>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 dark:text-slate-400">Loading extra charges...</td>
                </tr>
              ) : charges.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 dark:text-slate-400">No extra charges found. Create one above!</td>
                </tr>
              ) : (
                charges.map((charge) => (
                  <tr key={charge.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{charge.name}</td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{charge.description || '-'}</td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">₹{charge.price}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleToggleActive(charge)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          charge.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {charge.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right flex justify-end space-x-2">
                      <button onClick={() => handleEdit(charge)} className="text-blue-500 hover:text-blue-700 p-2" title="Edit Charge">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(charge.id)} className="text-red-500 hover:text-red-700 p-2" title="Delete Charge">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminExtraCharges;
