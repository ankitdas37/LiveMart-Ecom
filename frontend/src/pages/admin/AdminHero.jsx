import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Save, Image as ImageIcon, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminHero = () => {
  const [slides, setSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('/api/settings');
      if (data && data.HERO_SLIDES) {
        let parsed = [];
        try {
          parsed = JSON.parse(data.HERO_SLIDES);
        } catch (e) {
          console.error("Failed to parse hero slides", e);
        }
        setSlides(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Failed to fetch hero settings', error);
      toast.error("Failed to load slides");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = [{
        key: 'HERO_SLIDES',
        value: JSON.stringify(slides),
        type: 'STRING'
      }];
      await axios.put('/api/settings', payload);
      toast.success('Hero Banner saved successfully!');
    } catch (error) {
      console.error('Save failed', error);
      toast.error('Failed to save slides.');
    } finally {
      setIsSaving(false);
    }
  };

  const addSlide = () => {
    setSlides(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        image_url: '',
        subtitle: 'New Subtitle',
        title: 'New Headline',
        titleHighlight: 'Highlight',
        description: 'New description text here',
        button1Text: 'Shop Now',
        button1Link: '/shop',
        button2Text: 'Explore',
        button2Link: '/shop'
      }
    ]);
  };

  const removeSlide = (id) => {
    setSlides(prev => prev.filter(s => s.id !== id));
  };

  const updateSlide = (id, field, value) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const moveSlide = (index, direction) => {
    setSlides(prev => {
      const newSlides = [...prev];
      if (direction === 'up' && index > 0) {
        const temp = newSlides[index];
        newSlides[index] = newSlides[index - 1];
        newSlides[index - 1] = temp;
      } else if (direction === 'down' && index < prev.length - 1) {
        const temp = newSlides[index];
        newSlides[index] = newSlides[index + 1];
        newSlides[index + 1] = temp;
      }
      return newSlides;
    });
  };

  const handleImageUpload = async (e, id) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const toastId = toast.loading('Uploading image...');
    try {
      const { data } = await axios.post('/api/upload', formData);
      updateSlide(id, 'image_url', data.url);
      toast.success('Image uploaded', { id: toastId });
    } catch (error) {
      console.error("Upload error", error);
      toast.error('Failed to upload image', { id: toastId });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ImageIcon className="w-8 h-8 text-slate-700 dark:text-slate-300" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hero Banner</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage home page slider images and text</p>
          </div>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center disabled:opacity-70"
        >
          <Save className="w-5 h-5 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {slides.map((slide, index) => (
          <div key={slide.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative">
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              <button 
                onClick={() => moveSlide(index, 'up')}
                disabled={index === 0}
                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button 
                onClick={() => moveSlide(index, 'down')}
                disabled={index === slides.length - 1}
                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
              <button 
                onClick={() => removeSlide(slide.id)}
                className="p-1 text-red-400 hover:text-red-600 ml-4 border-l pl-4"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Image Column */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Background Image</label>
                {slide.image_url ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-700">
                    <img src={slide.image_url} alt="Slide preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-100">
                        Change Image
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, slide.id)} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                    <label className="cursor-pointer flex flex-col items-center text-slate-500 dark:text-slate-400 hover:text-amber-600">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">Upload Image</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, slide.id)} />
                    </label>
                  </div>
                )}
              </div>

              {/* Text Content Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subtitle (Small top text)</label>
                  <input type="text" value={slide.subtitle} onChange={(e) => updateSlide(slide.id, 'subtitle', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Headline</label>
                    <input type="text" value={slide.title} onChange={(e) => updateSlide(slide.id, 'title', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Craving" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Highlighted Text</label>
                    <input type="text" value={slide.titleHighlight} onChange={(e) => updateSlide(slide.id, 'titleHighlight', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Snacks & Cakes?" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea rows="2" value={slide.description} onChange={(e) => updateSlide(slide.id, 'description', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none"></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Primary Button Text</label>
                    <input type="text" value={slide.button1Text} onChange={(e) => updateSlide(slide.id, 'button1Text', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link (e.g. /shop)</label>
                    <input type="text" value={slide.button1Link} onChange={(e) => updateSlide(slide.id, 'button1Link', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Secondary Btn Text</label>
                    <input type="text" value={slide.button2Text} onChange={(e) => updateSlide(slide.id, 'button2Text', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Leave empty to hide" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link</label>
                    <input type="text" value={slide.button2Link} onChange={(e) => updateSlide(slide.id, 'button2Link', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={addSlide}
          className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-medium rounded-2xl hover:border-amber-500 hover:text-amber-600 transition-colors flex items-center justify-center bg-white dark:bg-slate-900"
        >
          <Plus className="w-5 h-5 mr-2" /> Add New Slide
        </button>

      </div>
    </div>
  );
};

export default AdminHero;
