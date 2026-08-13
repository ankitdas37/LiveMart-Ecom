import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const ProductCard = ({ product }) => {
  const { addToCart, cartItems } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isInCart = cartItems.some(item => item.id === product.id);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }
    try {
      const res = await axios.post(
        '/api/wishlist',
        { productId: product.id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setIsWishlisted(res.data.added);
      if (res.data.added) toast.success('Added to wishlist!');
      else toast.success('Removed from wishlist!');
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Link to={`/product/${product.id}`}>
          <img
            src={(product.images && product.images.filter(i => i && i.trim()).length > 0 ? product.images.filter(i => i && i.trim())[0] : null) || 'https://placehold.co/400x400?text=No+Image'}
            alt={product.title}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400?text=No+Image'; }}
          />
        </Link>
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {product.is_new_arrival && (
            <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">NEW</span>
          )}
          {product.is_bestseller && (
            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">BEST SELLER</span>
          )}
        </div>
        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-4 group-hover:translate-x-0">
          <button
            onClick={handleWishlist}
            className={`p-2 rounded-full transition-colors shadow-sm ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-red-500 dark:hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (isInCart) {
                navigate('/checkout');
                return;
              }
              addToCart(product, 1);
              toast((t) => (
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-white">🛍️ Added to your cart!</span>
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      navigate('/checkout');
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold shadow-sm transition-colors whitespace-nowrap"
                  >
                    Go to Cart
                  </button>
                </div>
              ), { duration: 4000 });
            }}
            className={`w-full ${isInCart ? 'bg-amber-600' : 'bg-slate-900/90'} backdrop-blur-sm text-white py-3 rounded-xl font-medium hover:bg-amber-700 transition-colors flex items-center justify-center`}
          >
            <ShoppingBag className="w-4 h-4 mr-2" /> {isInCart ? 'Go to Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col">
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-medium">{product.category_name || ''}</div>
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">{product.title}</h3>
        </Link>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-xl font-bold text-slate-900 dark:text-white">₹{parseFloat(product.price).toFixed(2)}</span>
          {/* Real Rating */}
          {product.reviews_count > 0 && (
            <div className="flex items-center text-yellow-400 text-xs">
              {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
              <span className="text-slate-400 dark:text-slate-500 ml-1">({product.reviews_count})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
