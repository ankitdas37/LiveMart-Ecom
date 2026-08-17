import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Phone, ExternalLink, Image as ImageIcon, Search, Settings, Trash2, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageModal from '../../components/ImageModal';
import AdminDeleteModal from '../../components/admin/AdminDeleteModal';

const AdminOnlinePayments = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewImage, setViewImage] = useState(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('/api/orders');
      const onlineOrders = data.filter(order => order.payment_method === 'Online');
      setOrders(onlineOrders);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      toast.error('Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order =>
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm) ||
    order.customer_phone.includes(searchTerm)
  );

  // Selection handlers
  const isAllSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedIds.has(o.id));
  const isPartiallySelected = filteredOrders.some(o => selectedIds.has(o.id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const handleToggleOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    try {
      const idsToDelete = Array.from(selectedIds);
      await axios.delete('/api/orders/bulk', { data: { ids: idsToDelete } });
      toast.success(`✅ Successfully deleted ${idsToDelete.length} payment record(s)! All data removed from MySQL & Cloudinary.`);
      setSelectedIds(new Set());
      await fetchOrders();
    } catch (error) {
      const msg = error.response?.data?.message || 'Bulk delete failed';
      toast.error(`❌ ${msg}`);
      throw error; // re-throw so AdminDeleteModal keeps modal open on failure
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Online Payments History</h1>
          <p className="text-slate-500 dark:text-slate-400">Review all UPI/Bank Transfer transactions and screenshots</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Select All Toggle */}
          {filteredOrders.length > 0 && (
            <button
              onClick={handleToggleSelectAll}
              title={isAllSelected ? 'Deselect All' : 'Select All'}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border font-semibold text-sm transition-all ${
                isAllSelected
                  ? 'bg-amber-100 border-amber-400 text-amber-700'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-400 hover:text-amber-700'
              }`}
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </button>
          )}

          {/* Delete Selected Button */}
          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-all shadow-sm animate-pulse-once"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedIds.size})
            </button>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Selection Info Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">
              {selectedIds.size} of {filteredOrders.length} records selected
            </span>
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-amber-600 hover:underline font-medium"
          >
            Clear Selection
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading transactions...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-12 text-center">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No Online Payments Found</h3>
          <p className="text-slate-500 dark:text-slate-400">There are no orders paid via Online Transfer yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map(order => {
            const isSelected = selectedIds.has(order.id);
            return (
              <div
                key={order.id}
                className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border-2 overflow-hidden hover:shadow-md transition-all duration-200 ${
                  isSelected
                    ? 'border-amber-400 shadow-amber-100'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                {/* Screenshot Area */}
                <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 relative group cursor-pointer border-b border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                  {order.payment_receipt ? (
                    <button onClick={() => setViewImage(order.payment_receipt)} className="w-full h-full relative group">
                      <img
                        src={order.payment_receipt}
                        alt="Payment Receipt"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                        <ExternalLink className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                      </div>
                    </button>
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-sm font-medium">No Screenshot Uploaded</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-md shadow-sm ${
                      order.status === 'Confirmed' || order.status === 'Delivered'
                        ? 'bg-green-100/90 text-green-800 border border-green-200'
                        : order.status === 'Cancelled'
                        ? 'bg-red-100/90 text-red-800 border border-red-200'
                        : 'bg-amber-100/90 text-amber-800 border border-amber-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Selection Checkbox Overlay */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleOne(order.id); }}
                      className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm ${
                        isSelected
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'bg-white dark:bg-slate-900/80 border-slate-300 dark:border-slate-600 text-transparent hover:border-amber-400 hover:bg-amber-50'
                      }`}
                      title={isSelected ? 'Deselect' : 'Select for deletion'}
                    >
                      {isSelected && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order #{'W!FOMART' + order.id.toString().padStart(6, '0')}</p>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">{order.customer_name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Amount</p>
                      <p className="font-extrabold text-indigo-600 text-lg">₹{Number(order.total_amount).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-slate-400" />
                      <span className="truncate">{order.customer_email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-slate-400" />
                        <span>{order.customer_phone}</span>
                      </div>
                    </div>

                    {/* Deep Link */}
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => navigate('/admin/orders', { state: { highlightOrderId: order.id } })}
                        className="w-full mt-1 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-700 transition-colors py-2 rounded-lg font-bold text-xs uppercase tracking-wider"
                      >
                        <Settings className="w-3.5 h-3.5 mr-1.5" />
                        Show All Order Details
                      </button>
                    </div>
                  </div>

                  {/* Contact Actions */}
                  <div className="flex gap-3">
                    <a
                      href={`https://wa.me/91${order.customer_phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(order.customer_name)}!%20%E2%9C%A8%20We%20are%20reaching%20out%20from%20W!FOMART%20regarding%20the%20payment%20for%20your%20recent%20Order%20%23${'W!FOMART' + order.id.toString().padStart(6, '0')}.%20Could%20you%20please%20confirm%20a%20few%20details%20with%20us%3F%20Thank%20you!%20%F0%9F%9B%8D%EF%B8%8F`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors py-2 rounded-lg font-medium text-sm border border-[#25D366]/20"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                      WhatsApp
                    </a>
                    <a
                      href={`mailto:${order.customer_email}?subject=Action%20Required%3A%20Payment%20Update%20for%20Order%20%23${'W!FOMART' + order.id.toString().padStart(6, '0')}%20%E2%9C%A8&body=Hi%20${encodeURIComponent(order.customer_name)}%2C%0D%0A%0D%0AThank%20you%20for%20shopping%20with%20W!FOMART!%20%F0%9F%9B%8D%EF%B8%8F%0D%0A%0D%0AWe%20are%20contacting%20you%20regarding%20the%20payment%20for%20your%20recent%20Order%20%23${'W!FOMART' + order.id.toString().padStart(6, '0')}.%20Could%20you%20please%20reply%20to%20this%20email%20so%20we%20can%20assist%20you%20further%3F%0D%0A%0D%0ABest%20regards%2C%0D%0AThe%20W!FOMART%20Team%20%E2%9C%A8`}
                      className="flex-1 flex items-center justify-center bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors py-2 rounded-lg font-medium text-sm border border-indigo-100"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Image Modal */}
      {viewImage && <ImageModal imageUrl={viewImage} onClose={() => setViewImage(null)} />}

      {/* Bulk Delete Modal */}
      <AdminDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleBulkDelete}
        itemName={`${selectedIds.size} Payment Record(s)`}
        isBulk={true}
      />
    </div>
  );
};

export default AdminOnlinePayments;

