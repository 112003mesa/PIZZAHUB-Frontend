import { IoClose, IoCart, IoCheckmarkCircle, IoBasket } from "react-icons/io5";
import type { MenuItem, SizeOption } from "../type";
import { useEffect, useState } from "react";
import { formatPrice } from "./Formatters";
import toast from "react-hot-toast";

// Redux Imports
import { addToCart, toggleCheckout } from "../redux/cartSlice";
import Checkout from "./Checkout";
import type { RootState } from "../redux/store";
import { useAppDispatch, useAppSelector } from "../redux/hooks";

const Menu = ({ items }: { items: MenuItem[] }) => {
  const dispatch = useAppDispatch();
  const { items: cartItems, isCheckoutOpen } = useAppSelector((state: RootState) => state.cart);

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const closeModal = () => {
    setSelectedItem(null);
    setSelectedSize(null);
    setSelectedExtras([]);
    setQuantity(1);
  };

  useEffect(() => {
    if (selectedItem && selectedItem.sizes.length > 0) {
      const smallSize =
        selectedItem.sizes.find((s) => s.name.toLowerCase() === "small") ||
        selectedItem.sizes[0];
      setSelectedSize(smallSize);
    }
  }, [selectedItem]);

  // Calculate live price for the Modal UI
  const getModalTotalPrice = () => {
    if (!selectedItem) return 0;
    const sizePrice = selectedSize?.price || 0;
    const extrasPrice = selectedItem.extras
      .filter((e) => selectedExtras.includes(e.name))
      .reduce((sum, e) => sum + e.price, 0);
    return (selectedItem.basePrice + sizePrice + extrasPrice) * quantity;
  };
  const handleAddToCart = () => {
    if (!selectedItem) return;

    dispatch(
    addToCart({
        item: selectedItem,
        size: selectedSize,
        extrasNames: selectedExtras,
        quantity: quantity,
    })
    );

    toast.success("Added to cart!");
    closeModal();
  };

  // Calculate total items for floating button badge
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      {/* --- GRID LAYOUT --- */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 py-10 px-4">
        {items.map((item, index) => (
          <li
            key={item._id + index}
            className="group relative bg-white rounded-[2rem] p-6 pt-24 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
          >
            {/* Floating Image */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40">
              <img
                className="w-full h-full object-cover rounded-full shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500"
                src={item.image}
                alt={item.name}
              />
              <div className="absolute bottom-0 right-0 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                {formatPrice(item.basePrice)}
              </div>
            </div>

            {/* Content */}
            <div className="text-center h-full flex flex-col">
              <h3 className="font-black text-xl text-gray-800 mb-2 group-hover:text-primary transition-colors">
                {item.name}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
                {item.description}
              </p>

              <button
                onClick={() => setSelectedItem(item)}
                className="w-full bg-gray-50 hover:bg-primary hover:text-white text-gray-800 font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-primary/30"
              >
                Add to Cart <IoCart className="text-xl" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* --- FLOATING CART BUTTON --- */}
      <button
        onClick={() => dispatch(toggleCheckout(true))}
        className="fixed bottom-8 right-8 z-40 bg-gray-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
      >
        <IoBasket className="text-2xl" />
        {totalCartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
            {totalCartCount}
          </span>
        )}
      </button>

      {/* --- MODAL --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with Blur */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row max-h-[90vh]">
            {/* Close Button Mobile */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 bg-white/80 p-2 rounded-full md:hidden"
            >
              <IoClose size={24} />
            </button>

            {/* Left Side: Image */}
            <div className="w-full md:w-5/12 bg-gray-50 flex items-center justify-center p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-primary/5 rounded-full scale-150 blur-3xl" />
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] animate-[spin_60s_linear_infinite]"
              />
            </div>

            {/* Right Side: Options */}
            <div className="w-full md:w-7/12 p-8 flex flex-col overflow-y-auto custom-scrollbar">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-800">
                    {selectedItem.name}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {selectedItem.description}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="hidden md:block text-gray-400 hover:text-red-500 transition-colors"
                >
                  <IoClose size={32} />
                </button>
              </div>

              {/* Sizes Selection */}
              <div className="mb-8">
                <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">
                  Select Size
                </h4>

                <div className="flex flex-wrap gap-3">
                  {(selectedItem?.sizes ?? []).map((size) => {
                    const isSelected = selectedSize?.name === size.name;

                    return (
                      <button
                        key={size.id + size.name}
                        onClick={() => setSelectedSize(size)}
                        type="button"
                        className={`flex-1 min-w-[100px] border-2 rounded-xl py-3 px-4 flex flex-col items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                            : "border-gray-100 bg-white text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        <span className={`font-bold ${isSelected ? "text-lg" : "text-base"}`}>
                          {size.name}
                        </span>

                        <span className="text-xs mt-1 font-medium opacity-80">
                          {size.price === 0 ? "Standard" : `+${formatPrice(size.price)}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Extras Selection */}
              {selectedItem.extras.length > 0 && (
                <div className="mb-8">
                  <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">
                    Any Extras?
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedItem.extras.map((extra) => {
                      const active = selectedExtras.includes(extra.name);
                      return (
                        <div
                          key={extra.id + extra.name}
                          onClick={() =>
                            active
                              ? setSelectedExtras((p) =>
                                  p.filter((n) => n !== extra.name)
                                )
                              : setSelectedExtras((p) => [...p, extra.name])
                          }
                          className={`cursor-pointer flex items-center justify-between p-3 rounded-lg border transition-all ${
                            active
                              ? "border-primary bg-orange-50"
                              : "border-gray-100 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center ${
                                active ? "bg-primary text-white" : "bg-gray-200"
                              }`}
                            >
                              {active && (
                                <IoCheckmarkCircle className="w-full h-full" />
                              )}
                            </div>
                            <span
                              className={`text-sm font-medium ${
                                active ? "text-gray-800" : "text-gray-500"
                              }`}
                            >
                              {extra.name}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-gray-400">
                            +{formatPrice(extra.price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Footer Action */}
              <div className="mt-auto pt-6 border-t border-gray-100 flex items-center gap-4">
                {/* Quantity Counter */}
                <div className="flex items-center border border-gray-200 rounded-full h-12">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-12 h-full flex items-center justify-center text-xl font-bold hover:bg-gray-100 rounded-l-full"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-12 h-full flex items-center justify-center text-xl font-bold hover:bg-gray-100 rounded-r-full"
                  >
                    +
                  </button>
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary text-white h-12 rounded-full font-bold shadow-lg shadow-primary/30 hover:bg-orange-600 transition-all flex items-center justify-between px-6"
                >
                  <span>Add to Order</span>
                  <span className="bg-white/20 px-2 py-1 rounded text-sm">
                    {formatPrice(getModalTotalPrice())}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CHECKOUT COMPONENT --- */}
      {isCheckoutOpen && <Checkout />}
    </>
  );
};

export default Menu;