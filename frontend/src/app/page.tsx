import ProductCard from "@/components/ProductCard";
import { getAllProducts } from "@/lib/api/products";

export default async function Home() {
  const res = await getAllProducts();
  const products = res.products;

  return (
    <div className="font-sans">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
