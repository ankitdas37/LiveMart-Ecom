import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Trash2, CheckCircle, Eye, EyeOff, Plus, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ReviewsAdmin = () => {
  const { adminUser: user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, productId: '', rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axios.get('/api/reviews/admin/all', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setReviews(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axios.put(`/api/reviews/${id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Review status updated');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await axios.delete(`/api/reviews/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Review deleted');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const openCreateModal = () => {
    setFormData({ id: null, productId: '', rating: 5, comment: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (review) => {
    setFormData({ 
      id: review.id, 
      productId: review.productId, 
      rating: review.rating, 
      comment: review.comment || '' 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (formData.id) {
        // Edit existing review
        await axios.put(`/api/reviews/${formData.id}`, {
          rating: formData.rating,
          comment: formData.comment
        }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        toast.success('Review updated successfully!');
      } else {
        // Create new review
        if (!formData.productId) {
          toast.error('Please select a product');
          setIsSubmitting(false);
          return;
        }
        await axios.post(`/api/reviews/admin-create`, {
          productId: formData.productId,
          rating: formData.rating,
          comment: formData.comment
        }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        toast.success('Review created successfully!');
      }
      setIsModalOpen(false);
      fetchReviews();
    } catch (error) {
      console.error(error);
      toast.error(formData.id ? 'Failed to update review' : 'Failed to create review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading reviews...</div>;

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Reviews</h1>
          <p className="text-slate-500 mt-1">Approve, edit, create, or delete reviews.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Review
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-4">Product</th>
                <th className="p-4">User</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Comment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-slate-900 max-w-[200px] truncate" title={review.Product?.title}>
                    {review.Product?.title || 'Unknown Product'}
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    <div className="font-medium">{review.User?.name || 'Admin'}</div>
                    <div className="text-xs text-slate-400">{review.User?.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex text-amber-500">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 max-w-xs truncate" title={review.comment}>
                    {review.comment || <span className="text-slate-400 italic">No comment</span>}
                  </td>
                  <td className="p-4">
                    {review.is_approved ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <EyeOff className="w-3 h-3 mr-1" /> Hidden
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button
                      onClick={() => toggleStatus(review.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        review.is_approved 
                          ? 'text-amber-600 hover:bg-amber-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={review.is_approved ? "Hide Review" : "Approve Review"}
                    >
                      {review.is_approved ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEditModal(review)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Review"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No reviews found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Create/Edit Review */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {formData.id ? 'Edit Review' : 'Add New Review'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {!formData.id && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product *</label>
                  <select 
                    value={formData.productId}
                    onChange={(e) => setFormData({...formData, productId: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                    required
                  >
                    <option value="">Select a Product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rating (1-5) *</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="range" 
                    min="1" 
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
                    className="w-full accent-amber-500"
                  />
                  <span className="font-bold text-amber-500 text-lg w-8 text-center">{formData.rating}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Comment</label>
                <textarea 
                  rows="4"
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  placeholder="Write your review comment here..."
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReviewsAdmin;
