import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import AdminDeleteModal from '../../components/admin/AdminDeleteModal';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Delete Modal State
  const [productToDelete, setProductToDelete] = useState(null); // null | id | 'bulk'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (productToDelete === 'bulk') {
        await axios.delete('/api/products/bulk', { data: { ids: selectedProducts } });
        setProducts(products.filter(p => !selectedProducts.includes(p.id)));
        setSelectedProducts([]);
      } else {
        await axios.delete(`/api/products/${productToDelete}`);
        setProducts(products.filter(p => p.id !== productToDelete));
      }
      setProductToDelete(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product.');
      throw error;
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(filteredProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const product = products.find(p => p.id === id);
      if (product) {
        const updatedStatus = !product.is_published;
        await axios.put(`/api/products/${id}`, { is_published: updatedStatus });
        setProducts(products.map(p => p.id === id ? { ...p, is_published: updatedStatus } : p));
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert('Failed to update product status.');
    }
  };

  const handleTogglePause = async (id) => {
    try {
      const product = products.find(p => p.id === id);
      if (product) {
        const updatedPause = !product.is_paused;
        await axios.put(`/api/products/${id}`, { is_paused: updatedPause });
        setProducts(products.map(p => p.id === id ? { ...p, is_paused: updatedPause } : p));
      }
    } catch (error) {
      console.error('Failed to toggle pause:', error);
      alert('Failed to update product status.');
    }
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Products</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your store inventory</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Link>
      </div>

      {/* Filters/Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>

      {selectedProducts.length > 0 && (
        <div className="bg-amber-50 px-6 py-3 border border-amber-200 rounded-xl mb-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-md">
              {selectedProducts.length} Selected
            </div>
            <button
              onClick={() => setSelectedProducts([])}
              className="text-sm text-amber-700 font-medium hover:underline"
            >
              Clear Selection
            </button>
          </div>
          <button
            onClick={() => { setProductToDelete('bulk'); setShowDeleteModal(true); }}
            className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium text-sm whitespace-nowrap hover:bg-red-700 shadow-sm flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete Selected
          </button>
        </div>
      )}

      {/* Responsive Table/Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="overflow-x-auto md:overflow-visible">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400 block md:table">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 hidden md:table-header-group">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:bg-slate-800 text-amber-600 focus:ring-amber-500"
                  />
                </th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 block md:table-row-group">
              {isLoading ? (
                <tr className="block md:table-row"><td colSpan="7" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 block md:table-cell">Loading amazing products...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr className="block md:table-row"><td colSpan="7" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 block md:table-cell">No products found. Start adding some!</td></tr>
              ) : (
                filteredProducts.map((product) => {
                  const isSelected = selectedProducts.includes(product.id);
                  return (
                  <tr key={product.id} className={`group block md:table-row transition-all duration-300 mb-4 md:mb-0 border border-slate-200 dark:border-slate-700 md:border-0 dark:border-slate-700 rounded-2xl mx-4 md:mx-0 shadow-sm md:shadow-none bg-white dark:bg-slate-900 ${isSelected ? 'bg-amber-50/50 dark:bg-amber-900/10 md:ring-0 ring-2 ring-amber-400' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50 md:hover:shadow-lg md:hover:-translate-y-0.5'}`}>
                    <td className="px-4 py-3 md:px-6 md:py-4 flex md:table-cell items-center justify-between border-b md:border-b-0 border-slate-100 dark:border-slate-800/50">
                      <span className="md:hidden font-semibold text-xs text-slate-400 uppercase tracking-wider">Select</span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product.id]);
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                          }
                        }}
                        className="w-5 h-5 md:w-4 md:h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:bg-slate-800 text-amber-600 focus:ring-amber-500 transition-transform active:scale-90"
                      />
                    </td>
                    <td className="px-4 py-4 md:px-6 md:py-4 font-bold text-slate-900 dark:text-white block md:table-cell border-b md:border-b-0 border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center">
                        <div className="w-14 h-14 md:w-10 md:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 mr-4 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform duration-300">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">Img</div>
                          )}
                        </div>
                        <span className="line-clamp-2 leading-tight">{product.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 flex md:table-cell items-center justify-between border-b md:border-b-0 border-slate-100 dark:border-slate-800/50">
                       <span className="md:hidden font-semibold text-xs text-slate-400 uppercase tracking-wider">SKU</span>
                       <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-400 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{product.sku || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 flex md:table-cell items-center justify-between border-b md:border-b-0 border-slate-100 dark:border-slate-800/50">
                       <span className="md:hidden font-semibold text-xs text-slate-400 uppercase tracking-wider">Price</span>
                       <span className="font-black text-lg md:text-sm text-slate-900 dark:text-white dark:text-amber-400">₹{product.price}</span>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 flex md:table-cell items-center justify-between border-b md:border-b-0 border-slate-100 dark:border-slate-800/50">
                      <span className="md:hidden font-semibold text-xs text-slate-400 uppercase tracking-wider">Stock</span>
                      <span className={`inline-flex items-center px-3 py-1 md:px-2.5 md:py-0.5 rounded-full text-xs font-bold border ${product.stock > 10 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50' : product.stock > 0 ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50'}`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 flex md:table-cell items-center justify-between border-b md:border-b-0 border-slate-100 dark:border-slate-800/50">
                      <span className="md:hidden font-semibold text-xs text-slate-400 uppercase tracking-wider">Status</span>
                      <span className={`inline-flex items-center px-3 py-1 md:px-2.5 md:py-0.5 rounded-full text-xs font-bold border ${product.is_paused ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50' : product.is_published ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50' : 'bg-slate-100 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}`}>
                        {product.is_paused ? 'Paused' : product.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-4 md:px-6 md:py-4 block md:table-cell bg-slate-50/50 dark:bg-slate-900/50 dark:bg-slate-900 md:bg-transparent">
                      <div className="flex items-center justify-end md:justify-end space-x-2 md:space-x-3">
                        <button
                          onClick={() => handleTogglePause(product.id)}
                          title={product.is_paused ? "Resume Product" : "Pause Product"}
                          className={`p-2 rounded-lg transition-all ${product.is_paused ? 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200' : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'}`}
                        >
                          <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {product.is_paused ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                            )}
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(product.id)}
                          title={product.is_published ? "Unpublish" : "Publish"}
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                        >
                          {product.is_published ? <EyeOff className="w-5 h-5 md:w-4 md:h-4" /> : <Eye className="w-5 h-5 md:w-4 md:h-4" />}
                        </button>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                        >
                          <Edit2 className="w-5 h-5 md:w-4 md:h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(product.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                          <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
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
        onClose={() => { setShowDeleteModal(false); setProductToDelete(null); }}
        onConfirm={handleConfirmDelete}
        itemName={productToDelete === 'bulk' ? `${selectedProducts.length} Product(s)` : 'Product'}
        isBulk={productToDelete === 'bulk'}
      />
    </div>
  );
};

export default AdminProducts;
