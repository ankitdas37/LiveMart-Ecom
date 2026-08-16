const { Cart, CartItem, Product } = require('../models');

const MAX_CART_QUANTITY = 100; // max qty per item

// Helper: get or create the user's cart
const getOrCreateCart = async (user) => {
  let cart = await Cart.findOne({ where: { userId: user.id } });
  if (!cart) {
    cart = await Cart.create({ userId: user.id, userEmail: user.email || null });
  } else if (!cart.userEmail && user.email) {
    // Back-fill email if missing
    cart.userEmail = user.email;
    await cart.save();
  }
  return cart;
};

// @desc  Get user's cart items
// @route GET /api/cart
// @access Private
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: CartItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'title', 'price', 'discount_price', 'images', 'stock', 'cod_available', 'shipping_charge', 'extra_charges'],
            },
          ],
        },
      ],
    });

    if (!cart) {
      return res.json([]);
    }

    // Flatten to the same shape the frontend expects
    const items = (cart.CartItems || []).map((ci) => {
      const p = ci.Product || {};
      return {
        id: p.id || ci.productId,
        cartItemId: ci.id,
        title: p.title || ci.productName || 'Unknown Product',
        price: p.price || ci.productPrice || 0,
        discount_price: p.discount_price || null,
        images: p.images || [],
        image_url: p.image_url || ci.productImage || null,
        productLink: ci.productLink || `/product/${p.id || ci.productId}`,
        stock: p.stock !== undefined ? p.stock : 0,
        cod_available: p.cod_available !== undefined ? p.cod_available : false,
        shipping_charge: p.shipping_charge !== null && p.shipping_charge !== undefined ? p.shipping_charge : null,
        extra_charges: p.extra_charges || [],
        quantity: ci.quantity,
      };
    });

    res.json(items);
  } catch (error) {
    console.error('getCart error:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
};

// @desc  Add / update item in cart
// @route POST /api/cart
// @access Private
const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const parsedQty = parseInt(quantity);

  if (!parsedQty || parsedQty < 1 || !Number.isInteger(parsedQty)) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }

  try {
    const cart = await getOrCreateCart(req.user);

    // Fetch product details to store snapshot in CartItem
    const product = await Product.findByPk(productId, {
      attributes: ['id', 'title', 'price', 'images'],
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productName = product.title;
    const productPrice = product.price;
    const productImage = product.images && product.images.length > 0 ? product.images[0] : null;
    const productLink = `/product/${productId}`;

    const existing = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (existing) {
      const newQty = Math.min(existing.quantity + parsedQty, MAX_CART_QUANTITY);
      existing.quantity = newQty;
      existing.productName = productName;
      existing.productPrice = productPrice;
      if (productImage) existing.productImage = productImage;
      existing.productLink = productLink;
      existing.email = req.user.email;
      await existing.save();
    } else {
      await CartItem.create({
        cartId: cart.id,
        productId,
        email: req.user.email,
        quantity: parseInt(quantity),
        productName,
        productPrice,
        productImage,
        productLink,
      });
    }

    res.status(201).json({ message: 'Cart updated' });
  } catch (error) {
    console.error('addToCart error:', error);
    res.status(500).json({ message: 'Failed to add to cart. Please try again.' });
  }
};

// @desc  Update quantity of a cart item
// @route PUT /api/cart/:productId
// @access Private
const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;
  const parsedQty = parseInt(quantity);
  try {
    const cart = await getOrCreateCart(req.user);
    const item = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    if (parsedQty <= 0) {
      await item.destroy();
    } else {
      item.quantity = Math.min(parsedQty, MAX_CART_QUANTITY);
      await item.save();
    }
    res.json({ message: 'Quantity updated' });
  } catch (error) {
    console.error('updateCartItem error:', error);
    res.status(500).json({ message: 'Failed to update cart item' });
  }
};

// @desc  Remove a specific item from cart
// @route DELETE /api/cart/:productId
// @access Private
const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    await CartItem.destroy({ where: { cartId: cart.id, productId } });
    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error('removeFromCart error:', error);
    res.status(500).json({ message: 'Failed to remove item' });
  }
};

// @desc  Clear all items from user's cart (called after order placed)
// @route DELETE /api/cart
// @access Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (cart) {
      await CartItem.destroy({ where: { cartId: cart.id } });
    }
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('clearCart error:', error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
};

// @desc  Sync a batch of items (called after login, from localStorage)
// @route POST /api/cart/sync
// @access Private
const syncCart = async (req, res) => {
  const { items } = req.body; // [{ productId, quantity }]
  try {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.json({ message: 'Nothing to sync' });
    }
    const cart = await getOrCreateCart(req.user);
    for (const { productId, quantity } of items) {
      // Fetch product snapshot
      const product = await Product.findByPk(productId, {
        attributes: ['id', 'title', 'price', 'images'],
      });
      const productName = product ? product.title : null;
      const productPrice = product ? product.price : null;
      const productImage = product
        ? (product.images && product.images.length > 0 ? product.images[0] : product.image_url || null)
        : null;
      const productLink = `/product/${productId}`;

      const existing = await CartItem.findOne({ where: { cartId: cart.id, productId } });
      if (existing) {
        if (parseInt(quantity) > existing.quantity) {
          existing.quantity = parseInt(quantity);
        }
        if (productName) existing.productName = productName;
        if (productPrice) existing.productPrice = productPrice;
        if (productImage) existing.productImage = productImage;
        existing.productLink = productLink;
        existing.email = req.user.email;
        await existing.save();
      } else {
        await CartItem.create({
          cartId: cart.id,
          productId,
          email: req.user.email,
          quantity: parseInt(quantity) || 1,
          productName,
          productPrice,
          productImage,
          productLink,
        });
      }
    }
    res.json({ message: 'Cart synced' });
  } catch (error) {
    console.error('syncCart error:', error);
    res.status(500).json({ message: 'Failed to sync cart' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart, syncCart };
