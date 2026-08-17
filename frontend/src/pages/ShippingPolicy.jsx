import React, { useEffect } from 'react';
import { Truck, Mail, Phone, Globe, ChevronRight, Package, Clock, MapPin, RefreshCcw, Banknote, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const ShippingPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm font-medium text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 font-bold">Shipping & Return Policy</span>
        </nav>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">
          
          {/* Header */}
          <div className="relative bg-gradient-to-br from-cyan-900 to-slate-900 px-8 py-16 sm:px-12 sm:py-20 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[100%] rounded-full bg-cyan-500/20 blur-[120px]"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 mb-6 shadow-2xl inline-block">
                <Truck className="w-12 h-12 text-cyan-400" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
                Shipping & Returns
              </h1>
              <p className="text-cyan-200 text-lg max-w-2xl font-medium">
                Everything you need to know about deliveries, tracking, returns, and refunds.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-10 sm:px-12 sm:py-14 text-slate-700 dark:text-slate-300 space-y-12">
            
            {/* Meta Info Box */}
            <div className="bg-cyan-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-cyan-100 dark:border-slate-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Company Name</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Wifo Mart <span className="text-slate-500 font-normal">(An BASRIC PVT LIMITED COMPANY)</span></span>
                </div>
                <div>
                  <span className="block text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Effective Date</span>
                  <span className="font-semibold text-slate-900 dark:text-white">August 17, 2026</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Website</span>
                  <a href="https://wifo-mart-ecom.vercel.app" target="_blank" rel="noreferrer" className="font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
                    https://wifo-mart-ecom.vercel.app
                  </a>
                </div>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-cyan-600 dark:prose-a:text-cyan-400 prose-strong:text-slate-900 dark:prose-strong:text-white">
              <p className="text-lg leading-relaxed mb-8">
                Thank you for shopping at Wifo Mart. We strive to ensure a seamless shopping experience, from the moment you place your order to the time it arrives at your doorstep. Please review our Shipping and Return Policy below.
              </p>

              {/* Part 1: Shipping Policy */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-8 border-b-2 border-slate-100 dark:border-slate-700 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                    <Package className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h2 className="text-3xl font-black m-0 p-0 text-slate-900 dark:text-white">Part 1: Shipping Policy</h2>
                </div>

                <section className="mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><Clock className="w-5 h-5 text-cyan-500" /> 1. Order Processing Time</h3>
                  <ul className="space-y-3 list-none pl-0">
                    <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-cyan-500 before:rounded-full">
                      All orders are processed within 1 to 2 business days (excluding Sundays and public holidays) after receiving your order confirmation email.
                    </li>
                    <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-cyan-500 before:rounded-full">
                      Once your order has been dispatched, you will receive a notification containing your tracking details.
                    </li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><Truck className="w-5 h-5 text-cyan-500" /> 2. Shipping Rates & Delivery Estimates</h3>
                  <p>Shipping charges for your order will be calculated and displayed at checkout based on your delivery address and selected shipping method.</p>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 my-4">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Estimated Delivery Timelines:</h4>
                    <ul className="space-y-2 list-none pl-0 m-0">
                      <li className="flex items-start gap-2"><span className="text-cyan-500 font-bold">✓</span> <strong>Standard Domestic Shipping:</strong> 3 to 7 business days from dispatch.</li>
                      <li className="flex items-start gap-2"><span className="text-cyan-500 font-bold">✓</span> <strong>Express Shipping:</strong> 2 to 4 business days (where available).</li>
                    </ul>
                  </div>
                  <p className="text-sm text-slate-500">Please note that delivery times are estimates and may vary due to unforeseen logistical delays, weather conditions, or remote delivery locations.</p>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><MapPin className="w-5 h-5 text-cyan-500" /> 3. Tracking & Address Changes</h3>
                  <p><strong>Order Tracking:</strong> You can track the real-time status of your shipment using the tracking link provided in your shipping confirmation email or by logging into your account.</p>
                  <p><strong>Address Changes:</strong> If you need to modify your shipping address, please contact our support team immediately before your order has been dispatched. Once handed over to logistics, we cannot alter the destination.</p>
                </section>
              </div>

              {/* Part 2: Return Policy */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-8 border-b-2 border-slate-100 dark:border-slate-700 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                    <RefreshCcw className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h2 className="text-3xl font-black m-0 p-0 text-slate-900 dark:text-white">Part 2: Return & Exchange</h2>
                </div>

                <section className="mb-8">
                  <h3 className="text-xl font-bold mb-4">1. Eligibility for Returns</h3>
                  <p>You may initiate a return or exchange within 7 days of receiving your order, provided that:</p>
                  <ul className="space-y-2 list-none pl-0">
                    <li className="flex items-start gap-2"><span className="text-rose-500 font-bold">•</span> The item is unused, unworn, unwashed, and in its original condition.</li>
                    <li className="flex items-start gap-2"><span className="text-rose-500 font-bold">•</span> The product includes all original tags, labels, manuals, and accessories.</li>
                    <li className="flex items-start gap-2"><span className="text-rose-500 font-bold">•</span> The item is returned in its original product packaging.</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h3 className="text-xl font-bold mb-4">2. Non-Returnable Items</h3>
                  <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 p-4 rounded-r-xl text-rose-800 dark:text-rose-200 text-sm">
                    <strong>Exemptions:</strong> Perishable goods or consumables, personal care items (cosmetics, innerwear), customized/personalized products, and items marked as final sale/clearance cannot be returned.
                  </div>
                </section>
                
                <section className="mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><ShieldAlert className="w-5 h-5 text-rose-500" /> 3. Damaged or Defective Items</h3>
                  <p>If you receive a product that is damaged, defective, or incorrect, please notify us within 48 hours of delivery at <a href="mailto:wifomart.support@gmail.com">wifomart.support@gmail.com</a> along with clear photos or a short video unboxing the product. We will review and arrange a replacement or full refund.</p>
                </section>
              </div>

              {/* Part 3: Refund Policy */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-8 border-b-2 border-slate-100 dark:border-slate-700 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <Banknote className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-3xl font-black m-0 p-0 text-slate-900 dark:text-white">Part 3: Refunds & Cancellations</h2>
                </div>

                <section className="mb-8">
                  <h3 className="text-xl font-bold mb-2">1. Refund Processing</h3>
                  <p>Once your returned item is received and inspected, we will notify you of the approval or rejection. If approved, your refund will automatically be applied to your original method of payment (or issued as store credit) within 5 to 7 business days.</p>
                  <p className="text-sm text-slate-500">Note: Original shipping charges are non-refundable. Cost of return shipping may be deducted unless the return is due to our error.</p>
                </section>
                
                <section className="mb-8">
                  <h3 className="text-xl font-bold mb-2">2. Order Cancellations</h3>
                  <ul className="space-y-2 list-none pl-0">
                    <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full">
                      You may cancel your order at any time before it has been processed and shipped for a full refund.
                    </li>
                    <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full">
                      Once an order has entered the dispatch phase, it cannot be canceled directly; however, you may refuse delivery or initiate a return upon arrival.
                    </li>
                  </ul>
                </section>
              </div>

            </div>

            {/* Contact Section */}
            <div className="mt-12 bg-slate-900 dark:bg-slate-950 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              
              <h2 className="text-2xl font-black text-white mb-6">Contact Us</h2>
              <p className="text-slate-400 mb-8 max-w-xl">
                If you have any questions about our Shipping & Return Policy, please reach out to us:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Company</h4>
                    <p className="font-semibold text-white">BASRIC PVT LIMITED COMPANY<br/><span className="text-slate-400 font-normal">(Wifo Mart)</span></p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone</h4>
                    <a href="tel:8515081309" className="font-semibold text-white hover:text-emerald-400 transition-colors">8515081309</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</h4>
                    <a href="mailto:wifomart.support@gmail.com" className="font-semibold text-white hover:text-blue-400 transition-colors">wifomart.support@gmail.com</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Website</h4>
                    <a href="https://wifo-mart-ecom.vercel.app" target="_blank" rel="noreferrer" className="font-semibold text-white hover:text-purple-400 transition-colors">wifo-mart-ecom.vercel.app</a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
