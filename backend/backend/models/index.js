const { sequelize } = require('../config/db');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Category = require('./Category');
const User = require('./User');
const Coupon = require('./Coupon');
const Setting = require('./Setting');
const Brand = require('./Brand');
const ProductDetail = require('./ProductDetail');
const Review = require('./Review');
const Address = require('./Address');
const Wishlist = require('./Wishlist');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Pincode = require('./Pincode');
const ExtraCharge = require('./ExtraCharge');
const AdminNote = require('./AdminNote');
const OTP = require('./OTP');
const SupportTicket = require('./SupportTicket');
const EmailHistory = require('./EmailHistory');
const Session = require('./Session');
const LoginActivity = require('./LoginActivity');

// Associations
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Brand.hasMany(Product, { foreignKey: 'brandId' });
Product.belongsTo(Brand, { foreignKey: 'brandId' });

Product.hasOne(ProductDetail, { foreignKey: 'productId' });
ProductDetail.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(Review, { foreignKey: 'productId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Address, { foreignKey: 'userId' });
Address.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Wishlist, { foreignKey: 'userId' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(Wishlist, { foreignKey: 'productId' });
Wishlist.belongsTo(Product, { foreignKey: 'productId' });

User.hasOne(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

Product.hasMany(CartItem, { foreignKey: 'productId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });
Product.hasMany(OrderItem, { foreignKey: 'product_id' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Session, { foreignKey: 'userEmail', sourceKey: 'email' });
Session.belongsTo(User, { foreignKey: 'userEmail', targetKey: 'email' });

User.hasMany(LoginActivity, { foreignKey: 'userId' });
LoginActivity.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  Product,
  Category,
  Order,
  OrderItem,
  User,
  Coupon,
  Setting,
  Brand,
  ProductDetail,
  Review,
  Address,
  Wishlist,
  Cart,
  CartItem,
  Pincode,
  ExtraCharge,
  AdminNote,
  OTP,
  SupportTicket,
  EmailHistory,
  Session,
  LoginActivity,
};
