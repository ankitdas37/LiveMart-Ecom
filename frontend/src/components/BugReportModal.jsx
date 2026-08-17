import React, { useState } from 'react';
import { X, MessageSquare, Upload, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const BugReportModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    image: null,
    document: null
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send formData to a server here.
    toast.success('Transmission sent! Our tech team is on it.', { icon: '🚀' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#0d1117] border border-fuchsia-500/30 rounded-xl shadow-2xl shadow-fuchsia-900/20 font-sans max-h-[95vh] flex flex-col">
        
        {/* Top gradient line */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-600 flex-shrink-0 rounded-t-xl"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 text-fuchsia-400">
            <MessageSquare className="w-5 h-5" />
            <h2 className="text-base sm:text-lg font-black tracking-widest uppercase">Interface Link</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 -mr-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto overflow-x-hidden p-4 sm:p-6 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-fuchsia-400 uppercase tracking-wider mb-2">Full Name *</label>
              <input 
                type="text" 
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Identify yourself" 
                className="w-full bg-[#161b22] border border-white/10 rounded-lg px-4 py-3 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all"
              />
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-fuchsia-400 uppercase tracking-wider mb-2">Email *</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="comm_link@network.com" 
                className="w-full bg-[#161b22] border border-white/10 rounded-lg px-4 py-3 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Phone Number *</label>
              <input 
                type="tel" 
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="Signal code" 
                className="w-full bg-[#161b22] border border-white/10 rounded-lg px-4 py-3 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Subject *</label>
              <div className="relative">
                <select 
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-[#161b22] border border-white/10 rounded-lg px-4 py-3 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all appearance-none"
                >
                  <option value="" disabled>Select protocol</option>
                  <option value="bug">Bug / Glitch</option>
                  <option value="payment">Payment Issue</option>
                  <option value="account">Account Access</option>
                  <option value="other">Other System Anomaly</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* Message Payload */}
          <div>
            <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Message Payload *</label>
            <textarea 
              name="message"
              required
              rows="4"
              value={formData.message}
              onChange={handleChange}
              placeholder="Enter transmission data here..." 
              className="w-full bg-[#161b22] border border-white/10 rounded-lg px-4 py-3 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
            ></textarea>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Image Data (Opt)</label>
              <div className="relative">
                <input 
                  type="file" 
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-full bg-[#161b22] border border-white/10 border-dashed rounded-lg px-4 py-3 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 hover:border-slate-400 transition-all cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm truncate max-w-[200px]">{formData.image ? formData.image.name : 'Select Image File'}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Document Data (Opt)</label>
              <div className="relative">
                <input 
                  type="file" 
                  name="document"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-full bg-[#161b22] border border-white/10 border-dashed rounded-lg px-4 py-3 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 hover:border-slate-400 transition-all cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm truncate max-w-[200px]">{formData.document ? formData.document.name : 'Select PDF File'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full py-4 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white font-black tracking-widest uppercase flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:shadow-[0_0_30px_rgba(217,70,239,0.6)]"
            >
              <Send className="w-5 h-5 -rotate-45" />
              Initialize Transmission
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BugReportModal;
