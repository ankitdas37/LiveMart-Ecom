import { useState, useEffect, useRef } from 'react';
import { Download, X } from 'lucide-react';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPrompt(false);
      }
    };
    
    if (showPrompt) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showPrompt]);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after 3 seconds so it's not instantly annoying
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div ref={popupRef} className="md:hidden fixed bottom-[80px] left-4 right-4 z-[9999] bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 flex flex-col gap-3 animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="WIFO Mart" className="w-12 h-12 rounded-xl shadow-sm" />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Install WIFO Mart App</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">For quick updates and native experience</p>
          </div>
        </div>
        <button 
          onClick={() => setShowPrompt(false)}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <button 
        onClick={handleInstallClick}
        className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors"
      >
        <Download className="w-5 h-5" />
        Install Now
      </button>
    </div>
  );
};

export default InstallPWA;
