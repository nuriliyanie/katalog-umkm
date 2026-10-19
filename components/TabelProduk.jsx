"use client";

import { useState, useTransition } from "react";
import { formatRupiah } from "@/lib/format";
import Tombol from "@/components/Tombol";
import { hapusProduk } from "@/app/admin/actions";

export default function TabelProduk({ daftarProduk }) {
  const [produkDipilih, setProdukDipilih] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [errorPesan, setErrorPesan] = useState(null);

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
    <>
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
            {daftarProduk.map((produk) => (
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
                <td className="px-4 py-3 text-teks-lembut">{produk.kategori || "-"}</td>
                <td className="px-4 py-3">{formatRupiah(produk.harga)}</td>
                <td className="px-4 py-3 text-teks-lembut">{produk.stok ?? "Tersedia"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Tombol href={`/admin/produk/${produk.id}/ubah`} varian="garis">
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
            ))}
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
                <span className="font-semibold text-teks">{produkDipilih.nama}</span>?
                Tindakan ini tidak dapat dibatalkan dan produk akan dihapus permanen dari
                database.
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
    </>
  );
}
