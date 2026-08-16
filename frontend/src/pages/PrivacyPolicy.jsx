import React, { useEffect } from 'react';
import { ShieldCheck, Mail, Phone, Globe, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
          <span className="text-slate-800 dark:text-slate-200 font-bold">Privacy Policy</span>
        </nav>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">
          
          {/* Header */}
          <div className="relative bg-gradient-to-br from-indigo-900 to-slate-900 px-8 py-16 sm:px-12 sm:py-20 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[100%] rounded-full bg-amber-500/20 blur-[120px]"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 mb-6 shadow-2xl inline-block">
                <ShieldCheck className="w-12 h-12 text-amber-400" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
                Privacy Policy
              </h1>
              <p className="text-indigo-200 text-lg max-w-2xl font-medium">
                We respect your privacy and are committed to protecting your personal information.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-10 sm:px-12 sm:py-14 text-slate-700 dark:text-slate-300 space-y-12">
            
            {/* Meta Info Box */}
            <div className="bg-indigo-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-indigo-100 dark:border-slate-600">
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
                  <a href="https://wifo-mart-ecom.vercel.app" target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    https://wifo-mart-ecom.vercel.app
                  </a>
                </div>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-strong:text-slate-900 dark:prose-strong:text-white">
              <p className="text-lg leading-relaxed mb-8">
                Welcome to Wifo Mart ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our e-commerce website or make a purchase from us.
              </p>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl mb-10 text-amber-800 dark:text-amber-200 font-medium">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </div>

              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm">1</span>
                  Information We Collect
                </h2>
                <p className="mb-4">We may collect information about you in a variety of ways when you use our platform:</p>
                <ul className="space-y-4 list-none pl-0">
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-indigo-500 before:rounded-full">
                    <strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, telephone number, and billing information (such as credit/debit card details or UPI handles processed securely through our payment gateway partners) that you voluntarily give to us when you register, place an order, or contact customer support.
                  </li>
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-indigo-500 before:rounded-full">
                    <strong>Derivative Data:</strong> Information our servers automatically collect when you access the site, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the site.
                  </li>
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-indigo-500 before:rounded-full">
                    <strong>Transaction Data:</strong> Details concerning purchases and orders you place through Wifo Mart, including product details, order history, and delivery status.
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm">2</span>
                  How We Use Your Information
                </h2>
                <p className="mb-4">Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via Wifo Mart to:</p>
                <ul className="space-y-3 list-none pl-0">
                  {[
                    "Process your orders, manage payments, and arrange for delivery or shipping.",
                    "Create and manage your account and authenticate your identity.",
                    "Send you order confirmations, shipping updates, invoices, and customer support notifications.",
                    "Respond to customer service inquiries, feedback, and support requests.",
                    "Improve the functionality, design, and performance of our website and mobile experiences.",
                    "Monitor and analyze usage trends and activities to improve user experience.",
                    "Comply with applicable legal obligations, regulatory requirements, and resolve any disputes."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm">3</span>
                  Sharing Your Information
                </h2>
                <p className="mb-4">We do not sell, trade, or rent your personal identification information to others. We may share information we have collected about you in certain situations:</p>
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Third-Party Service Providers</h3>
                    <p className="text-sm">We may share your data with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Logistics & Delivery Partners</h3>
                    <p className="text-sm">We share necessary details (such as name, delivery address, and phone number) with courier and shipping partners to successfully deliver your ordered products.</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Legal Obligations</h3>
                    <p className="text-sm">We may disclose your information where required to do so by law or subpoena, or if we believe that such action is necessary to comply with the law and the reasonable requests of law enforcement.</p>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm">4</span>
                  Data Security
                </h2>
                <p>
                  We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm">5</span>
                  Cookies and Tracking Technologies
                </h2>
                <p>
                  We may use cookies, web beacons, tracking pixels, and other tracking technologies on Wifo Mart to help customize the site and improve your experience. When you access the site, your personal information is not collected through the use of tracking technology. Most browsers are set to accept cookies by default, but you can remove or reject cookies in your browser's settings.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm">6</span>
                  Your Rights and Choices
                </h2>
                <p className="mb-4">Depending on your jurisdiction, you may have certain rights regarding your personal information:</p>
                <ul className="space-y-4 list-none pl-0">
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-indigo-500 before:rounded-full">
                    <strong>Access & Update:</strong> You can review, update, or delete your account information at any time by logging into your account settings.
                  </li>
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-indigo-500 before:rounded-full">
                    <strong>Opt-Out of Marketing:</strong> You can opt out of receiving promotional emails from us by following the unsubscribe instructions provided in those emails.
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm">7</span>
                  Children's Privacy
                </h2>
                <p>
                  Wifo Mart does not knowingly solicit information from or market to children under the age of 18. If we learn that we have collected personal information from a user under age 18 without verification of parental consent, we will delete that information as quickly as possible.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm">8</span>
                  Changes to This Privacy Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by updating the "Effective Date" at the top of this privacy policy.
                </p>
              </section>

            </div>

            {/* Contact Section */}
            <div className="mt-12 bg-slate-900 dark:bg-slate-950 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              
              <h2 className="text-2xl font-black text-white mb-6">Contact Us</h2>
              <p className="text-slate-400 mb-8 max-w-xl">
                If you have questions, comments, or concerns about this Privacy Policy or our practices, please contact us at:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
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
                    <a href="mailto:wifomart.suppoet@gmail.com" className="font-semibold text-white hover:text-blue-400 transition-colors">wifomart.suppoet@gmail.com</a>
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

export default PrivacyPolicy;
