import { useEffect, useState, type ChangeEvent, useMemo } from "react";
import {
  IoTrashOutline,
  IoPencilOutline,
  IoAddOutline,
  IoCloseOutline,
  IoSearchOutline,
  IoCloudUploadOutline,
  IoImageOutline,
  IoPricetagOutline,
  IoLayersOutline,
} from "react-icons/io5";
import { formatPrice } from "../../components/Formatters"; // تأكد من المسار
import { useAppSelector } from "../../redux/hooks"; // تأكد من المسار
import api from "../../api/axios"; // تأكد من المسار
import toast from "react-hot-toast";
import Loading3D from "../../components/Loading3D.tsx";
import DeleteConfirmation from "../../components/DeleteConfirmation"; // تأكد من استيراد المكون

/* ================= TYPES ================= */
type Size = { id: string; name: string; price: number };
type Extra = { id: string; name: string; price: number };

type Product = {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  sizes: Size[];
  extras: Extra[];
  category: string;
};

/* ================= COMPONENTS ================= */

const CategoryBadge = ({ category }: { category: string }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase tracking-wide">
    {category}
  </span>
);

const ProductsAdmin = () => {
  const { token } = useAppSelector((state) => state.authReducer);

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState<number | string>(0);
  const [image, setImage] = useState<File | string | null>(null);
  const [category, setCategory] = useState("");
  const [sizes, setSizes] = useState<Size[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  /* ================= HANDLERS ================= */

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setDescription(product.description);
      setBasePrice(product.basePrice);
      setImage(product.image);
      setCategory(product.category);
      setSizes(product.sizes || []);
      setExtras(product.extras || []);
    } else {
      setEditingProduct(null);
      setName("");
      setDescription("");
      setBasePrice(0);
      setImage(null);
      setCategory("");
      setSizes([]);
      setExtras([]);
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleDynamicChange = <T extends Size | Extra>(
    id: string,
    key: keyof T,
    value: string | number,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    setter((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const addItem = (setter: React.Dispatch<React.SetStateAction<any[]>>, prefix: string) => {
    setter((prev) => [...prev, { id: `${prefix}${Date.now()}`, name: "", price: 0 }]);
  };

  const removeItem = (id: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    setter((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = async () => {
    if (!name || !description || !category || (!image && !editingProduct)) {
      toast.error("Please fill in all required fields and upload an image");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("basePrice", String(basePrice));
      formData.append("category", category);

      const cleanedSizes = sizes.map(({ name, price }) => ({ name, price }));
      const cleanedExtras = extras.map(({ name, price }) => ({ name, price }));
      
      formData.append("sizes", JSON.stringify(cleanedSizes));
      formData.append("extras", JSON.stringify(cleanedExtras));

      if (image instanceof File) {
        formData.append("image", image);
      }

      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        } 
      };

      if (editingProduct) {
        await api.put(`/products/update/${editingProduct._id}`, formData, config);
        toast.success("Product updated successfully");
      } else {
        await api.post(`/products/create`, formData, config);
        toast.success("Product created successfully");
      }

      await fetchProducts();
      closeModal();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      setLoading(true);
      await api.delete(`/products/delete/${productToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product deleted successfully");
      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
    } catch (err) {
      toast.error("Failed to delete product");
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gray-50/50 p-6 sm:p-8 font-sans text-gray-800">
      
      {loading && (
        <div className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center">
          <Loading3D />
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <IoLayersOutline className="text-primary" /> Products Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage your store items, prices, and variations.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <IoAddOutline size={20} /> New Product
          </button>
        </div>
      </div>

      {/* --- TABLE CONTENT --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredProducts.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-3">
              <IoLayersOutline size={40} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1">
              Try adjusting your search or add a new product to your inventory.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Info</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Variations</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 flex-shrink-0 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                          {p.image ? (
                              <img 
                                src={p.image} 
                                alt={p.name} 
                                className="h-full w-full object-cover" 
                                onError={(e) => { (e.target as HTMLImageElement).src = 'placeholder_image_url' }} 
                              />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              <IoImageOutline size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CategoryBadge category={p.category} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {formatPrice(p.basePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md w-fit">
                          {p.sizes?.length || 0} Sizes
                        </span>
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md w-fit">
                          {p.extras?.length || 0} Extras
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => openModal(p)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <IoPencilOutline size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(p)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <IoTrashOutline size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
          
          <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                <IoCloseOutline size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Product Image</label>
                    <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-all group overflow-hidden">
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      
                      {image ? (
                         <img 
                           src={image instanceof File ? URL.createObjectURL(image) : image} 
                           className="absolute inset-0 w-full h-full object-cover" 
                           alt="Preview"
                         />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 group-hover:text-indigo-500">
                          <IoCloudUploadOutline size={32} className="mb-2" />
                          <p className="text-sm font-medium">Click to upload</p>
                          <p className="text-xs text-gray-400">SVG, PNG, JPG</p>
                        </div>
                      )}
                      
                      {image && (
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <IoPencilOutline className="text-white" size={24} />
                         </div>
                      )}
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <input
                            type="text"
                            placeholder="e.g. Pizza, Drinks"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Base Price</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">$</div>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={basePrice}
                                onChange={(e) => setBasePrice(e.target.value)}
                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-5">
                  <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input
                            type="text"
                            placeholder="Delicious Item Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            placeholder="Describe ingredients, taste, etc."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all min-h-[100px] resize-y"
                        />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 my-4"></div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <IoPricetagOutline /> Sizes
                        </label>
                        <button type="button" onClick={() => addItem(setSizes, 's')} className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1">
                            <IoAddOutline /> Add Size
                        </button>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-100">
                        {sizes.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No sizes added.</p>}
                        {sizes.map((s) => (
                            <div key={s.id} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={s.name}
                                    onChange={(e) => handleDynamicChange(s.id, "name", e.target.value, setSizes)}
                                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 outline-none"
                                />
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={s.price}
                                    onChange={(e) => handleDynamicChange(s.id, "price", parseFloat(e.target.value), setSizes)}
                                    className="w-24 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 outline-none"
                                />
                                <button type="button" onClick={() => removeItem(s.id, setSizes)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition">
                                    <IoTrashOutline />
                                </button>
                            </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <IoLayersOutline /> Extras
                        </label>
                        <button type="button" onClick={() => addItem(setExtras, 'e')} className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1">
                            <IoAddOutline /> Add Extra
                        </button>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-100">
                        {extras.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No extras added.</p>}
                        {extras.map((e) => (
                            <div key={e.id} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={e.name}
                                    onChange={(ev) => handleDynamicChange(e.id, "name", ev.target.value, setExtras)}
                                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 outline-none"
                                />
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={e.price}
                                    onChange={(ev) => handleDynamicChange(e.id, "price", parseFloat(ev.target.value), setExtras)}
                                    className="w-24 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:border-indigo-500 outline-none"
                                />
                                <button type="button" onClick={() => removeItem(e.id, setExtras)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition">
                                    <IoTrashOutline />
                                </button>
                            </div>
                        ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={closeModal} 
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={loading}
                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <DeleteConfirmation 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={productToDelete?.name || ""}
      />
    </div>
  );
};

export default ProductsAdmin;