import { useState, useEffect } from 'react';
import { Search, Award, CheckCircle2, XCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminBestSellers = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBestSeller = async (id) => {
    try {
      const product = products.find(p => p.id === id);
      if (product) {
        const updatedStatus = !product.is_bestseller;
        // Make the API call to update the product
        await axios.put(`/api/products/${id}`, { is_bestseller: updatedStatus });
        // Update local state
        setProducts(products.map(p => p.id === id ? { ...p, is_bestseller: updatedStatus } : p));
        toast.success(updatedStatus ? 'Added to Best Sellers' : 'Removed from Best Sellers');
      }
    } catch (error) {
      console.error('Failed to toggle bestseller status:', error);
      toast.error('Failed to update product');
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Award className="w-8 h-8 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Best Sellers</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage which products appear in the Best Sellers section on the home page</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex justify-between items-center flex-wrap gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search products by name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
          Currently {products.filter(p => p.is_bestseller).length} active Best Sellers
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading products...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400">Product</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400">Price</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400">Status</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400 text-right">Best Seller</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={(product.images && product.images[0]) || 'https://via.placeholder.com/50'} 
                          alt={product.title} 
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white line-clamp-1">{product.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{product.sku || 'No SKU'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-900 dark:text-white">₹{product.discount_price || product.price}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.is_published && !product.is_paused ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {product.is_published && !product.is_paused ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleBestSeller(product.id)}
                        className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          product.is_bestseller 
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                            : 'bg-slate-100 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {product.is_bestseller ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-slate-400" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-900 dark:text-white">No products found</p>
            <p className="text-sm mt-1">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBestSellers;
