import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { compressImage } from '../../utils/imageCompression';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [extraChargesList, setExtraChargesList] = useState([]);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    about_text: '',
    price: '',
    discount_price: '',
    shipping_charge: '',
    stock: 0,
    min_order_quantity: 1,
    sku: '',
    categoryId: '',
    is_published: true,
    is_paused: false,
    is_bestseller: false,
    cod_available: true,
    return_policy: '7 Days Return',
    replacement_policy: '',
    policy_details: '',
    manual_rating: '',
    manual_reviews_count: '',
    specifications: [{ key: '', value: '' }],
    images: [''], // Array of URL strings
    extra_charges: [] // Array of extra charge IDs
  });

  useEffect(() => {
    const fetchCategoriesAndCharges = async () => {
      try {
        const [catRes, chargeRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/extracharges/active')
        ]);
        setCategories(catRes.data);
        setExtraChargesList(chargeRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    
    fetchCategoriesAndCharges();

    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const res = await axios.get(`/api/products/${id}`);
          const product = res.data;
          setFormData({
            title: product.title || '',
            description: product.description || '',
            about_text: product.about_text || '',
            price: product.price || '',
            discount_price: product.discount_price || '',
            shipping_charge: product.shipping_charge !== null ? product.shipping_charge : '',
            stock: product.stock || 0,
            min_order_quantity: product.min_order_quantity || 1,
            sku: product.sku || '',
            categoryId: product.categoryId || '',
            is_published: product.is_published !== undefined ? product.is_published : true,
            is_paused: product.is_paused !== undefined ? product.is_paused : false,
            is_bestseller: product.is_bestseller !== undefined ? product.is_bestseller : false,
            cod_available: product.cod_available !== undefined ? product.cod_available : true,
            return_policy: product.return_policy || '',
            replacement_policy: product.replacement_policy || '',
            policy_details: product.policy_details || '',
            manual_rating: product.manual_rating || '',
            manual_reviews_count: product.manual_reviews_count || '',
            specifications: product.specifications && product.specifications.length > 0 ? product.specifications : [{ key: '', value: '' }],
            images: product.images && product.images.length > 0 ? product.images : [''],
            extra_charges: (typeof product.extra_charges === 'string' ? JSON.parse(product.extra_charges) : product.extra_charges) || []
          });
        } catch (error) {
          console.error('Failed to fetch product:', error);
        }
      };
      fetchProduct();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const handleImageUpload = async (index, files) => {
    if (!files || files.length === 0) return;

    setUploadingIndex(index);
    let currentImages = [...formData.images];
    let uploadSuccessCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Compress the image before uploading
        const compressedFile = await compressImage(file, 1920, 1920, 0.7); // High resolution but compressed
        
        const uploadData = new FormData();
        uploadData.append('image', compressedFile);

        const res = await axios.post('/api/upload', uploadData);
        const uploadedUrl = res.data.url;

        if (i === 0) {
          // Replace the current index with the first uploaded image
          currentImages[index] = uploadedUrl;
        } else {
          // Append subsequent images to the array
          currentImages.push(uploadedUrl);
        }
        uploadSuccessCount++;
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(error.response?.data?.message || `Failed to upload ${file.name}`);
      }
    }

    // Filter out any empty strings that might be left if we appended
    currentImages = currentImages.filter(img => img.trim() !== '');
    if (currentImages.length === 0) currentImages.push(''); // Always keep at least one field

    setFormData(prev => ({ ...prev, images: currentImages }));
    if (uploadSuccessCount > 0) {
      toast.success(`${uploadSuccessCount} image(s) uploaded successfully!`);
    }
    setUploadingIndex(null);
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    if (newImages.length === 0) newImages.push(''); // Always keep at least one
    setFormData({ ...formData, images: newImages });
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData({ ...formData, specifications: newSpecs });
  };

  const addSpecField = () => {
    setFormData({ ...formData, specifications: [...formData.specifications, { key: '', value: '' }] });
  };

  const removeSpecField = (index) => {
    const newSpecs = formData.specifications.filter((_, i) => i !== index);
    if (newSpecs.length === 0) newSpecs.push({ key: '', value: '' });
    setFormData({ ...formData, specifications: newSpecs });
  };

  const handleExtraChargeChange = (chargeId) => {
    const currentCharges = formData.extra_charges || [];
    if (currentCharges.includes(chargeId)) {
      setFormData({ ...formData, extra_charges: currentCharges.filter(id => id !== chargeId) });
    } else {
      setFormData({ ...formData, extra_charges: [...currentCharges, chargeId] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const url = isEditing ? `/api/products/${id}` : '/api/products';
      const method = isEditing ? 'put' : 'post';
      
      // Clean up images and specifications arrays
      const submitData = { ...formData, images: formData.images.filter(img => img.trim() !== '') };
      submitData.specifications = formData.specifications.filter(s => s.key.trim() !== '' && s.value.trim() !== '');
      
      // Set empty numbers to null so DB accepts it
      if (submitData.discount_price === '') submitData.discount_price = null;
      if (submitData.shipping_charge === '') submitData.shipping_charge = null;
      if (submitData.manual_rating === '') submitData.manual_rating = null;
      if (submitData.manual_reviews_count === '') submitData.manual_reviews_count = null;
      if (submitData.categoryId === '') submitData.categoryId = null;
      if (submitData.sku === '') submitData.sku = null;

      await axios[method](url, submitData);
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <Link to="/admin/products" className="p-2 rounded-full hover:bg-slate-200 text-slate-600 dark:text-slate-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Fill in the details below to save your product.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Title *</label>
                <input 
                  type="text" 
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. Premium Choco Chip Cookies"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Short Description (Summary)</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  required 
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 dark:text-white"
                  placeholder="A brief summary of the product (appears at the top of the page)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">About this product (Long Description)</label>
                <textarea 
                  name="about_text" 
                  value={formData.about_text} 
                  onChange={handleChange} 
                  rows="8"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 dark:text-white"
                  placeholder="Detailed description for the 'About' tab..."
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Specifications</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Add key features (e.g., Size, Weight, Material).</p>
              
              <div className="space-y-3">
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                      placeholder="e.g. Color"
                      className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 dark:text-white"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                      placeholder="e.g. Red"
                      className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 dark:text-white"
                    />
                    <button 
                      type="button" 
                      onClick={() => removeSpecField(index)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-800/50 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                type="button"
                onClick={addSpecField}
                className="mt-2 inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-700"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Specification
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Images</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">The first image will be the <strong>Main Front Cover</strong>.</p>
              
              <div className="space-y-3">
                {formData.images.map((img, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-20 text-xs font-semibold text-slate-400">{index === 0 ? "MAIN COVER" : "GALLERY"}</span>
                    <div className="flex-1 space-y-2">
                      {img ? (
                         <div className="flex items-center space-x-3">
                           <img src={img} alt="Product" className="h-12 w-12 object-cover rounded border border-slate-200 dark:border-slate-700" />
                           <input 
                             type="url"
                             value={img}
                             onChange={(e) => handleImageChange(index, e.target.value)}
                             className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 dark:text-white"
                           />
                         </div>
                      ) : (
                         <input 
                           type="file"
                           accept="image/*"
                           multiple
                           onChange={(e) => handleImageUpload(index, e.target.files)}
                           disabled={uploadingIndex === index}
                           className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                         />
                      )}
                      {uploadingIndex === index && <p className="text-xs text-amber-600">Uploading image to Cloudinary...</p>}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeImageField(index)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-800/50 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              
              <button 
                type="button"
                onClick={addImageField}
                className="mt-2 inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 focus:outline-none bg-white dark:bg-slate-800 dark:text-white"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Another Image
              </button>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Pricing</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Regular Price (₹) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount Price (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="discount_price"
                  value={formData.discount_price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 dark:text-white"
                  placeholder="Leave blank if no discount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Specific Shipping Charge (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="shipping_charge"
                  value={formData.shipping_charge}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 dark:text-white"
                  placeholder="Leave blank for Global Shipping"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Set to 0 for Free Delivery. Overrides global settings.</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Inventory</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU</label>
                <input 
                  type="text" 
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. BIS-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Available Stock *</label>
                <input 
                  type="number" 
                  name="stock"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Minimum Order Quantity *</label>
                <input 
                  type="number" 
                  name="min_order_quantity"
                  required
                  min="1"
                  value={formData.min_order_quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Social Proof</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manually set rating if the product lacks real reviews.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Manual Rating (1-5)</label>
                <input 
                  type="number" 
                  step="0.1"
                  name="manual_rating"
                  value={formData.manual_rating}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. 4.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Manual Review Count</label>
                <input 
                  type="number" 
                  name="manual_reviews_count"
                  value={formData.manual_reviews_count}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. 12"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Organization</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select 
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Store Policy</label>
                <div className="flex items-center space-x-6 mb-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={!!formData.return_policy} 
                      onChange={(e) => setFormData({...formData, return_policy: e.target.checked ? '7 Days Return' : ''})} 
                      className="text-amber-600 focus:ring-amber-500 rounded border-slate-300 dark:border-slate-600" 
                    />
                    <span className="text-sm">Return Policy</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={!!formData.replacement_policy} 
                      onChange={(e) => setFormData({...formData, replacement_policy: e.target.checked ? '7 Days Replacement' : ''})} 
                      className="text-amber-600 focus:ring-amber-500 rounded border-slate-300 dark:border-slate-600" 
                    />
                    <span className="text-sm">Replacement Policy</span>
                  </label>
                </div>
                
                {!!formData.return_policy && (
                  <input 
                    type="text" 
                    name="return_policy"
                    value={formData.return_policy}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 mt-2 bg-white dark:bg-slate-800 dark:text-white"
                    placeholder="e.g. 7 Days Return"
                  />
                )}
                {!!formData.replacement_policy && (
                  <input 
                    type="text" 
                    name="replacement_policy"
                    value={formData.replacement_policy}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 mt-2 bg-white dark:bg-slate-800 dark:text-white"
                    placeholder="e.g. 7 Days Replacement"
                  />
                )}
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Policy Details & Comments</label>
                  <textarea 
                    name="policy_details"
                    value={formData.policy_details}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-slate-800 dark:text-white"
                    placeholder="Write any additional rules, comments, or terms for returns and replacements here..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Extra Charges</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Select extra charges that apply automatically to this product (e.g. Mandatory Gift Wrap).</p>
              {extraChargesList.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No active extra charges found. Add them in the Extra Charges page.</p>
              ) : (
                <div className="space-y-2">
                  {extraChargesList.map(charge => (
                    <label key={charge.id} className="flex items-start space-x-3 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg border border-transparent hover:border-slate-100 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={(formData.extra_charges || []).includes(charge.id)}
                        onChange={() => handleExtraChargeChange(charge.id)}
                        className="mt-1 w-4 h-4 text-amber-600 rounded border-slate-300 dark:border-slate-600 focus:ring-amber-500"
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{charge.name} (+₹{charge.price})</span>
                        {charge.description && <p className="text-xs text-slate-500 dark:text-slate-400">{charge.description}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Visibility & Status</h2>
              <div className="pt-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleChange}
                    className="w-5 h-5 text-amber-600 rounded border-slate-300 dark:border-slate-600 focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Publish Product</span>
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-8 mb-4">If unchecked, product will be hidden from store.</p>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="is_paused"
                    checked={formData.is_paused}
                    onChange={handleChange}
                    className="w-5 h-5 text-orange-600 rounded border-slate-300 dark:border-slate-600 focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pause Product</span>
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-8 mb-4">If checked, product shows as "Temporarily Unavailable" but remains visible.</p>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="cod_available"
                    checked={formData.cod_available}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cash on Delivery Available</span>
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-8 mb-4">Allow customers to pay via COD.</p>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="is_bestseller"
                    checked={formData.is_bestseller}
                    onChange={handleChange}
                    className="w-5 h-5 text-purple-600 rounded border-slate-300 dark:border-slate-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Mark as Best Seller</span>
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-8">If checked, product will appear in the Best Sellers section on the home page.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Link 
            to="/admin/products"
            className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-70"
          >
            <Save className="w-5 h-5 mr-2" />
            {isLoading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
