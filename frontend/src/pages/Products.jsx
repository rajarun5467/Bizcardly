import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaRupeeSign, FaImage } from 'react-icons/fa';
import { API_BASE_URL } from '../api/config';
import UsageIndicator from '../components/UsageIndicator';

const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

const assetUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', description: '', image: null });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(null);

  const fetchUsage = async () => {
    try {
      const { data } = await api.get('/subscription/usage');
      setUsage(data.usage);
    } catch (err) {
      console.error('Failed to fetch usage:', err.message);
    }
  };

  const fetchProducts = async () => {
    try {
      console.log('📥 Fetching products...');
      const { data } = await api.get('/products');
      console.log('✅ Products fetched:', data.products?.length || 0, 'products');
      
      if (data.products?.length > 0) {
        data.products.forEach((item, idx) => {
          console.log(`  ${idx + 1}. ID: ${item._id}, Name: ${item.name}, Image: ${item.image || 'none'}`);
        });
      }
      
      setProducts(data.products || []);
    } catch (err) {
      console.error('❌ Fetch products error:', err.message);
      toast.error('Failed to fetch products');
    }
  };

  useEffect(() => {
    console.log('Products useEffect - user:', user);
    if (user) {
      fetchProducts();
      fetchUsage();
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('📸 Starting product creation/update');
    
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('price', formData.price);
      data.append('description', formData.description);
      
      if (formData.image && formData.image instanceof File) {
        console.log(`  Image: ${formData.image.name} (${formData.image.size} bytes)`);
        data.append('image', formData.image);
      } else if (formData.image) {
        console.log(`  Keeping existing image: ${formData.image}`);
      }

      console.log('📤 Sending request to /products');
      const res = await api.post('/products', data);
      const result = res.data;
      
      console.log('✅ Response received:', result);
      if (!result.success) throw new Error(result.message || 'Failed to save product');
      
      toast.success(editingProduct ? 'Product updated!' : 'Product added!');
      setShowModal(false);
      resetForm();
      fetchProducts();
      fetchUsage();
    } catch (err) {
      console.error('❌ Product save error:', err.message);
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      image: null,
    });
    if (product.image) setImagePreview(product.image);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted!');
      fetchProducts();
      fetchUsage();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', description: '', image: null });
    setImagePreview('');
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-in-left">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Products</h2>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          disabled={usage?.products?.limit != null && usage.products.limit >= 0 && usage.products.used >= usage.products.limit}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition hover-lift shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPlus />
          Add Product
        </button>
      </div>

      <UsageIndicator usage={usage} resourceKey="products" label="Products" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-staggered">
        {products.map((product) => {
          const imageUrl = assetUrl(product.image);
          console.log(`🛍️  Product - ID: ${product._id}, Image: ${imageUrl}`);
          
          return (
            <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover-lift transition group">
              {product.image && (
                <div className="relative overflow-hidden h-48 bg-gray-200">
                  <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onLoad={() => console.log(`✅ Product image loaded: ${product._id}`)}
                    onError={(e) => {
                      console.error(`❌ Product image failed to load: ${product._id}`, e);
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23f3f4f6" width="300" height="200"/%3E%3Ctext x="50%25" y="50%25" fill="%239ca3af" text-anchor="middle" dy=".3em" font-size="14"%3EImage Failed to Load%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition">{product.name}</h3>
                <p className="text-indigo-600 font-bold mt-1 flex items-center gap-1">
                  <FaRupeeSign />
                  {product.price}
                </p>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">{product.description}</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-indigo-100 hover:text-indigo-600 transition hover-scale"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition hover-scale"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl animate-fade-in">
          <FaImage className="text-gray-300 text-5xl mx-auto mb-4 animate-bounce-subtle" />
          <p className="text-gray-500">No products yet. Add your first product!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={() => { setShowModal(false); resetForm(); }}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-gray-800">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition hover:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                  <div className="relative">
                    <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition hover:border-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition hover:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition group cursor-pointer">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-lg group-hover:scale-105 transition" />
                    ) : (
                      <p className="text-gray-500">Click to upload image</p>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="productImage" />
                    <label htmlFor="productImage" className="cursor-pointer text-indigo-600 hover:text-indigo-700 transition">
                      Choose file
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition hover-scale"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 hover-scale shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Saving...
                      </span>
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Products;
