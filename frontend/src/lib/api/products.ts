import { Product } from "@/types/product";
import { IndividualProduct } from "@/types/product";
import { BASE_URL } from "../../../constants/constants";

// CREATE
export async function createProduct(form: FormData) {
    const res = await fetch(`${BASE_URL}/create-product`, {
        method: "POST",
        body: form,
        credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to create product.");
    return res.json();
}

// GET ALL
export async function getAllProducts(): Promise<
    {
        message: string;
        products: Product[];
        status: string;
    }> {
    const res = await fetch(`${BASE_URL}/get-all-products`, {
        method: "GET",
        cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch products.")
    return res.json();
}

// GET ONE
export async function getProductById(id: string): Promise<
    {
        message: string;
        product: IndividualProduct;
        status: string;
    }> {
    const res = await fetch(`${BASE_URL}/get-product/${id}`, {
        method: "GET",
        cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch product.");
    return res.json();
}

// UPDATE
export async function updateProduct(id: string, form: FormData) {
    const res = await fetch(`${BASE_URL}/update-product/${id}`, {
        method: "PUT",
        body: form,
        credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to update product.");
    return res.json();
}

// DELETE
export async function deleteProduct(id: string) {
    const res = await fetch(`${BASE_URL}/delete-product/${id}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to delete product.");
    return res.json();
}