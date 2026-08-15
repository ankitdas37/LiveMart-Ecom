import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPincodes = () => {
  const [pincodes, setPincodes] = useState([]);
  const [postOffices, setPostOffices] = useState([]);
  const [formData, setFormData] = useState({
    pincode: '',
    area_name: '',
    city: 'Hooghly',
    state: 'West Bengal',
    delivery_charge: 0,
    estimated_days: 3,
    is_active: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  useEffect(() => {
    fetchPincodes();
  }, []);

  const fetchPincodes = async () => {
    try {
      const res = await axios.get('/api/pincodes');
      setPincodes(res.data);
    } catch (error) {
      console.error('Error fetching pincodes:', error);
    }
  };

  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Auto-fetch post office options if pincode is 6 digits
    if (name === 'pincode' && value.length === 6) {
      try {
        const res = await axios.get(`https://api.postalpincode.in/pincode/${value}`);
        if (res.data[0].Status === 'Success') {
          const offices = res.data[0].PostOffice;
          setPostOffices(offices);
          if (offices.length > 0) {
            setFormData(prev => ({
              ...prev,
              state: offices[0].State || prev.state,
              city: offices[0].District || prev.city
            }));
          }
        } else {
          setPostOffices([]);
        }
      } catch (err) {
        console.error('Error fetching post offices', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`/api/pincodes/${currentId}`, formData);
      } else {
        await axios.post('/api/pincodes', formData);
      }
      fetchPincodes();
      resetForm();
    } catch (error) {
      console.error('Error saving pincode:', error);
      alert(error.response?.data?.message || 'Error saving pincode');
    }
  };

  const editPincode = (pincode) => {
    setFormData({
      pincode: pincode.pincode,
      area_name: pincode.area_name,
      city: pincode.city,
      state: pincode.state,
      delivery_charge: pincode.delivery_charge,
      estimated_days: pincode.estimated_days,
      is_active: pincode.is_active,
    });
    setIsEditing(true);
    setCurrentId(pincode.id);
  };

  const togglePincodeStatus = async (pc) => {
    try {
      await axios.put(`/api/pincodes/${pc.id}`, { ...pc, is_active: !pc.is_active });
      fetchPincodes();
    } catch (error) {
      console.error('Error updating pincode status:', error);
    }
  };

  const deletePincode = async (id) => {
    if (window.confirm('Are you sure you want to delete this pincode?')) {
      try {
        await axios.delete(`/api/pincodes/${id}`);
        fetchPincodes();
      } catch (error) {
        console.error('Error deleting pincode:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      pincode: '',
      area_name: '',
      city: 'Hooghly',
      state: 'West Bengal',
      delivery_charge: 0,
      estimated_days: 3,
      is_active: true,
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Delivery Pincodes</h1>
      
      <div className="bg-white dark:bg-slate-900 dark:bg-slate-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Pincode' : 'Add New Pincode'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pincode</label>
            <input required type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Post Office / Area (Optional)</label>
            <input type="text" list="areas-list" name="area_name" value={formData.area_name} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
            <datalist id="areas-list">
              {postOffices.map((po, idx) => (
                 <option key={idx} value={po.Name} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City/District (Optional)</label>
            <input type="text" list="cities-list" name="city" value={formData.city} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
            <datalist id="cities-list">
              <option value="Hooghly" />
              <option value="Alipurduar" />
              <option value="Bankura" />
              <option value="Birbhum" />
              <option value="Cooch Behar" />
              <option value="Dakshin Dinajpur" />
              <option value="Darjeeling" />
              <option value="Howrah" />
              <option value="Jalpaiguri" />
              <option value="Jhargram" />
              <option value="Kalimpong" />
              <option value="Kolkata" />
              <option value="Malda" />
              <option value="Murshidabad" />
              <option value="Nadia" />
              <option value="North 24 Parganas" />
              <option value="Paschim Bardhaman" />
              <option value="Paschim Medinipur" />
              <option value="Purba Bardhaman" />
              <option value="Purba Medinipur" />
              <option value="Purulia" />
              <option value="South 24 Parganas" />
              <option value="Uttar Dinajpur" />
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State (Optional)</label>
            <input type="text" list="states-list" name="state" value={formData.state} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
            <datalist id="states-list">
              <option value="Andaman and Nicobar Islands" />
              <option value="Andhra Pradesh" />
              <option value="Arunachal Pradesh" />
              <option value="Assam" />
              <option value="Bihar" />
              <option value="Chandigarh" />
              <option value="Chhattisgarh" />
              <option value="Dadra and Nagar Haveli and Daman and Diu" />
              <option value="Delhi" />
              <option value="Goa" />
              <option value="Gujarat" />
              <option value="Haryana" />
              <option value="Himachal Pradesh" />
              <option value="Jammu and Kashmir" />
              <option value="Jharkhand" />
              <option value="Karnataka" />
              <option value="Kerala" />
              <option value="Ladakh" />
              <option value="Lakshadweep" />
              <option value="Madhya Pradesh" />
              <option value="Maharashtra" />
              <option value="Manipur" />
              <option value="Meghalaya" />
              <option value="Mizoram" />
              <option value="Nagaland" />
              <option value="Odisha" />
              <option value="Puducherry" />
              <option value="Punjab" />
              <option value="Rajasthan" />
              <option value="Sikkim" />
              <option value="Tamil Nadu" />
              <option value="Telangana" />
              <option value="Tripura" />
              <option value="Uttar Pradesh" />
              <option value="Uttarakhand" />
              <option value="West Bengal" />
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Delivery Charge (₹)</label>
            <input type="number" name="delivery_charge" value={formData.delivery_charge} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1">Estimated Days</label>
            <div className="flex items-center space-x-2">
              <input type="number" name="estimated_days" value={formData.estimated_days} onChange={handleInputChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
              <button 
                type="button" 
                onClick={() => setFormData({...formData, estimated_days: 0})}
                className={`whitespace-nowrap px-3 py-2 rounded text-xs font-bold border transition-colors ${Number(formData.estimated_days) === 0 ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-slate-100 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'}`}
              >
                Set Today
              </button>
              <button 
                type="button" 
                onClick={() => setFormData({...formData, estimated_days: 1})}
                className={`whitespace-nowrap px-3 py-2 rounded text-xs font-bold border transition-colors ${Number(formData.estimated_days) === 1 ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-slate-100 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'}`}
              >
                Set Tomorrow
              </button>
            </div>
          </div>
          <div className="flex items-center mt-6">
            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="mr-2" id="is_active" />
            <label htmlFor="is_active" className="text-sm font-medium">Is Active (Allow Delivery)</label>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 mt-4">
            {isEditing && <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cancel</button>}
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{isEditing ? 'Update Pincode' : 'Add Pincode'}</button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 dark:bg-slate-700">
              <th className="p-4 border-b dark:border-slate-600">Pincode</th>
              <th className="p-4 border-b dark:border-slate-600">Area</th>
              <th className="p-4 border-b dark:border-slate-600">Charge</th>
              <th className="p-4 border-b dark:border-slate-600">Days</th>
              <th className="p-4 border-b dark:border-slate-600">Status</th>
              <th className="p-4 border-b dark:border-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pincodes.map((pc) => (
              <tr key={pc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:bg-slate-750">
                <td className="p-4 border-b dark:border-slate-600">{pc.pincode}</td>
                <td className="p-4 border-b dark:border-slate-600">{pc.area_name}, {pc.city}</td>
                <td className="p-4 border-b dark:border-slate-600">₹{pc.delivery_charge}</td>
                <td className="p-4 border-b dark:border-slate-600">{pc.estimated_days}</td>
                <td className="p-4 border-b dark:border-slate-600">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${pc.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {pc.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 border-b dark:border-slate-600 text-right space-x-3">
                  <button onClick={() => togglePincodeStatus(pc)} className="text-orange-600 hover:underline">
                    {pc.is_active ? 'Pause' : 'Resume'}
                  </button>
                  <button onClick={() => editPincode(pc)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => deletePincode(pc.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {pincodes.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-slate-500 dark:text-slate-400">No pincodes added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPincodes;
