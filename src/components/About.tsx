import MainHeading from "./MainHeading";
import { FaPizzaSlice, FaShippingFast, FaLeaf } from "react-icons/fa";

function About() {
  const features = [
    { icon: <FaShippingFast />, title: "Fast Delivery", text: "30 mins or free" },
    { icon: <FaLeaf />, title: "Fresh Food", text: "100% Organic" },
    { icon: <FaPizzaSlice />, title: "Original Taste", text: "Secret Recipe" },
  ];

  return (
    <section className="py-20 bg-gray-50" id="about">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Images Collage */}
          <div className="relative">
             <div className="grid grid-cols-2 gap-4">
                <img src="/image/slider_pizza_1.png" className="rounded-3xl shadow-lg object-cover h-64 w-full bg-white p-2" alt="Pizza 1"/>
                <img src="/image/slider_pizza_2.png" className="rounded-3xl shadow-lg object-cover h-64 w-full bg-white p-2 translate-y-8" alt="Pizza 2"/>
             </div>
             {/* Experience Badge */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white p-6 rounded-full shadow-xl text-center w-32 h-32 flex flex-col justify-center items-center border-4 border-white">
                <span className="text-3xl font-black">10+</span>
                <span className="text-xs font-medium">Years Exp.</span>
             </div>
          </div>

          {/* Text Content */}
          <div className="text-left">
            <MainHeading subTitle="Our Story" title="We Cook With Passion" />
            <p className="text-gray-500 mt-6 text-lg leading-relaxed">
              It started with a simple idea: Create the best pizza in town using only locally sourced ingredients. Today, we are proud to serve thousands of happy customers every month.
            </p>
            <p className="text-gray-500 mt-4 leading-relaxed">
              Our dough is fermented for 48 hours, and our sauce is made fresh daily from vine-ripened tomatoes.
            </p>
            
            {/* Features Icons */}
            <div className="grid grid-cols-3 gap-4 mt-8">
                {features.map((f, i) => (
                    <div key={i} className="text-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-primary text-2xl mb-2 flex justify-center">{f.icon}</div>
                        <h4 className="font-bold text-gray-800 text-sm">{f.title}</h4>
                        <span className="text-xs text-gray-400">{f.text}</span>
                    </div>
                ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default About;