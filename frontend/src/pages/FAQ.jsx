import React, { useEffect, useState } from 'react';
import { HelpCircle, Mail, Phone, Globe, ChevronRight, Info, Lock, ShoppingCart, CreditCard, Truck, RefreshCcw, Wrench, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-4 transition-all duration-300 bg-white dark:bg-slate-800/50">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      >
        <span className="font-semibold text-slate-800 dark:text-slate-200">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-violet-500' : ''}`} />
      </button>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-5 pt-0 text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/50 mt-2">
          {answer}
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
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
          <span className="text-slate-800 dark:text-slate-200 font-bold">FAQ</span>
        </nav>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">
          
          {/* Header */}
          <div className="relative bg-gradient-to-br from-violet-900 to-slate-900 px-8 py-16 sm:px-12 sm:py-20 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[100%] rounded-full bg-violet-500/20 blur-[120px]"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 mb-6 shadow-2xl inline-block">
                <HelpCircle className="w-12 h-12 text-violet-400" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-violet-200 text-lg max-w-2xl font-medium">
                Find answers to common questions about Wifo Mart, your orders, and more.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-10 sm:px-12 sm:py-14 text-slate-700 dark:text-slate-300">
            
            {/* Meta Info Box */}
            <div className="bg-violet-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-violet-100 dark:border-slate-600 mb-12">
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
                  <a href="https://wifo-mart-ecom.vercel.app" target="_blank" rel="noreferrer" className="font-semibold text-violet-600 dark:text-violet-400 hover:underline">
                    https://wifo-mart-ecom.vercel.app
                  </a>
                </div>
              </div>
            </div>

            {/* Sections */}
            
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                  <Info className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Section 1: General Information</h2>
              </div>
              <FaqItem question="1.1 What is Wifo Mart?" answer="Wifo Mart is a premier digital e-commerce marketplace designed to deliver a smooth, reliable, and secure online shopping experience. We offer a curated catalog of products tailored to meet modern lifestyle and everyday consumer needs." />
              <FaqItem question="1.2 Who operates Wifo Mart?" answer="Wifo Mart is officially owned and operated under BASRIC PVT LIMITED COMPANY, adhering strictly to corporate governance, consumer protection standards, and legal compliance frameworks." />
              <FaqItem question="1.3 Do you have physical retail stores?" answer="Currently, Wifo Mart operates primarily as an online-first digital e-commerce platform. This allows us to serve customers efficiently across various regions while maintaining competitive pricing." />
              <FaqItem question="1.4 How can I contact customer support?" answer={<span>You can reach our dedicated support desk by emailing us at <a href="mailto:wifomart.support@gmail.com" className="text-violet-500 hover:underline">wifomart.support@gmail.com</a>. Our team operates during standard business hours and strives to resolve all inquiries within 24 to 48 business hours.</span>} />
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Section 2: Account Registration & Security</h2>
              </div>
              <FaqItem question="2.1 Do I need to create an account to shop on Wifo Mart?" answer="While guest checkout options may be available for quick transactions, creating a registered Wifo Mart account provides distinct advantages, including saved shipping addresses, lightning-fast checkouts, order tracking history, and personalized wishlists." />
              <FaqItem question="2.2 How do I reset a forgotten password?" answer='If you cannot access your account, navigate to the login page and click on the "Forgot Password" link. Enter your registered email address, and you will receive a secure token link to reset your password instantly.' />
              <FaqItem question="2.3 Is my personal data safe with Wifo Mart?" answer="Yes. We utilize advanced encryption technologies, secure server environments, and strict data handling protocols in accordance with our Privacy Policy to ensure your personal information remains confidential and protected." />
              <FaqItem question="2.4 Can I delete my user account?" answer="Yes, if you wish to close your account permanently, you can submit a deletion request by contacting our support team via email, and we will purge your personal data in compliance with data retention laws." />
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Section 3: Orders, Processing & Modifications</h2>
              </div>
              <FaqItem question="3.1 How do I place an order on the platform?" answer="Browsing products, selecting your desired items, adding them to your cart, and proceeding to the secure checkout page will guide you through entering shipping details and completing payment." />
              <FaqItem question="3.2 How will I know if my order was successfully placed?" answer="Upon successful completion of checkout and payment verification, you will immediately receive an automated order confirmation email containing your order reference number, itemized summary, and estimated delivery schedule." />
              <FaqItem question="3.3 Can I modify or cancel my order after submission?" answer="You can cancel or modify your order only before it enters the fulfillment and shipping warehouse phase. Once an order has been packed and handed over to our logistics partners, it cannot be canceled directly, but you may initiate a return upon delivery." />
              <FaqItem question="3.4 What happens if an item I ordered goes out of stock?" answer="In rare instances where an ordered item encounters unexpected inventory depletion, our team will notify you immediately via email to offer a comparable alternative, a backorder update, or a prompt 100% refund." />
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Section 4: Pricing, Billing & Secure Payments</h2>
              </div>
              <FaqItem question="4.1 What payment methods do you accept?" answer="We support a diverse selection of secure digital payment options, including major credit and debit cards (Visa, MasterCard, RuPay), Net Banking, UPI (Unified Payments Interface), and authorized digital wallet providers." />
              <FaqItem question="4.2 Are online transactions secure?" answer="All financial transactions are routed through industry-standard, PCI-DSS compliant payment gateways. Wifo Mart does not store your raw credit card numbers or sensitive banking passwords on our local servers." />
              <FaqItem question="4.3 Are taxes included in the displayed product prices?" answer="Yes, all prices listed across the Wifo Mart catalog are inclusive of applicable Goods and Services Tax (GST) and local taxes unless explicitly stated otherwise during the final checkout stage." />
              <FaqItem question="4.4 What should I do if a payment fails or gets deducted erroneously?" answer="If your payment fails but funds are debited from your bank account, the amount is typically auto-reversed by your banking provider within 3 to 5 business days. If the issue persists, contact our support team with your transaction reference ID." />
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Section 5: Shipping, Tracking & Delivery Logistics</h2>
              </div>
              <FaqItem question="5.1 How long does order processing take?" answer="All orders undergo quality checks and packaging and are typically dispatched within 1 to 2 business days (excluding Sundays and national holidays) following order confirmation." />
              <FaqItem question="5.2 What are the standard delivery timelines?" answer={<ul className="list-disc pl-5 mt-2 space-y-1"><li>Standard Domestic Shipping: 3 to 7 business days from dispatch.</li><li>Express Shipping: 2 to 4 business days (where available at checkout).</li></ul>} />
              <FaqItem question="5.3 How can I track the progress of my shipment?" answer="Once your order is dispatched, you will receive a tracking link via email. You can also view real-time delivery milestones by logging into your Wifo Mart account dashboard." />
              <FaqItem question="5.4 What happens if I am unavailable during delivery?" answer="Our courier partners typically make up to 3 delivery attempts before returning the package to our warehouse. You can coordinate directly with the delivery executive using the tracking details provided in your SMS or email alerts." />
              <FaqItem question="5.5 Can I change my delivery address after placing an order?" answer="Address modifications are only permitted before the order enters dispatch. Once handed over to the courier partner, shipping destinations cannot be altered." />
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                  <RefreshCcw className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Section 6: Returns, Exchanges & Refunds</h2>
              </div>
              <FaqItem question="6.1 What is your return window?" answer="You may request a return or exchange within 7 days of receiving your package, provided the product meets our return criteria." />
              <FaqItem question="6.2 What conditions must returned items satisfy?" answer="Returned items must be unused, unwashed, unaltered, and in their original product packaging complete with all brand tags, labels, manuals, and accessories intact." />
              <FaqItem question="6.3 Are there items that cannot be returned?" answer="Yes. For hygiene, safety, and operational reasons, perishable goods, personal care items, cosmetics, innerwear, customized items, and final-sale clearance merchandise are strictly non-returnable." />
              <FaqItem question="6.4 What should I do if I receive a damaged or defective product?" answer={<span>If you receive an incorrect, damaged, or defective item, you must notify us within 48 hours of delivery at <a href="mailto:wifomart.support@gmail.com" className="text-violet-500 hover:underline">wifomart.support@gmail.com</a> along with clear photographic evidence or an unboxing video. We will arrange an immediate replacement or refund.</span>} />
              <FaqItem question="6.5 How long do refunds take to process?" answer="Once returned items arrive at our facility and pass quality inspection, approved refunds are processed back to your original payment source or issued as store credit within 5 to 7 business days." />
              <FaqItem question="6.6 Are shipping fees refundable?" answer="Original shipping charges paid at checkout are non-refundable. Additionally, return shipping costs may be deducted from your final refund amount unless the return is due to a fulfillment error on our part." />
            </section>

            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Section 7: Technical Support & Website Issues</h2>
              </div>
              <FaqItem question="7.1 The website is loading slowly or displaying errors. What should I do?" answer="Ensure you are using an up-to-date web browser (such as Google Chrome, Mozilla Firefox, or Microsoft Edge), clear your browser cache and cookies, or try switching between Wi-Fi and mobile data networks." />
              <FaqItem question="7.2 Who should I contact if I find a security bug or software glitch on the platform?" answer={<span>We appreciate responsible disclosures. If you discover any technical vulnerabilities or interface bugs on our platform, please report them directly to our engineering team at <a href="mailto:wifomart.support@gmail.com" className="text-violet-500 hover:underline">wifomart.support@gmail.com</a>.</span>} />
            </section>

            {/* Contact Section */}
            <div className="mt-12 bg-slate-900 dark:bg-slate-950 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              
              <h2 className="text-2xl font-black text-white mb-6">Still have questions?</h2>
              <p className="text-slate-400 mb-8 max-w-xl">
                If you couldn't find the answer to your question in our FAQ, please don't hesitate to reach out to our dedicated support team.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-amber-400" />
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

export default FAQ;
