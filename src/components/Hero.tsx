import { BsArrowRightCircle, BsPlayCircle } from "react-icons/bs";

const Hero = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center bg-orange-50/30 overflow-hidden">
      {/* Background Decor Elements */}
      <div className="absolute top-0 right-0 w-[40%] h-full bg-primary/5 -skew-x-12 translate-x-20 z-0 hidden md:block" />
      <div className="absolute top-20 left-10 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl" />

      <div className="container relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Content */}
        <div className="text-center md:text-left space-y-6">
          <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-primary text-sm font-bold tracking-wide uppercase">
            🚀 Free Delivery on First Order
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1]">
            Slice into <br />
            <span className="text-primary italic relative">
              Happiness
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-400" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-lg mx-auto md:mx-0 leading-relaxed">
            Authentic Italian pizza made with love. Fresh ingredients, crispy crusts, and flavors that melt in your mouth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
            <button className="bg-primary text-white px-8 py-4 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center gap-3 font-bold hover:scale-105 transition-transform duration-300">
              Order Now <BsArrowRightCircle className="w-6 h-6" />
            </button>
            <button className="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-full shadow-sm flex items-center justify-center gap-3 font-bold hover:bg-gray-50 transition-colors">
              <BsPlayCircle className="w-6 h-6 text-primary" /> Watch Video
            </button>
          </div>
        </div>

        {/* Image with Floating Effect */}
        <div className="relative group flex justify-center">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-75 group-hover:scale-90 transition-transform duration-700" />
          <img 
            src="/image/slider_pizza_2.png" 
            alt="Delicious Pizza" 
            className="relative w-full max-w-[550px] object-contain drop-shadow-2xl animate-[float_6s_ease-in-out_infinite]" 
            loading="eager" 
          />
          {/* Badge */}
          <div className="absolute -bottom-6 right-10 bg-white p-4 rounded-2xl shadow-xl border-l-4 border-primary hidden md:block animate-[bounce_3s_infinite]">
             <p className="font-bold text-gray-900">🔥 Hot & Spicy</p>
             <p className="text-xs text-gray-500">Best Seller of the week</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero