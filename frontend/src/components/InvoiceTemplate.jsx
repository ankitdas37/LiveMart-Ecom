import React from 'react';

const InvoiceTemplate = ({ order }) => {
  if (!order) return null;

  const subtotal = order.OrderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const discount = Number(order.discountAmount) || 0;
  const total = Number(order.total_amount) || 0;
  const charges = total - subtotal + discount;
  
  let totalSaved = discount;
  order.OrderItems.forEach(item => {
    const regular = Number(item.Product?.discount_price) || 0;
    const sale = Number(item.price) || 0;
    if (regular > sale) {
      totalSaved += (regular - sale) * item.quantity;
    }
  });

  return (
    <div id={`invoice-${order.id}`} className="bg-white text-slate-900 p-10 font-sans" style={{ width: '800px', margin: '0 auto', position: 'absolute', left: '-9999px', top: '-9999px' }}>
      
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-amber-600 mb-1">INVOICE</h1>
          <p className="text-sm font-semibold text-slate-500">Order #{'LIVEMART' + order.id.toString().padStart(6, '0')}</p>
          <p className="text-sm text-slate-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="text-right text-sm text-slate-600 space-y-1">
          <p className="font-black text-slate-800 text-2xl">
            <span style={{ color: '#1e293b' }}>Live</span>
            <span style={{ color: '#FF8C00' }}>Mart</span>
          </p>
          <p className="text-xs text-slate-500">LIVE BETTER, SHOP SMARTER</p>
          <p>support@livemart.in</p>
        </div>
      </div>

      {/* Customer & Order Details */}
      <div className="flex justify-between mb-8 text-sm">
        <div className="w-1/2 pr-4 space-y-2">
          <h3 className="font-bold text-slate-800 uppercase tracking-wider border-b pb-2 mb-2">Billed To</h3>
          <p className="font-semibold text-slate-900 text-lg">{order.customer_name}</p>
          <p className="text-slate-600">{order.customer_email}</p>
          <p className="text-slate-600">{order.customer_phone}</p>
          {order.alt_phone && <p className="text-slate-600">Alt: {order.alt_phone}</p>}
          {order.is_registered_user && (
            <p className="text-xs font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded mt-1">✓ Registered Member</p>
          )}
        </div>
        <div className="w-1/2 pl-4 space-y-2">
          <h3 className="font-bold text-slate-800 uppercase tracking-wider border-b pb-2 mb-2">Shipping Address</h3>
          <p className="text-slate-600">{order.customer_address}</p>
          {order.landmark && <p className="text-slate-600">Landmark: {order.landmark}</p>}
          <p className="text-slate-600">{order.city}, {order.district}</p>
          <p className="text-slate-600">{order.country} - {order.pincode}</p>
        </div>
      </div>

      {order.order_notes && (
        <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <h3 className="font-bold text-amber-800 uppercase tracking-wider text-xs mb-1">Order Notes</h3>
          <p className="text-sm text-slate-700">{order.order_notes}</p>
        </div>
      )}

      {/* Payment & Delivery Info */}
      <div className="flex justify-between mb-8 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="space-y-1">
          <p className="text-slate-500 font-medium">Payment Method:</p>
          <p className="font-bold text-slate-900">{order.payment_method}</p>
        </div>
        <div className="space-y-1">
          <p className="text-slate-500 font-medium">Order Status:</p>
          <p className="font-bold text-slate-900">{order.status}</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-slate-500 font-medium">Estimated Delivery:</p>
          <p className="font-bold text-slate-900">{order.estimated_delivery_time || 'Not specified'}</p>
        </div>
      </div>

      {/* Order Items Table */}
      <div className="mb-8">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-800">
              <th className="py-3 font-bold text-slate-800">Item Description</th>
              <th className="py-3 font-bold text-slate-800 text-center">Qty</th>
              <th className="py-3 font-bold text-slate-800 text-right">Price</th>
              <th className="py-3 font-bold text-slate-800 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.OrderItems.map((item, index) => (
              <tr key={index} className="border-b border-slate-200">
                <td className="py-4">
                  <p className="font-medium text-slate-900">{item.Product?.title || 'Unknown Product'}</p>
                  {item.Product?.discount_price && Number(item.Product.discount_price) > Number(item.price) && (
                    <p className="text-xs text-slate-500">
                      Regular Price: <span className="line-through">₹{Number(item.Product.discount_price).toFixed(2)}</span>
                    </p>
                  )}
                </td>
                <td className="py-4 text-center text-slate-600">{item.quantity}</td>
                <td className="py-4 text-right text-slate-600">₹{Number(item.price).toFixed(2)}</td>
                <td className="py-4 text-right font-medium text-slate-900">₹{(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-1/2 space-y-3 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {charges > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Delivery & Extra Charges</span>
              <span>+₹{charges.toFixed(2)}</span>
            </div>
          )}
          {order.couponCode && (
            <div className="flex justify-between text-slate-600">
              <span>Discount ({order.couponCode})</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-slate-900 border-t-2 border-slate-800 pt-3">
            <span>Total Amount</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          {totalSaved > 0 && (
            <div className="flex justify-between font-bold text-emerald-600 mt-2">
              <span>Total Savings on this order</span>
              <span>₹{totalSaved.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Receipt Link/Image (if online) */}
      {order.payment_method === 'Online' && order.payment_receipt && (
        <div className="mb-8 border-t border-slate-200 pt-8">
          <h3 className="font-bold text-slate-800 mb-2">Payment Receipt</h3>
          <p className="text-xs text-slate-500 mb-4">A payment receipt was uploaded for this transaction.</p>
          <img src={order.payment_receipt} alt="Payment Receipt" className="max-w-full max-h-64 object-contain rounded border border-slate-200" />
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
        <p>Thank you for shopping with us!</p>
        <p>If you have any questions about this invoice, please contact support.</p>
      </div>

    </div>
  );
};

export default InvoiceTemplate;
