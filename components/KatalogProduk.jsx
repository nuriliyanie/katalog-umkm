"use client";

import { useState, useMemo } from "react";
import KartuProduk from "@/components/KartuProduk";

export default function KatalogProduk({ daftarProduk = [] }) {
  const [pencarian, setPencarian] = useState("");
  const [kategoriAktif, setKategoriAktif] = useState("Semua");

  // Ekstrak daftar kategori unik dari produk
  const daftarKategori = useMemo(() => {
    const setKat = new Set();
    daftarProduk.forEach((p) => {
      if (p.kategori && p.kategori.trim()) {
        setKat.add(p.kategori.trim());
      }
    });
    return ["Semua", ...Array.from(setKat)];
  }, [daftarProduk]);

  // Filter produk berdasarkan teks pencarian dan kategori
  const produkTersaring = useMemo(() => {
    const query = pencarian.toLowerCase().trim();
    return daftarProduk.filter((produk) => {
      const cocokNama =
        !query ||
        (produk.nama && produk.nama.toLowerCase().includes(query)) ||
        (produk.deskripsi && produk.deskripsi.toLowerCase().includes(query));

      const cocokKategori =
        kategoriAktif === "Semua" ||
        (produk.kategori &&
          produk.kategori.toLowerCase().trim() ===
            kategoriAktif.toLowerCase().trim());

      return cocokNama && cocokKategori;
    });
  }, [daftarProduk, pencarian, kategoriAktif]);

  if (daftarProduk.length === 0) {
    return <p className="text-sm text-teks-lembut">Belum ada produk</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Kontrol Pencarian & Filter Kategori */}
      <div className="flex flex-col gap-4">
        {/* Input Pencarian */}
        <div className="relative max-w-md">
          <input
            type="text"
            value={pencarian}
            onChange={(e) => setPencarian(e.target.value)}
            placeholder="Cari nama atau deskripsi produk..."
            className="w-full rounded-xl border border-garis bg-latar px-4 py-2.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
          {pencarian && (
            <button
              type="button"
              onClick={() => setPencarian("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-teks-lembut hover:text-teks"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Filter Kategori */}
        {daftarKategori.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            {daftarKategori.map((kat) => {
              const isActive = kategoriAktif === kat;
              return (
                <button
                  key={kat}
                  type="button"
                  onClick={() => setKategoriAktif(kat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-utama text-white"
                      : "border border-garis bg-latar text-teks-lembut hover:border-utama hover:text-utama"
                  }`}
                >
                  {kat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tampilan Daftar Produk atau Pesan Khusus */}
      {produkTersaring.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-garis bg-permukaan py-12 text-center text-sm text-teks-lembut">
          <p className="font-semibold text-teks">Produk tidak ditemukan</p>
          <p className="mt-1 text-xs">
            Tidak ada produk yang cocok dengan pencarian &quot;{pencarian}&quot;
            {kategoriAktif !== "Semua" ? ` pada kategori "${kategoriAktif}"` : ""}.
          </p>
          <button
            type="button"
            onClick={() => {
              setPencarian("");
              setKategoriAktif("Semua");
            }}
            className="mt-4 text-xs font-semibold text-utama underline underline-offset-4 hover:text-utama-gelap"
          >
            Reset pencarian & filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {produkTersaring.map((produk) => (
            <KartuProduk key={produk.id} produk={produk} />
          ))}
        </div>
      )}
    </div>
  );
}

