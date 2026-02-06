import { useEffect, useState } from "react";
import Menu from "../../components/Menu";
import toast from "react-hot-toast";
import api from "../../api/axios";
import type { MenuItem } from "../../type";
import Loading3D from "../../components/Loading3D.tsx";

// نوع تجميع الفئات
type CategoryGroup = {
  name: string;
  products: MenuItem[];
};

const Page = () => {
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/products");

      const productsData: MenuItem[] = data.data;

      const grouped: Record<string, MenuItem[]> = {};

      productsData.forEach((product) => {
        if (!grouped[product.category]) {
          grouped[product.category] = [];
        }
        grouped[product.category].push(product);
      });

      const categoriesArray: CategoryGroup[] = Object.keys(grouped).map(
        (key) => ({
          name: key,
          products: grouped[key],
        })
      );
      setCategories(categoriesArray);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return loading ? (<div className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center"><Loading3D /></div>) : (
    <section className="bg-gray-50 min-h-screen py-10">
      <div className="container flex flex-col gap-16">
        {categories.map((category, index) => (
          <div key={category.name + index}>
            <div className="flex items-center gap-4 mb-8">
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 italic relative z-10">
                {category.name}
                <span className="absolute bottom-1 left-0 w-full h-3 bg-primary/20 -z-10 rounded-full"></span>
              </h1>
              <div className="h-[2px] bg-gray-200 flex-1 rounded-full"></div>
            </div>

            <Menu items={category.products} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Page;
