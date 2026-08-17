import React, { useEffect, useState } from 'react';
import { Wrench, Bug, ShieldAlert, Monitor, LifeBuoy, Mail, Phone, Globe, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import BugReportModal from '../components/BugReportModal';

const TechSupport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          <span className="text-slate-800 dark:text-slate-200 font-bold">Tech Support & Bugs</span>
        </nav>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">
          
          {/* Header */}
          <div className="relative bg-gradient-to-br from-fuchsia-900 to-slate-900 px-8 py-16 sm:px-12 sm:py-20 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[100%] rounded-full bg-fuchsia-500/20 blur-[120px]"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 mb-6 shadow-2xl inline-block">
                <Wrench className="w-12 h-12 text-fuchsia-400" />
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
                Technical Support & Bug Reports
              </h1>
              <p className="text-fuchsia-200 text-lg max-w-2xl font-medium">
                Encountering issues? We're here to ensure your shopping experience is flawless.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-10 sm:px-12 sm:py-14 text-slate-700 dark:text-slate-300 space-y-12">
            
            {/* Meta Info Box */}
            <div className="bg-fuchsia-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-fuchsia-100 dark:border-slate-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Company Name</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Wifo Mart <span className="text-slate-500 font-normal">(An BASRIC PVT LIMITED COMPANY)</span></span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Website</span>
                  <a href="https://wifo-mart-ecom.vercel.app" target="_blank" rel="noreferrer" className="font-semibold text-fuchsia-600 dark:text-fuchsia-400 hover:underline">
                    https://wifo-mart-ecom.vercel.app
                  </a>
                </div>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-fuchsia-600 dark:prose-a:text-fuchsia-400 prose-strong:text-slate-900 dark:prose-strong:text-white">
              
              {/* Part 1: Intro */}
              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm">1</span>
                  Introduction
                </h2>
                <p>
                  Welcome to the Wifo Mart Technical Support & Bug Report Center. Our engineering and support teams are dedicated to ensuring a stable, secure, and seamless shopping experience. If you encounter any technical issues, broken links, interface glitches, or payment errors while navigating our platform, this guide outlines how you can report them and get assistance.
                </p>
              </section>

              {/* Part 2: How to Report */}
              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm">2</span>
                  How to Report a Bug
                </h2>
                <p>If you experience a technical glitch or unexpected behavior on the platform, your detailed reports help us resolve issues quickly. When submitting a bug report, please include the following information:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Bug className="w-5 h-5 text-fuchsia-500" />
                      <h3 className="font-bold text-slate-900 dark:text-white m-0">Description</h3>
                    </div>
                    <p className="text-sm m-0">A clear explanation of what went wrong and what you were trying to do when the error occurred.</p>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="w-5 h-5 text-fuchsia-500" />
                      <h3 className="font-bold text-slate-900 dark:text-white m-0">Steps to Reproduce</h3>
                    </div>
                    <p className="text-sm m-0">Step-by-step instructions so our team can replicate the issue (e.g., 1. Go to cart, 2. Click checkout).</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="w-5 h-5 text-fuchsia-500" />
                      <h3 className="font-bold text-slate-900 dark:text-white m-0">Device & Browser</h3>
                    </div>
                    <p className="text-sm m-0">The device you are using (e.g., Windows PC, iPhone) and browser type (e.g., Chrome, Safari).</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert className="w-5 h-5 text-fuchsia-500" />
                      <h3 className="font-bold text-slate-900 dark:text-white m-0">Screenshots</h3>
                    </div>
                    <p className="text-sm m-0">Visual evidence or error codes (such as HTTP 404/500 errors) speed up the troubleshooting process.</p>
                  </div>
                </div>

                <div className="mt-8 text-center sm:text-left border-t border-slate-100 dark:border-slate-700/50 pt-8">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Ready to submit a report?</h3>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white font-bold tracking-wider uppercase px-8 py-4 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.3)] hover:shadow-[0_0_25px_rgba(217,70,239,0.5)] transition-all transform hover:-translate-y-1 w-full sm:w-auto"
                  >
                    <Bug className="w-5 h-5" />
                    Open Interface Link
                  </button>
                </div>
              </section>

              {/* Part 3: Troubleshooting */}
              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm">3</span>
                  Common Troubleshooting Steps
                </h2>
                <p className="mb-4">Before submitting a support ticket, you can often resolve minor technical hiccups by trying these quick fixes:</p>
                <ul className="space-y-4 list-none pl-0">
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-fuchsia-500 before:rounded-full">
                    <strong>Clear Browser Cache & Cookies:</strong> Outdated stored data can sometimes cause interface or loading errors. Clear your browser cache and reload the page.
                  </li>
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-fuchsia-500 before:rounded-full">
                    <strong>Update Your Browser:</strong> Ensure you are running the latest version of your web browser for optimal compatibility with our modern web stack.
                  </li>
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-fuchsia-500 before:rounded-full">
                    <strong>Check Network Connection:</strong> Switch between Wi-Fi and mobile data to ensure your internet connection is stable.
                  </li>
                  <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-fuchsia-500 before:rounded-full">
                    <strong>Incognito / Private Mode:</strong> Try opening <a href="https://wifo-mart-ecom.vercel.app">https://wifo-mart-ecom.vercel.app</a> in an incognito window to see if browser extensions are interfering with site scripts.
                  </li>
                </ul>
              </section>

              {/* Part 4: Security Disclosure */}
              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm">4</span>
                  Security Vulnerability Disclosure
                </h2>
                <p>We take platform security very seriously. If you are a security researcher or user who has discovered a potential security vulnerability, data exposure risk, or system flaw on Wifo Mart:</p>
                <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 p-4 mt-4 rounded-r-xl">
                  <p className="text-rose-800 dark:text-rose-200 font-medium m-0 mb-2"><strong>Responsible Disclosure:</strong> Please do not exploit the vulnerability, access unauthorized data, or publicly disclose the issue before our team has had a chance to investigate and patch it.</p>
                  <p className="text-rose-800 dark:text-rose-200 m-0"><strong>Reporting:</strong> Send a detailed report directly to our security and engineering desk at <a href="mailto:wifomart.support@gmail.com" className="text-rose-600 hover:text-rose-700">wifomart.support@gmail.com</a> with the subject line <em>"Security Vulnerability Report"</em>.</p>
                </div>
              </section>

              {/* Part 5: Channels */}
              <section className="mb-10">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm">5</span>
                  Technical Support Channels & Response Times
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="flex-1 bg-fuchsia-50 dark:bg-fuchsia-900/20 p-5 rounded-xl border border-fuchsia-100 dark:border-fuchsia-800/30 flex items-center gap-4">
                    <Mail className="w-8 h-8 text-fuchsia-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-fuchsia-600 dark:text-fuchsia-400 font-bold uppercase mb-1 m-0">Support Email</p>
                      <a href="mailto:wifomart.support@gmail.com" className="font-semibold text-slate-900 dark:text-white hover:text-fuchsia-500 m-0">wifomart.support@gmail.com</a>
                    </div>
                  </div>
                  <div className="flex-1 bg-fuchsia-50 dark:bg-fuchsia-900/20 p-5 rounded-xl border border-fuchsia-100 dark:border-fuchsia-800/30 flex items-center gap-4">
                    <LifeBuoy className="w-8 h-8 text-fuchsia-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-fuchsia-600 dark:text-fuchsia-400 font-bold uppercase mb-1 m-0">Response Window</p>
                      <p className="font-semibold text-slate-900 dark:text-white m-0 text-sm">Reviewed within 24 to 48 hours.</p>
                    </div>
                  </div>
                </div>
              </section>

            </div>

            {/* Contact Section */}
            <div className="mt-12 bg-slate-900 dark:bg-slate-950 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              
              <h2 className="text-2xl font-black text-white mb-6">Need Immediate Help?</h2>
              <p className="text-slate-400 mb-8 max-w-xl">
                Our support team is standing by to resolve any technical issues you may face. Contact us through the channels below.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-5 h-5 text-amber-400" />
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
      <BugReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default TechSupport;
