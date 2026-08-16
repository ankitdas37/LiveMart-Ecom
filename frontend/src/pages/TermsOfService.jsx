import React, { useEffect } from 'react';
import { Scale, Mail, Phone, Globe, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
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
          <span className="text-slate-800 dark:text-slate-200 font-bold">Terms of Service</span>
        </nav>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">
          
          {/* Header */}
          <div className="relative bg-gradient-to-br from-indigo-900 to-slate-900 px-8 py-16 sm:px-12 sm:py-20 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[100%] rounded-full bg-emerald-500/20 blur-[120px]"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 mb-6 shadow-2xl inline-block">
                <Scale className="w-12 h-12 text-emerald-400" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
                Terms of Service
              </h1>
              <p className="text-indigo-200 text-lg max-w-2xl font-medium">
                Please read these terms carefully before using our platform.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-10 sm:px-12 sm:py-14 text-slate-700 dark:text-slate-300 space-y-12">
            
            {/* Meta Info Box */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Effective Date</span>
                  <span className="font-semibold text-slate-900 dark:text-white">August 17, 2026</span>
                </div>
                <div>
                  <span className="block text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Company Name</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Wifo Mart <span className="text-slate-500 font-normal">(An BASRIC PVT LIMITED COMPANY)</span></span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Website</span>
                  <a href="https://wifo-mart-ecom.vercel.app" target="_blank" rel="noreferrer" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                    https://wifo-mart-ecom.vercel.app
                  </a>
                </div>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-strong:text-slate-900 dark:prose-strong:text-white">
              
              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm">1</span>
                  Introduction and Agreement to Terms
                </h2>
                <p>
                  Welcome to Wifo Mart ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of our e-commerce website, mobile applications, and related services (collectively, the "Platform").
                </p>
                <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 p-4 mt-4 rounded-r-xl text-rose-800 dark:text-rose-200 font-medium">
                  By accessing, browsing, or purchasing from Wifo Mart, you agree to be bound by these Terms. If you do not agree to all of these Terms, you are expressly prohibited from using our Platform and must discontinue use immediately.
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm">2</span>
                  Changes to Terms
                </h2>
                <p>
                  We reserve the right to modify, amend, or update these Terms at any time at our sole discretion. Any changes will be effective immediately upon posting the updated Terms on the Platform, with the "Effective Date" updated accordingly. Your continued use of Wifo Mart following the posting of revised terms means that you accept and agree to the changes.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm">3</span>
                  User Accounts and Registration
                </h2>
                <ul className="space-y-4 list-none pl-0">
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full">
                    <strong>Account Creation:</strong> To access certain features of the Platform, such as placing orders or tracking shipments, you may be required to register an account. You agree to provide accurate, current, and complete information during registration.
                  </li>
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full">
                    <strong>Account Security:</strong> You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use or security breach.
                  </li>
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full">
                    <strong>Eligibility:</strong> You must be at least 18 years of age or accessing the Platform under the direct supervision of a parent or legal guardian to create an account or make purchases.
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm">4</span>
                  Products, Pricing, and Availability
                </h2>
                <ul className="space-y-4 list-none pl-0">
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full">
                    <strong>Product Descriptions:</strong> We strive to ensure that all product descriptions, images, pricing, and availability details on Wifo Mart are accurate. However, errors may occur. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update information at any time without prior notice.
                  </li>
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full">
                    <strong>Pricing:</strong> All prices listed on the Platform are quoted in local currency (INR) unless otherwise specified and are inclusive of applicable taxes where required by law.
                  </li>
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full">
                    <strong>Availability:</strong> Products displayed on the site are subject to availability. We reserve the right to limit the quantities of any products or services that we offer.
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm">5</span>
                  Orders, Payments, and Billing
                </h2>
                <ul className="space-y-4 list-none pl-0">
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full">
                    <strong>Order Acceptance:</strong> Your receipt of an electronic or other form of order confirmation does not signify our acceptance of your order, nor does it constitute confirmation of our offer to sell. Wifo Mart reserves the right at any time after receipt of your order to accept or decline your order for any reason.
                  </li>
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full">
                    <strong>Payment Methods:</strong> We accept secure online payments through authorized payment gateways, including credit/debit cards, net banking, UPI, and other supported digital payment methods. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the store.
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm">6</span>
                  Shipping and Delivery
                </h2>
                <ul className="space-y-4 list-none pl-0">
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full">
                    <strong>Fulfillment:</strong> We will ship products according to the shipping method chosen during checkout to the delivery address provided by you.
                  </li>
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full">
                    <strong>Delivery Timelines:</strong> Estimated delivery dates are approximate and depend on courier availability, destination, and operational conditions. Wifo Mart is not liable for shipping delays caused by third-party logistics providers or force majeure events.
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm">7</span>
                  Returns, Refunds, and Cancellations
                </h2>
                <ul className="space-y-4 list-none pl-0">
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full">
                    <strong>Cancellations:</strong> You may cancel your order before it has been processed and shipped. Once an order enters the shipping phase, it is subject to our standard return policy.
                  </li>
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full">
                    <strong>Returns and Refunds:</strong> Eligible product returns and refund requests must be initiated within the specified window following delivery, provided the items are unused, in their original packaging, and accompanied by proof of purchase. Specific terms for returns are outlined separately on our returns page.
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm">8</span>
                  Intellectual Property Rights
                </h2>
                <p>
                  All content on Wifo Mart—including text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software—is the exclusive property of BASRIC PVT LIMITED COMPANY or its content suppliers and is protected by applicable intellectual property laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, or commercially exploit any content without our express written permission.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm">9</span>
                  Prohibited Activities
                </h2>
                <p className="mb-4">You agree not to use the Platform for any unlawful purpose or in any way that could damage, disable, overburden, or impair our servers or networks. Prohibited activities include, but are not limited to:</p>
                <ul className="space-y-2 list-none pl-0">
                  {[
                    "Attempting to gain unauthorized access to any portion of the Platform, user accounts, or computer systems.",
                    "Using automated scripts, bots, scrapers, or spiders to access the Platform or extract data.",
                    "Posting or transmitting any fraudulent, defamatory, obscene, or harmful content.",
                    "Engaging in any activity that disrupts or interferes with another user's enjoyment of Wifo Mart."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 mt-2"></div>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm">10</span>
                  Limitation of Liability
                </h2>
                <p>
                  To the fullest extent permitted by applicable law, BASRIC PVT LIMITED COMPANY (operating Wifo Mart) shall not be liable for any indirect, incidental, special, consequential, or punitive damages—including loss of profits, data, use, or goodwill—arising out of or in connection with your use of the Platform or purchase of products, even if we have been advised of the possibility of such damages.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm">11</span>
                  Governing Law and Jurisdiction
                </h2>
                <p>
                  These Terms and your use of Wifo Mart shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles. Any legal action or proceeding arising out of these Terms shall be brought exclusively in the courts located within West Bengal, India.
                </p>
              </section>

            </div>

            {/* Contact Section */}
            <div className="mt-12 bg-slate-900 dark:bg-slate-950 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              
              <h2 className="text-2xl font-black text-white mb-6">Contact Information</h2>
              <p className="text-slate-400 mb-8 max-w-xl">
                If you have any questions or concerns regarding these Terms of Service, please contact us at:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Scale className="w-5 h-5 text-amber-400" />
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

export default TermsOfService;
