import { X } from 'lucide-react';
import { useEffect } from 'react';

const ImageModal = ({ imageUrl, altText = "Image", onClose }) => {
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
        aria-label="Close image"
      >
        <X className="w-6 h-6" />
      </button>
      
      <div 
        className="relative max-w-5xl max-h-[90vh] w-auto h-auto rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/20 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Prevent clicks on image from closing modal
      >
        <img 
          src={imageUrl} 
          alt={altText} 
          className="max-w-full max-h-[90vh] object-contain bg-slate-900/50"
        />
      </div>
    </div>
  );
};

export default ImageModal;
