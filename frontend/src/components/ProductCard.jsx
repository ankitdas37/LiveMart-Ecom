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
        <div className="absolute top-2 right-2 flex flex-col space-y-2">
          <button
            onClick={handleWishlist}
            className={`p-1.5 rounded-full transition-colors shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm ${isWishlisted ? 'text-red-500' : 'text-slate-400 hover:text-red-500 dark:hover:text-red-500'}`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3 flex-grow flex flex-col">
        <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-0.5 uppercase tracking-wider font-medium line-clamp-1">{product.category_name || ''}</div>
        <Link to={`/product/${product.id}`} className="block mb-1">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">{product.title}</h3>
        </Link>
        
        {/* Rating */}
        {product.reviews_count > 0 ? (
          <div className="flex items-center gap-1.5 mb-1">
            <div className="flex items-center bg-green-600 text-white px-1 py-0.5 rounded text-[10px] sm:text-xs font-bold">
              {Number(product.rating).toFixed(1)} <span className="ml-0.5 text-[8px] sm:text-[10px]">★</span>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium">({product.reviews_count})</span>
          </div>
        ) : (
          <div className="h-4 sm:h-5 mb-1"></div>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">₹{parseFloat(product.price).toFixed(2)}</span>
          {isInCart ? (
            <button
              onClick={(e) => { e.preventDefault(); navigate('/checkout'); }}
              className="bg-green-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap flex-shrink-0"
            >
              Go to Cart
            </button>
          ) : (
            <button
              onClick={(e) => { e.preventDefault(); addToCart(product); }}
              className="bg-white border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white text-[10px] sm:text-xs font-bold px-4 py-1.5 rounded-md hover:border-amber-500 hover:text-amber-600 transition-colors shadow-sm whitespace-nowrap flex-shrink-0 dark:bg-slate-800"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
