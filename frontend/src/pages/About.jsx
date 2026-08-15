import React, { useEffect, useState } from 'react';
import { Mail, Code, Rocket, Star, Heart, X, Send, Upload, Phone, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import ankitImg from '../assets/ankit.jpg';

const About = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Contact Form State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactData, setContactData] = useState({
    name: '', email: '', phone: '', subject: '', otherSubject: '', message: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactData.name || !contactData.email || !contactData.phone || !contactData.subject || !contactData.message) {
      return toast.error("Please fill up all mandatory fields.");
    }
    
    // Indian Phone Number Validation (starts with 6-9, exactly 10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(contactData.phone)) {
      return toast.error("Please enter a valid 10-digit Indian phone number.");
    }

    if (contactData.subject === 'Other' && !contactData.otherSubject) {
      return toast.error("Please specify the other subject.");
    }

    setIsSubmitting(true);
    let imageUrl = '';
    let pdfUrl = '';

    try {
      const uploadPromises = [];
      let imgPromiseIndex = -1;
      let pdfPromiseIndex = -1;

      if (imageFile) {
        const imgForm = new FormData();
        imgForm.append('image', imageFile);
        uploadPromises.push(axios.post('/api/upload', imgForm));
        imgPromiseIndex = uploadPromises.length - 1;
      }
      if (pdfFile) {
        const pdfForm = new FormData();
        pdfForm.append('file', pdfFile);
        uploadPromises.push(axios.post('/api/upload', pdfForm));
        pdfPromiseIndex = uploadPromises.length - 1;
      }

      // Upload both files concurrently
      const uploadResults = await Promise.all(uploadPromises);

      if (imgPromiseIndex !== -1) {
        imageUrl = uploadResults[imgPromiseIndex].data.url;
      }
      if (pdfPromiseIndex !== -1) {
        pdfUrl = uploadResults[pdfPromiseIndex].data.url;
      }

      const finalSubject = contactData.subject === 'Other' ? contactData.otherSubject : contactData.subject;
      let finalMessage = `Phone: ${contactData.phone}\n\nMessage: ${contactData.message}`;
      if (imageUrl) finalMessage += `\n\nImage Attachment: ${imageUrl}`;
      if (pdfUrl) finalMessage += `\n\nPDF Attachment: ${pdfUrl}`;
      finalMessage += `\n\n(Sent via Developer Contact)`;

      // Send the request but don't await if it's holding up the UI unnecessarily, or just keep it awaited since it's an API call
      await axios.post('/api/support', {
        name: contactData.name,
        email: contactData.email,
        subject: finalSubject,
        message: finalMessage,
        toDeveloper: true
      });

      toast.success('Message sent to Developer successfully!');
      setIsContactModalOpen(false);
      setContactData({ name: '', email: '', phone: '', subject: '', otherSubject: '', message: '' });
      setImageFile(null);
      setPdfFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#050510] text-slate-200 overflow-hidden font-sans relative pt-20 pb-20 selection:bg-pink-500/30 selection:text-pink-200">
      
      {/* Anime Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
        
        {/* Glowing Orbs */}
        <div className="absolute top-0 left-[20%] w-[600px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full animate-pulse mix-blend-screen"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-pink-600/20 blur-[150px] rounded-full animate-pulse mix-blend-screen" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[300px] bg-cyan-600/10 blur-[100px] rounded-full mix-blend-screen"></div>

        {/* Giant Japanese Text Watermark */}
        <div className="absolute top-[10%] left-0 w-full flex justify-center opacity-[0.03] select-none font-black tracking-widest text-[12rem] md:text-[20rem] text-white whitespace-nowrap">
          創造者
        </div>
      </div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center pt-10 pb-12">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-black tracking-[0.2em] uppercase mb-6 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
            <span className="w-2 h-2 rounded-full bg-pink-500 mr-2 animate-ping"></span>
            Welcome to W!FO MART
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 mb-6 tracking-tighter drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">
            OUR STORY & <br className="hidden md:block"/> THE MINDS BEHIND IT
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed font-medium">
            We're on a mission to redefine e-commerce with cutting-edge technology, stunning design, and a seamless shopping experience.
          </p>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
        
        {/* Developer Section */}
        <div className="relative group/card">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover/card:opacity-50 transition duration-1000 group-hover/card:duration-200"></div>
          
          <div className="relative bg-black/40 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-white/10 flex flex-col md:flex-row items-center gap-10 md:gap-16 transform transition-all duration-500 hover:-translate-y-2">
            
            {/* Top Glowing Edge */}
            <div className="absolute top-0 left-20 right-20 h-[1px] bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-30 group-hover/card:opacity-100 transition-opacity duration-500"></div>
            
            {/* Developer Avatar */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-cyan-500 rounded-full blur-xl opacity-40 group-hover/card:opacity-100 group-hover/card:animate-spin-slow transition-all duration-700"></div>
              <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full p-[3px] bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500 cursor-pointer shadow-[0_0_30px_rgba(236,72,153,0.3)]" onClick={() => setSelectedImage(ankitImg)}>
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                  <img 
                    src={ankitImg} 
                    alt="Ankit Das" 
                    className="w-full h-full object-cover transform group-hover/card:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-slate-900 p-3 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.5)] border border-pink-500/50">
                <Code className="w-6 h-6 text-pink-400" />
              </div>
            </div>

            {/* Developer Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <Star className="w-4 h-4 text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em]">Lead Developer</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-md">
                Ankit Das
              </h2>
              <p className="text-pink-400 font-bold mb-6 text-lg">
                Student Diploma Computer Science & Technology
              </p>
              
              {/* Social Links */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
                <a href="https://www.instagram.com/the.ankit.das?igsh=Z3l6MzRiZDR3czF1" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-[#E1306C] hover:border-[#E1306C] hover:text-white hover:scale-110 hover:shadow-[0_0_20px_#E1306C] transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://www.linkedin.com/in/ankit-das-434594340?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-[#0077b5] hover:border-[#0077b5] hover:text-white hover:scale-110 hover:shadow-[0_0_20px_#0077b5] transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
                </a>
                <a href="https://x.com/AnkitDa01860054" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-[#1DA1F2] hover:border-[#1DA1F2] hover:text-white hover:scale-110 hover:shadow-[0_0_20px_#1DA1F2] transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="https://github.com/ankitdas37" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-slate-700 hover:border-slate-500 hover:text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="mailto:ankitdas082006@gmail.com" className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-red-500 hover:border-red-500 hover:text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-300">
                  <Mail className="w-5 h-5" />
                </a>
                
                <button 
                  onClick={() => setIsContactModalOpen(true)}
                  className="flex items-center justify-center px-6 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] hover:scale-105 border border-pink-400/50"
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> CONTACT DEVELOPER
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Owner Section */}
        <div className="relative group/card">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-[2.5rem] blur opacity-20 group-hover/card:opacity-50 transition duration-1000 group-hover/card:duration-200"></div>
          
          <div className="relative bg-black/40 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-white/10 flex flex-col md:flex-row-reverse items-center gap-10 md:gap-16 transform transition-all duration-500 hover:-translate-y-2">
            
            {/* Top Glowing Edge */}
            <div className="absolute top-0 left-20 right-20 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30 group-hover/card:opacity-100 transition-opacity duration-500"></div>
            
            {/* Owner Avatar */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-emerald-500 rounded-full blur-xl opacity-40 group-hover/card:opacity-100 group-hover/card:animate-spin-slow transition-all duration-700"></div>
              <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full p-[3px] bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-500 cursor-pointer shadow-[0_0_30px_rgba(6,182,212,0.3)]" onClick={() => setSelectedImage("https://api.dicebear.com/7.x/notionists/svg?seed=Milo&backgroundColor=ffdfbf")}>
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                  <img 
                    src="https://api.dicebear.com/7.x/notionists/svg?seed=Milo&backgroundColor=ffdfbf" 
                    alt="Owner" 
                    className="w-full h-full object-cover transform group-hover/card:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className="absolute -bottom-2 -left-2 bg-slate-900 p-3 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-cyan-500/50">
                <Rocket className="w-6 h-6 text-cyan-400" />
              </div>
            </div>

            {/* Owner Info */}
            <div className="flex-1 text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end gap-2 mb-3">
                <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em]">Founder & CEO</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-md">
                The Visionary
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-xl ml-auto">
                Dedicated to bridging the gap between quality products and seamless accessibility. The driving force behind W!FO MART's mission to revolutionize online shopping.
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-end gap-4">
                <Link to="/contact" className="inline-flex items-center justify-center px-6 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-900 font-black tracking-wider uppercase transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-105 border border-cyan-300/50">
                  Contact Team
                </Link>
                <Link to="/shop" className="inline-flex items-center justify-center px-6 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black tracking-wider uppercase transition-all duration-300 border border-white/20 hover:border-white/40 hover:scale-105">
                  Explore Store
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors backdrop-blur-md border border-white/10"
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={selectedImage} 
            alt="Full size" 
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Contact Developer Modal (Cyberpunk Styled) */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setIsContactModalOpen(false)}>
          <div 
            className="bg-[#0a0a16] border border-pink-500/30 rounded-3xl shadow-[0_0_40px_rgba(236,72,153,0.15)] w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 duration-300" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Neon Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>

            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <h3 className="text-xl font-black text-white flex items-center tracking-wider uppercase">
                <MessageSquare className="w-5 h-5 mr-3 text-pink-500" /> Interface Link
              </h3>
              <button 
                onClick={() => setIsContactModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black tracking-widest text-pink-400 uppercase mb-2">Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/50 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 text-white transition-all placeholder:text-slate-600 font-medium"
                      placeholder="Identify yourself"
                      value={contactData.name}
                      onChange={(e) => setContactData({...contactData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black tracking-widest text-pink-400 uppercase mb-2">Email *</label>
                    <input 
                      type="email" 
                      required 
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/50 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 text-white transition-all placeholder:text-slate-600 font-medium"
                      placeholder="comm_link@network.com"
                      value={contactData.email}
                      onChange={(e) => setContactData({...contactData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black tracking-widest text-cyan-400 uppercase mb-2">Phone Number *</label>
                    <input 
                      type="tel" 
                      required 
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/50 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-white transition-all placeholder:text-slate-600 font-medium"
                      placeholder="Signal code"
                      value={contactData.phone}
                      onChange={(e) => setContactData({...contactData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black tracking-widest text-cyan-400 uppercase mb-2">Subject *</label>
                    <select 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/50 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-white transition-all appearance-none font-medium"
                      value={contactData.subject}
                      onChange={(e) => setContactData({...contactData, subject: e.target.value})}
                    >
                      <option value="" disabled className="bg-[#0a0a16]">Select protocol</option>
                      <option value="Bug report" className="bg-[#0a0a16]">Bug Report [Glitch Detected]</option>
                      <option value="Review" className="bg-[#0a0a16]">Review [System Analysis]</option>
                      <option value="Any work" className="bg-[#0a0a16]">Any Work [Contract Request]</option>
                      <option value="Other" className="bg-[#0a0a16]">Other [Custom Payload]</option>
                    </select>
                  </div>
                </div>

                {contactData.subject === 'Other' && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-black tracking-widest text-cyan-400 uppercase mb-2">Specify Topic *</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/50 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-white transition-all placeholder:text-slate-600 font-medium"
                      placeholder="Define custom payload"
                      value={contactData.otherSubject}
                      onChange={(e) => setContactData({...contactData, otherSubject: e.target.value})}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black tracking-widest text-purple-400 uppercase mb-2">Message Payload *</label>
                  <textarea 
                    required 
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/50 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white transition-all resize-none placeholder:text-slate-600 font-medium"
                    placeholder="Enter transmission data here..."
                    value={contactData.message}
                    onChange={(e) => setContactData({...contactData, message: e.target.value})}
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black tracking-widest text-slate-400 uppercase mb-2">Image Data (Opt)</label>
                    <label className="flex items-center justify-center w-full px-4 py-3 rounded-xl border border-dashed border-white/20 bg-white/5 cursor-pointer hover:bg-white/10 hover:border-pink-500/50 transition-all group">
                      <Upload className="w-4 h-4 mr-2 text-slate-400 group-hover:text-pink-400" />
                      <span className="text-sm font-medium text-slate-400 group-hover:text-white truncate">
                        {imageFile ? imageFile.name : 'Select Image File'}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => setImageFile(e.target.files[0])}
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-black tracking-widest text-slate-400 uppercase mb-2">Document Data (Opt)</label>
                    <label className="flex items-center justify-center w-full px-4 py-3 rounded-xl border border-dashed border-white/20 bg-white/5 cursor-pointer hover:bg-white/10 hover:border-cyan-500/50 transition-all group">
                      <Upload className="w-4 h-4 mr-2 text-slate-400 group-hover:text-cyan-400" />
                      <span className="text-sm font-medium text-slate-400 group-hover:text-white truncate">
                        {pdfFile ? pdfFile.name : 'Select PDF File'}
                      </span>
                      <input 
                        type="file" 
                        accept="application/pdf" 
                        className="hidden" 
                        onChange={(e) => setPdfFile(e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center px-6 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black tracking-widest uppercase hover:from-pink-400 hover:to-purple-500 transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] disabled:opacity-50 disabled:cursor-not-allowed border border-pink-400/50"
                  >
                    {isSubmitting ? 'Transmitting Data...' : (
                      <><Send className="w-5 h-5 mr-2" /> Initialize Transmission</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default About;
