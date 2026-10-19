"use client";

import { useState, useTransition, useMemo } from "react";
import { formatRupiah } from "@/lib/format";
import Tombol from "@/components/Tombol";
import { hapusProduk } from "@/app/admin/actions";

export default function TabelProduk({ daftarProduk = [] }) {
  const [produkDipilih, setProdukDipilih] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [errorPesan, setErrorPesan] = useState(null);
  const [pencarian, setPencarian] = useState("");
  const [kategoriAktif, setKategoriAktif] = useState("Semua");

  // Ekstrak kategori unik
  const daftarKategori = useMemo(() => {
    const setKat = new Set();
    daftarProduk.forEach((p) => {
      if (p.kategori && p.kategori.trim()) {
        setKat.add(p.kategori.trim());
      }
    });
    return ["Semua", ...Array.from(setKat)];
  }, [daftarProduk]);

  // Saring produk berdasarkan pencarian & kategori
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

  if (!daftarProduk || daftarProduk.length === 0) {
    return (
      <div className="rounded-2xl border border-garis bg-latar p-8 text-center text-sm text-teks-lembut">
        Belum ada produk di database.
      </div>
    );
  }

  const handleKonfirmasiHapus = () => {
    if (!produkDipilih) return;
    setErrorPesan(null);

    startTransition(async () => {
      const res = await hapusProduk(produkDipilih.id);
      if (res?.error) {
        setErrorPesan(res.error);
      } else {
        setProdukDipilih(null);
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Kontrol Pencarian & Filter Kategori di Admin */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <input
            type="text"
            value={pencarian}
            onChange={(e) => setPencarian(e.target.value)}
            placeholder="Cari produk di tabel..."
            className="w-full rounded-xl border border-garis bg-latar px-4 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
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

        {daftarKategori.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {daftarKategori.map((kat) => {
              const isActive = kategoriAktif === kat;
              return (
                <button
                  key={kat}
                  type="button"
                  onClick={() => setKategoriAktif(kat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
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

      <div className="overflow-x-auto rounded-2xl border border-garis">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-permukaan text-teks-lembut">
            <tr>
              <th className="px-4 py-3 font-semibold">Produk</th>
              <th className="px-4 py-3 font-semibold">Kategori</th>
              <th className="px-4 py-3 font-semibold">Harga</th>
              <th className="px-4 py-3 font-semibold">Stok</th>
              <th className="px-4 py-3 font-semibold">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {produkTersaring.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-teks-lembut"
                >
                  Produk yang dicari tidak ditemukan.
                </td>
              </tr>
            ) : (
              produkTersaring.map((produk) => (
                <tr key={produk.id} className="border-t border-garis">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {produk.foto_url ? (
                        <img
                          src={produk.foto_url}
                          alt={produk.nama || ""}
                          className="h-10 w-10 rounded-md object-cover bg-permukaan"
                        />
                      ) : null}
                      <span className="font-semibold">{produk.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-teks-lembut">
                    {produk.kategori || "-"}
                  </td>
                  <td className="px-4 py-3">{formatRupiah(produk.harga)}</td>
                  <td className="px-4 py-3 text-teks-lembut">
                    {produk.stok ?? "Tersedia"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Tombol
                        href={`/admin/produk/${produk.id}/ubah`}
                        varian="garis"
                      >
                        Ubah
                      </Tombol>
                      <Tombol
                        type="button"
                        varian="bahaya"
                        onClick={() => {
                          setErrorPesan(null);
                          setProdukDipilih(produk);
                        }}
                      >
                        Hapus
                      </Tombol>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Konfirmasi Hapus Produk */}
      {produkDipilih && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-judul"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-garis bg-latar p-6 shadow-xl">
            <div>
              <h2 id="modal-judul" className="text-xl font-bold text-teks">
                Hapus produk
              </h2>
              <p className="mt-2 text-sm text-teks-lembut leading-relaxed">
                Apakah Anda yakin ingin menghapus{" "}
                <span className="font-semibold text-teks">
                  {produkDipilih.nama}
                </span>
                ? Tindakan ini tidak dapat dibatalkan dan produk akan dihapus
                permanen dari database.
              </p>
            </div>

            {errorPesan && (
              <div className="rounded-lg border border-garis bg-permukaan p-3 text-sm text-bahaya">
                {errorPesan}
              </div>
            )}

            <div className="mt-2 flex justify-end gap-3">
              <Tombol
                type="button"
                varian="garis"
                disabled={isPending}
                onClick={() => {
                  setErrorPesan(null);
                  setProdukDipilih(null);
                }}
              >
                Batal
              </Tombol>
              <Tombol
                type="button"
                varian="bahaya"
                disabled={isPending}
                onClick={handleKonfirmasiHapus}
              >
                {isPending ? "Menghapus..." : "Ya, hapus"}
              </Tombol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
