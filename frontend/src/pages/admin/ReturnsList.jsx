import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { RefreshCw, Search, CheckCircle, XCircle, Package, Truck, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ReturnsList() {
  const { adminUser } = useContext(AuthContext);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${adminUser.token}` } };
      const { data } = await axios.get('/api/orders/admin/returns/all', config);
      setReturns(data);
    } catch (error) {
      console.error('Failed to fetch returns:', error);
      toast.error('Failed to load return requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [adminUser]);

  const updateReturnStatus = async (orderId, itemId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${adminUser.token}` } };
      await axios.put(`/api/orders/admin/${orderId}/item/${itemId}/return-status`, { status: newStatus }, config);
      toast.success(`Status updated to ${newStatus}`);
      fetchReturns();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredReturns = returns.filter((item) => {
    const searchMatch = 
      item.Order?.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Order?.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Product?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === 'All' || item.return_status === statusFilter;
    
    return searchMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-amber-500" />
            Returns & Replacements
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage customer return and replacement requests across all orders.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer, order ID, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm transition-colors dark:text-white outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {['All', 'Requested', 'Approved', 'Rejected', 'Returned'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Return List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No returns found</h3>
            <p className="text-slate-500 dark:text-slate-400">
              {searchTerm || statusFilter !== 'All' ? 'Try adjusting your filters.' : 'There are no active return requests at this time.'}
            </p>
          </div>
        ) : (
          filteredReturns.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md">
              {/* Product Info */}
              <div className="p-4 md:p-6 md:w-1/3 flex flex-col justify-center bg-slate-50 dark:bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700/50">
                <div className="flex gap-4">
                  <img
                    src={item.Product?.images?.[0] || 'https://via.placeholder.com/100?text=Product'}
                    alt={item.Product?.title}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div className="flex flex-col justify-center">
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 mb-1 uppercase tracking-wider">Qty: {item.quantity}</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug">{item.Product?.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">₹{Number(item.price).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Order & Customer Details */}
              <div className="p-4 md:p-6 md:w-1/3 flex flex-col justify-center gap-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm font-semibold">
                    <User className="w-4 h-4 text-slate-400" />
                    {item.Order?.customer_name}
                  </div>
                  <Link to="/admin/orders" state={{ highlightOrderId: item.Order?.id }} className="text-amber-600 hover:text-amber-700 dark:text-amber-500 text-xs font-bold flex items-center gap-1 group">
                    View Order <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <p><span className="font-medium text-slate-600 dark:text-slate-300">Phone:</span> {item.Order?.customer_phone}</p>
                  <p><span className="font-medium text-slate-600 dark:text-slate-300">Date:</span> {new Date(item.updatedAt).toLocaleDateString()}</p>
                  <p className="line-clamp-1"><span className="font-medium text-slate-600 dark:text-slate-300">Address:</span> {item.Order?.customer_address}</p>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="p-4 md:p-6 md:w-1/3 flex flex-col justify-between border-t md:border-t-0 border-slate-100 dark:border-slate-700/50">
                <div className="mb-4">
                  <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 block">Reason for Return</span>
                  <p className="text-sm text-slate-900 dark:text-white font-medium bg-slate-50 dark:bg-slate-900 p-3 rounded-xl italic border border-slate-100 dark:border-slate-700/50 line-clamp-2 text-ellipsis" title={item.return_reason}>
                    "{item.return_reason || 'No reason provided'}"
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Status</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${
                      item.return_status === 'Requested' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      item.return_status === 'Approved' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                      item.return_status === 'Returned' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {item.return_status === 'Requested' && <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />}
                      {item.return_status === 'Approved' && <Truck className="w-3.5 h-3.5" />}
                      {item.return_status === 'Returned' && <CheckCircle className="w-3.5 h-3.5" />}
                      {item.return_status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                      {item.return_status}
                    </span>
                  </div>
                  
                  <select
                    value={item.return_status}
                    onChange={(e) => updateReturnStatus(item.order_id, item.id, e.target.value)}
                    className="text-sm font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                  >
                    <option value="Requested" disabled>Requested</option>
                    <option value="Approved">Approve Return</option>
                    <option value="Returned">Mark as Returned</option>
                    <option value="Rejected">Reject Request</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
