import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post('/api/support', formData);
      toast.success('Message sent! Our support team will email you back soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-16">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3 md:mb-4">
            Contact Support
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 px-2">
            Have a question, issue, or just want to say hi? Send us a message and our team will get back to you via email.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Contact Info */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 space-y-10">
              <div>
                <h3 className="text-2xl font-bold mb-2">Get in touch</h3>
                <p className="text-slate-400">We'd love to hear from you. Our friendly team is always here to chat.</p>
              </div>

              <div className="space-y-4">
                <a href="mailto:wifomart.support@gmail.com" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all border border-white/5 hover:border-amber-500/30 group cursor-pointer">
                  <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-400 font-medium group-hover:text-amber-400 transition-colors">Email us</p>
                    <p className="text-white font-medium break-all text-sm sm:text-base notranslate">wifomart.support@gmail.com</p>
                  </div>
                  <div className="text-slate-500 group-hover:text-amber-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </a>

                <a href="tel:+919876543210" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all border border-white/5 hover:border-amber-500/30 group cursor-pointer">
                  <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-400 font-medium group-hover:text-amber-400 transition-colors">Call us</p>
                    <p className="text-white font-medium notranslate">+91 8515081309</p>
                  </div>
                  <div className="text-slate-500 group-hover:text-amber-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </a>

                <a href="https://maps.google.com/?q=P6F7+VPQ,+Krishna+Ram+Pur,+West+Bengal+712702" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all border border-white/5 hover:border-amber-500/30 group cursor-pointer">
                  <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-400 font-medium group-hover:text-amber-400 transition-colors">Visit us</p>
                    <p className="text-white font-medium text-sm">P6F7+VPQ, Krishna Ram Pur, West Bengal 712702</p>
                  </div>
                  <div className="text-slate-500 group-hover:text-amber-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </a>

                <div className="flex items-center gap-4 pt-6 border-t border-slate-700/50 mt-6">
                  <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium mb-2">Follow us</p>
                    <div className="flex space-x-3">
                      <a href="https://github.com/ankitdas37" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.15-.38 6.5-1.4 6.5-7a4.6 4.6 0 0 0-1.2-3.21 4.3 4.3 0 0 0-.12-3.17s-1-.31-3.2 1.18a11 11 0 0 0-6 0c-2.2-1.49-3.2-1.18-3.2-1.18a4.3 4.3 0 0 0-.12 3.17 4.6 4.6 0 0 0-1.2 3.21c0 5.6 3.35 6.6 6.5 7a4.8 4.8 0 0 0-1 3.03V22"></path>
                          <path d="M9 20c-5 1.5-5-2.5-7-3"></path>
                        </svg>
                      </a>
                      <a href="" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1DA1F2] transition-all">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                        </svg>
                      </a>
                      <a href="" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#E1306C] transition-all">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative circles */}
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500 rounded-full opacity-20 blur-3xl"></div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-8 lg:p-10 shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder="your@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message</label>
                <textarea
                  required
                  rows="5"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-y"
                  placeholder="Tell us everything..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-amber-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : (
                  <>
                    <Send className="w-5 h-5" /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
