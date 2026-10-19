import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";

export default function LoadingAdmin() {
  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-garis bg-permukaan py-12 text-sm text-teks-lembut">
        <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-utama border-t-transparent" />
        <p>Memuat daftar produk dari database...</p>
      </div>
    </div>
  );
}

