import { Link } from "react-router-dom";
import MainHeading from "./MainHeading";
import Menu from "./Menu";
import { useEffect, useState } from "react";
import api from "../api/axios";
import type { MenuItem } from "../type";

const BestSellers = () => {

  const [bestSellers, setBestSellers] = useState<MenuItem []>([]);

const fetchBestSellers = async () => {
  try {
    const res = await api.get("/products/best-sellers");
      setBestSellers(res.data.data);
  } catch (error) {
    console.error("Error fetching best sellers:", error);
  }
};

  useEffect(() => {
    fetchBestSellers();
  }, [])

  return (
    <section className="py-24 bg-white">
      <div className="container">
        <div className="mb-12 text-center max-w-2xl mx-auto">
        <span className="text-primary font-bold tracking-wider uppercase text-sm">Hungry?</span>
        <MainHeading title="Our Top Sellers" subTitle="Most Loved by Customers" />
        <p className="text-gray-500 mt-4">Dive into our customer favorites. Handpicked recipes that keep people coming back for more.</p>
        </div>
        
        {/* Pass data to Menu component */}
        <Menu items={bestSellers} />
        
        <div className="text-center mt-12">
            <Link to="/menu" className="text-primary font-bold border-b-2 border-primary hover:text-orange-700 transition-colors pb-1">
                View Full Menu
            </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;