import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
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

  // Price logic: discount_price = MRP (original/crossed), price = selling price
  const sellingPrice = parseFloat(product.price);
  const mrp = product.discount_price ? parseFloat(product.discount_price) : null;
  const hasDiscount = mrp && mrp > sellingPrice;
  const discountPct = hasDiscount ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

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
    <div className="group flex flex-col bg-white dark:bg-[#1f2937] rounded-sm overflow-hidden hover:shadow-[0_3px_16px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_3px_16px_rgba(0,0,0,0.4)] transition-all duration-200 border border-slate-200 dark:border-slate-700">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-white p-3">
        <Link to={`/product/${product.id}`}>
          {product.images && product.images.filter(i => i && i.trim()).length > 0 ? (
            <img
              src={product.images.filter(i => i && i.trim())[0]}
              alt={product.title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs"></div>
          )}
        </Link>

        {/* Badges — top left */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {hasDiscount && (
            <span className="bg-[#ff6161] text-white text-[10px] font-black px-2 py-0.5 rounded-sm shadow-sm">{discountPct}% OFF</span>
          )}
          {product.is_new_arrival && !hasDiscount && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm">NEW</span>
          )}
          {product.is_bestseller && !hasDiscount && (
            <span className="bg-[#ff9f00] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm">BEST SELLER</span>
          )}
        </div>

        {/* Wishlist — top right */}
        <div className="absolute top-2 right-2">
          <button
            onClick={handleWishlist}
            className={`p-1.5 rounded-full transition-colors bg-white shadow-sm border border-slate-100 ${isWishlisted ? 'text-[#ff4343]' : 'text-slate-300 hover:text-[#ff4343]'}`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-grow flex flex-col">
        <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-medium uppercase tracking-wider line-clamp-1">{product.category_name || ''}</div>
        <Link to={`/product/${product.id}`} className="block mb-1.5">
          <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-2 group-hover:text-[#2874f0] dark:group-hover:text-[#2874f0] transition-colors leading-snug">{product.title}</h3>
        </Link>

        {/* Rating */}
        {product.reviews_count > 0 ? (
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center bg-[#388e3c] text-white px-1.5 py-0.5 rounded-[3px] text-[11px] font-bold">
              {Number(product.rating).toFixed(1)} <span className="ml-0.5 text-[9px]">★</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">({product.reviews_count})</span>
          </div>
        ) : (
          <div className="h-5 mb-1.5"></div>
        )}

        {/* Price + Button */}
        <div className="mt-auto pt-2 flex items-end justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-[17px] sm:text-[19px] font-bold text-slate-900 dark:text-white leading-tight">
              ₹{sellingPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 line-through font-medium">₹{mrp.toFixed(2)}</span>
                <span className="text-[10px] font-black text-[#ff6161]">{discountPct}% off</span>
                <span className="text-[10px] font-black text-[#388e3c]">· Save ₹{(mrp - sellingPrice).toFixed(0)}</span>
              </div>
            )}
          </div>

          {isInCart ? (
            <button
              onClick={(e) => { e.preventDefault(); navigate('/checkout'); }}
              className="bg-[#ff9f00] text-white text-[11px] sm:text-xs font-bold px-4 py-1.5 rounded-sm hover:bg-[#f39800] transition-colors shadow-sm whitespace-nowrap uppercase flex-shrink-0"
            >
              Go to Cart
            </button>
          ) : (
            <button
              onClick={(e) => { e.preventDefault(); addToCart(product); }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-[#2874f0] dark:text-[#4285f4] text-[11px] sm:text-[13px] font-bold px-6 py-1.5 rounded-sm hover:border-[#2874f0] dark:hover:border-[#4285f4] transition-colors whitespace-nowrap uppercase shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex-shrink-0"
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
