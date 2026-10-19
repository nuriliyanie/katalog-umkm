import { Suspense } from "react";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createServerClient, createSessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function DaftarProdukAdmin() {
  let daftarProduk = [];
  let error = null;

  try {
    const supabase = await createSessionClient();
    let res = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (res.error) {
      const serverSupabase = createServerClient();
      res = await serverSupabase
        .from("produk")
        .select("*")
        .order("id", { ascending: true });
    }

    if (res.error) {
      error = res.error.message;
    } else {
      daftarProduk = res.data || [];
    }
  } catch (err) {
    error = err.message || "Gagal memuat data dari database.";
  }

  if (error) {
    return (
      <div className="rounded-xl border border-garis bg-permukaan p-4 text-sm text-bahaya">
        Gagal mengambil data produk: {error}
      </div>
    );
  }

  return <TabelProduk daftarProduk={daftarProduk} />;
}

function LoadingProduk() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-garis bg-permukaan py-12 text-sm text-teks-lembut">
      <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-utama border-t-transparent" />
      <p>Memuat daftar produk dari database...</p>
    </div>
  );
}

export default function HalamanAdmin() {
  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      <Suspense fallback={<LoadingProduk />}>
        <DaftarProdukAdmin />
      </Suspense>
    </div>
  );
}
