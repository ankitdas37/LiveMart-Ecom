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
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">Manage your store inventory</p>
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
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
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
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center">Loading...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center">No products found.</td></tr>
              ) : (
                filteredProducts.map((product) => {
                  const isSelected = selectedProducts.includes(product.id);
                  return (
                  <tr key={product.id} className={`transition-colors ${isSelected ? 'bg-amber-50' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4">
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
                        className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded bg-slate-100 flex-shrink-0 mr-3 overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs">Img</div>
                          )}
                        </div>
                        <span className="line-clamp-1">{product.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{product.sku || '-'}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">₹{product.price}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.is_paused ? 'bg-orange-100 text-orange-800' : product.is_published ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                        {product.is_paused ? 'Paused' : product.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleTogglePause(product.id)}
                          title={product.is_paused ? "Resume Product" : "Pause Product"}
                          className={`transition-colors ${product.is_paused ? 'text-orange-600 hover:text-orange-700' : 'text-slate-400 hover:text-orange-600'}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {product.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="text-slate-400 hover:text-amber-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(product.id)}
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
        onClose={() => { setShowDeleteModal(false); setProductToDelete(null); }}
        onConfirm={handleConfirmDelete}
        itemName={productToDelete === 'bulk' ? `${selectedProducts.length} Product(s)` : 'Product'}
        isBulk={productToDelete === 'bulk'}
      />
    </div>
  );
};

export default AdminProducts;
