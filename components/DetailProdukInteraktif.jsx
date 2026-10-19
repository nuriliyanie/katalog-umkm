"use client";

import { useState, useMemo } from "react";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";
import Tombol from "@/components/Tombol";

export default function DetailProdukInteraktif({ produk }) {
  // Buat opsi varian dinamis berdasarkan kategori/produk
  const daftarVarian = useMemo(() => {
    const baseHarga = Number(produk.harga) || 0;
    const baseStok = Number(produk.stok) || 15;
    const kategori = (produk.kategori || "").toLowerCase();

    if (kategori.includes("kain") || kategori.includes("kerajinan")) {
      return [
        {
          id: "standar",
          nama: "Ukuran Standar",
          harga: baseHarga,
          stok: baseStok,
        },
        {
          id: "besar",
          nama: "Ukuran Besar",
          harga: baseHarga + 25000,
          stok: Math.max(3, Math.floor(baseStok / 2)),
        },
        {
          id: "premium",
          nama: "Warna Khusus / Eksklusif",
          harga: baseHarga + 40000,
          stok: 5,
        },
      ];
    }

    if (kategori.includes("bumbu") || kategori.includes("minuman")) {
      return [
        {
          id: "standar",
          nama: "Ukuran Reguler",
          harga: baseHarga,
          stok: baseStok,
        },
        {
          id: "jumbo",
          nama: "Ukuran Jumbo (+Rp 15.000)",
          harga: baseHarga + 15000,
          stok: Math.max(2, Math.floor(baseStok / 2)),
        },
      ];
    }

    return [
      {
        id: "standar",
        nama: "Varian Reguler",
        harga: baseHarga,
        stok: baseStok,
      },
      {
        id: "spesial",
        nama: "Varian Spesial (+Rp 10.000)",
        harga: baseHarga + 10000,
        stok: Math.max(3, Math.floor(baseStok / 2)),
      },
      {
        id: "hampers",
        nama: "Kemasan Hadiah / Box",
        harga: baseHarga + 25000,
        stok: 6,
      },
    ];
  }, [produk]);

  const [varianTerpilih, setVarianTerpilih] = useState(daftarVarian[0]);
  const [kuantitas, setKuantitas] = useState(1);
  const [notifikasiKeranjang, setNotifikasiKeranjang] = useState(null);
  const [totalKeranjang, setTotalKeranjang] = useState(0);

  // Sesuaikan kuantitas jika stok varian berubah
  const handlePilihVarian = (varian) => {
    setVarianTerpilih(varian);
    if (kuantitas > varian.stok) {
      setKuantitas(Math.max(1, varian.stok));
    }
  };

  const handleKurangKuantitas = () => {
    setKuantitas((prev) => Math.max(1, prev - 1));
  };

  const handleTambahKuantitas = () => {
    setKuantitas((prev) => Math.min(varianTerpilih.stok, prev + 1));
  };

  const totalHarga = varianTerpilih.harga * kuantitas;

  // Format pesan WhatsApp lengkap dengan varian dan kuantitas (US-12)
  const pesanWhatsApp = `Halo ${toko.nama}, saya ingin memesan:
- Produk: ${produk.nama}
- Varian: ${varianTerpilih.nama}
- Jumlah: ${kuantitas} pcs
- Total: ${formatRupiah(totalHarga)}`;

  const urlWhatsApp = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(
    pesanWhatsApp
  )}`;

  const handleTambahKeranjang = () => {
    setTotalKeranjang((prev) => prev + kuantitas);
    setNotifikasiKeranjang(
      `${kuantitas}x ${produk.nama} (${varianTerpilih.nama}) berhasil ditambahkan ke keranjang!`
    );
    setTimeout(() => {
      setNotifikasiKeranjang(null);
    }, 4000);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-teks-lembut">{produk.kategori}</p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight tracking-tight">
          {produk.nama}
        </h1>
      </div>

      {/* Harga Satuan & Subtotal */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="rounded-md bg-harga-latar px-3 py-1 text-2xl font-bold text-harga">
          {formatRupiah(varianTerpilih.harga)}
        </span>
        {kuantitas > 1 && (
          <span className="text-sm text-teks-lembut">
            Subtotal:{" "}
            <span className="font-semibold text-teks">
              {formatRupiah(totalHarga)}
            </span>{" "}
            ({kuantitas} pcs)
          </span>
        )}
      </div>

      <p className="max-w-prose leading-relaxed text-teks-lembut">
        {produk.deskripsi}
      </p>

      {/* Pemilih Varian */}
      <div className="flex flex-col gap-2 pt-2 border-t border-garis">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-teks">Pilih Varian:</label>
          <span className="text-xs text-teks-lembut">
            Stok varian:{" "}
            <span
              className={`font-semibold ${
                varianTerpilih.stok > 0 ? "text-utama" : "text-bahaya"
              }`}
            >
              {varianTerpilih.stok > 0
                ? `${varianTerpilih.stok} tersedia`
                : "Habis"}
            </span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {daftarVarian.map((v) => {
            const isSelected = varianTerpilih.id === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => handlePilihVarian(v)}
                className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? "border-utama bg-utama/10 text-utama shadow-xs"
                    : "border-garis bg-latar text-teks hover:border-teks-lembut"
                }`}
              >
                <div>{v.nama}</div>
                <div className="mt-0.5 text-[11px] opacity-80">
                  {formatRupiah(v.harga)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pengatur Kuantitas (Jumlah) */}
      <div className="flex flex-col gap-2 pt-2 border-t border-garis">
        <label className="text-sm font-bold text-teks">Jumlah Kuantitas:</label>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-garis bg-latar">
            <button
              type="button"
              onClick={handleKurangKuantitas}
              disabled={kuantitas <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-l-xl text-lg font-bold text-teks hover:bg-permukaan disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Kurangi kuantitas"
            >
              -
            </button>
            <span className="w-12 text-center text-sm font-bold text-teks">
              {kuantitas}
            </span>
            <button
              type="button"
              onClick={handleTambahKuantitas}
              disabled={kuantitas >= varianTerpilih.stok}
              className="flex h-10 w-10 items-center justify-center rounded-r-xl text-lg font-bold text-teks hover:bg-permukaan disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Tambah kuantitas"
            >
              +
            </button>
          </div>
          <span className="text-xs text-teks-lembut">
            Maks. {varianTerpilih.stok} pcs
          </span>
        </div>
      </div>

      {/* Notifikasi Tambah Keranjang */}
      {notifikasiKeranjang && (
        <div className="rounded-xl border border-garis bg-permukaan p-3 text-sm text-utama font-medium flex items-center justify-between">
          <span>{notifikasiKeranjang}</span>
          <span className="text-xs bg-utama text-white px-2 py-0.5 rounded-full font-bold">
            Keranjang: {totalKeranjang}
          </span>
        </div>
      )}

      {/* Aksi: Pesan via WhatsApp & Tambah ke Keranjang */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={handleTambahKeranjang}
          disabled={varianTerpilih.stok <= 0}
          className="inline-flex flex-1 items-center justify-center rounded-lg border border-utama bg-latar px-5 py-3 font-semibold text-utama hover:bg-utama/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Tambah ke Keranjang
        </button>

        <a
          href={urlWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap disabled:opacity-50 transition-colors"
        >
          Pesan via WhatsApp
        </a>
      </div>
    </div>
  );
}

