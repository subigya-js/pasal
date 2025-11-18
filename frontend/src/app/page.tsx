import Link from "next/link";
import { Button } from '@/components/ui/button';
import { sampleItems } from '../../constants/sample';
import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sampleItems.map((item) => (
            <div key={item.id} className="rounded-xl overflow-hidden transition-shadow py-2">
              <Link href={`/${item.id}`}>
                <div className="bg-gray-100 cursor-pointer p-2 rounded-lg hover:shadow-md duration-300 transition-shadow">
                  <div className="relative overflow-hidden">
                    <Image
                      src={item.images[0].url}
                      alt={item.images[0].alt}
                      className="w-full h-full object-cover rounded-xl"
                      width={300}
                      height={300}
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              </Link>

              <div className='flex flex-col gap-2 mt-2 px-2'>
                <p className="font-bold text-blue-500 text-center">{item.price}</p>
                <div className='flex justify-between'>
                  <Button variant="outline" className="text-black w-full py-1 px-2 rounded cursor-pointer">
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
