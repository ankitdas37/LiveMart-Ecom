import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle, ShoppingBag, CheckCircle, Package } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const OrderHelp = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get(`/api/orders/${id}`, config);
        setOrder(res.data);
        if (!formData.name && res.data.customer_name) {
          setFormData(prev => ({
            ...prev,
            name: res.data.customer_name,
            email: res.data.customer_email
          }));
        }
      } catch (err) {
        console.error("Failed to fetch order details:", err);
        setError(err.response?.data?.message || 'Order not found or unauthorized');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, user?.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject) {
      toast.error('Please select a subject.');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter a message describing your issue.');
      return;
    }

    setIsSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      if (formData.subject === 'Cancel Order') {
        await axios.put(`/api/orders/${id}/cancel`, {}, config);

        try {
          // Play notification sound
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(e => console.log('Audio play prevented by browser', e));
        } catch (e) { }

        toast.success('Order Cancelled successfully!', { icon: '❌', duration: 4000 });
        window.alert('SUCCESS: Your order has been cancelled successfully.');
        navigate(`/order/${id}`);
      } else {
        await axios.post('/api/support', { ...formData, subject: `Issue with Order #${id} - ${formData.subject}` }, config);
        toast.success('Support request submitted! We will email you back soon.');
        navigate(`/order/${id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Order Not Found</h2>
        <p className="text-slate-500 text-center max-w-sm">{error || "We couldn't load this order. It might not exist or you don't have permission to view it."}</p>
        <button
          onClick={() => navigate('/profile')}
          className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(`/order/${id}`)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Order
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
            <h1 className="text-3xl font-extrabold mb-2 relative z-10">Order Support</h1>
            <p className="text-slate-400 text-lg relative z-10">We're here to help you with {order?.orderId || `Order #W!FOMART${id.toString().padStart(6, '0')}`}</p>
          </div>

          <div className="p-8">
            {/* Order Summary Snapshot */}
            {order && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{order.orderId || `Order #W!FOMART${id.toString().padStart(6, '0')}`}</p>
                  <p className="text-sm text-slate-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="ml-auto">
                  <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    {order.status}
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Subject <span className="text-red-500">*</span></label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium text-slate-900"
                  required
                >
                  <option value="" disabled>Select an issue...</option>
                  {order && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <option value="Cancel Order">Cancel Order</option>
                  )}
                  <option value="Other">Other Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">How can we help?</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe the issue you're having with this order..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium text-slate-900 h-40 resize-y"
                  required
                ></textarea>
                <p className="mt-2 text-sm text-slate-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Please include any relevant details.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Request
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHelp;
