import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Package, ShoppingCart, Clock, CheckCircle, XCircle, Users, AlertCircle, TrendingUp, Tags, Eye, Mail } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || 'null');
        const { data } = await axios.get('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${adminInfo?.token}` }
        });
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending Confirmation': return 'bg-amber-100 text-amber-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Processing': return 'bg-indigo-100 text-indigo-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-slate-100 text-slate-800 dark:text-slate-100';
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading Dashboard...</div>;
  if (!stats) return <div className="p-8 text-center text-red-500">Failed to load statistics.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back to your store's admin panel.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white dark:bg-slate-900 dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Products</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalProducts}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Orders</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.orders.total}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Customers</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalCustomers}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Low Stock</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.lowStockCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          {stats.lowStockCount > 0 && (
            <div className="mt-4 text-sm text-amber-600 font-medium">
              Requires attention
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Emails Sent (Today)</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.todayEmailsCount || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Emails Sent (Total)</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalEmailsSent || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Pending Orders</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.orders.pending}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Confirmed Orders</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.orders.confirmed}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Cancelled Orders</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.orders.cancelled}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
           <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
           <div className="space-y-3">
             <Link to="/admin/products/new" className="block w-full text-left px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600 transition-colors font-medium text-slate-700 dark:text-slate-300 flex items-center">
               <Package className="w-4 h-4 mr-3 text-slate-400" /> Add Product
             </Link>
             <Link to="/admin/categories" className="block w-full text-left px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600 transition-colors font-medium text-slate-700 dark:text-slate-300 flex items-center">
               <Tags className="w-4 h-4 mr-3 text-slate-400" /> Categories
             </Link>
           </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-slate-900 dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm font-medium text-amber-600 hover:text-amber-700">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-900/50 text-slate-900 dark:text-white font-medium border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">#{'W!FOMART' + order.id.toString().padStart(6, '0')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 dark:text-slate-300">{order.customer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">₹{parseFloat(order.total_amount).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to="/admin/orders" className="text-amber-600 hover:text-amber-700 font-semibold flex items-center justify-end">
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Link>
                  </td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No orders placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Emails Table */}
      <div className="bg-white dark:bg-slate-900 dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Today's Emails Sent</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-900/50 text-slate-900 dark:text-white font-medium border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">User Email</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Time Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.todayEmails && stats.todayEmails.map((email) => (
                <tr key={email.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 dark:text-slate-300">{email.toEmail}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-300">{email.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                    {new Date(email.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
              {(!stats.todayEmails || stats.todayEmails.length === 0) && (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No emails sent today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;

