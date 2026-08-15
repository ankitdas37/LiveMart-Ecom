import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';
import AdminDeleteModal from '../../components/admin/AdminDeleteModal';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Delete Modal State
  const [couponToDelete, setCouponToDelete] = useState(null); // null | id | 'bulk'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCoupons, setSelectedCoupons] = useState([]);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minCartValue: '0',
    description: '',
    expiryDate: '',
    usageLimit: '',
    isActive: true,
    isVisible: false
  });

  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get('/api/coupons');
      setCoupons(data);
    } catch (error) {
      console.error('Failed to fetch coupons', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/coupons/${editingId}`, formData);
      } else {
        await axios.post('/api/coupons', formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minCartValue: '0',
        description: '',
        expiryDate: '',
        usageLimit: '',
        isActive: true,
        isVisible: false
      });
      fetchCoupons();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving coupon');
    }
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minCartValue: coupon.minCartValue,
      description: coupon.description || '',
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive,
      isVisible: coupon.isVisible || false
    });
    setShowForm(true);
  };

  const handleToggleActive = async (coupon) => {
    try {
      await axios.put(`/api/coupons/${coupon.id}`, { isActive: !coupon.isActive });
      fetchCoupons();
    } catch (error) {
      alert('Failed to update coupon status');
    }
  };

  const handleDeleteClick = (id) => {
    setCouponToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (couponToDelete === 'bulk') {
        await axios.delete('/api/coupons/bulk', { data: { ids: selectedCoupons } });
        fetchCoupons();
        setSelectedCoupons([]);
      } else {
        await axios.delete(`/api/coupons/${couponToDelete}`);
        fetchCoupons();
      }
      setCouponToDelete(null);
      setShowDeleteModal(false);
    } catch (error) {
      alert('Failed to delete coupon');
      throw error;
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCoupons(coupons.map(c => c.id));
    } else {
      setSelectedCoupons([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Coupons</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your discount codes</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingId(null);
              setFormData({ code: '', discountType: 'PERCENTAGE', discountValue: '', minCartValue: '0', description: '', expiryDate: '', usageLimit: '', isActive: true, isVisible: false });
            }
          }}
          className="bg-amber-600 text-white px-4 py-2 rounded-xl flex items-center hover:bg-amber-700 transition-colors"
        >
          {showForm ? 'Cancel' : <><Plus className="w-5 h-5 mr-2" /> Add Coupon</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Coupon' : 'Create New Coupon'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Coupon Code</label>
              <input type="text" name="code" value={formData.code} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase" placeholder="e.g. SUMMER50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Type</label>
              <select name="discountType" value={formData.discountType} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-900">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Value</label>
              <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} required min="1" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Minimum Cart Value (₹)</label>
              <input type="number" name="minCartValue" value={formData.minCartValue} onChange={handleChange} required min="0" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Coupon Description (Optional)</label>
              <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. Get 10% off on all summer items!" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date</label>
              <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Uses Limit (Optional)</label>
              <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleChange} min="1" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Leave blank for unlimited" />
            </div>
            <div className="flex items-center space-x-6 mt-6 md:col-span-2">
              <div className="flex items-center">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="isActive" className="w-4 h-4 text-amber-600 rounded" />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium">Coupon is Active</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="isVisible" checked={formData.isVisible} onChange={handleChange} id="isVisible" className="w-4 h-4 text-amber-600 rounded" />
                <label htmlFor="isVisible" className="ml-2 text-sm font-medium">Show Publicly on Checkout</label>
              </div>
            </div>
            <div className="md:col-span-2 mt-4">
              <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-xl hover:bg-slate-800 transition-colors">
                Save Coupon
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedCoupons.length > 0 && (
        <div className="bg-amber-50 px-6 py-3 border border-amber-200 rounded-xl mb-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-md">
              {selectedCoupons.length} Selected
            </div>
            <button
              onClick={() => setSelectedCoupons([])}
              className="text-sm text-amber-700 font-medium hover:underline"
            >
              Clear Selection
            </button>
          </div>
          <button
            onClick={() => { setCouponToDelete('bulk'); setShowDeleteModal(true); }}
            className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium text-sm whitespace-nowrap hover:bg-red-700 shadow-sm flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete Selected
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedCoupons.length === coupons.length && coupons.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-amber-600 focus:ring-amber-500"
                  />
                </th>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Code</th>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Discount</th>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Min Order</th>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Uses</th>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Expires</th>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Visibility</th>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Status</th>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-500 dark:text-slate-400">Loading coupons...</td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-500 dark:text-slate-400">No coupons found. Create one above!</td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const isSelected = selectedCoupons.includes(coupon.id);
                  return (
                  <tr key={coupon.id} className={`transition-colors ${isSelected ? 'bg-amber-50' : 'hover:bg-slate-50/50'}`}>
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCoupons([...selectedCoupons, coupon.id]);
                          } else {
                            setSelectedCoupons(selectedCoupons.filter(id => id !== coupon.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-amber-600 focus:ring-amber-500"
                      />
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{coupon.code}</td>
                    <td className="p-4">
                      {coupon.discountType === 'PERCENTAGE'
                        ? `${coupon.discountValue}%`
                        : `₹${coupon.discountValue}`}
                    </td>
                    <td className="p-4">₹{coupon.minCartValue}</td>
                    <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {coupon.usedCount || 0} / {coupon.usageLimit ? coupon.usageLimit : '∞'}
                    </td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {coupon.isVisible ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${coupon.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        title="Click to toggle status"
                      >
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right flex justify-end space-x-2">
                      <button onClick={() => handleEdit(coupon)} className="text-blue-500 hover:text-blue-700 p-2" title="Edit Coupon">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDeleteClick(coupon.id)} className="text-red-500 hover:text-red-700 p-2" title="Delete Coupon">
                        <Trash2 className="w-5 h-5" />
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
        onClose={() => { setShowDeleteModal(false); setCouponToDelete(null); }}
        onConfirm={handleConfirmDelete}
        itemName={couponToDelete === 'bulk' ? `${selectedCoupons.length} Coupon(s)` : 'Coupon'}
        isBulk={couponToDelete === 'bulk'}
      />
    </div>
  );
};

export default AdminCoupons;
