import Link from "next/link";
import { notFound } from "next/navigation";
import DetailProdukInteraktif from "@/components/DetailProdukInteraktif";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;

  let produk = null;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      produk = data;
    }
  } catch (err) {
    // Supabase query failure
  }

  if (!produk) {
    notFound();
  }

  return (
    <article className="grid gap-8 py-8 md:grid-cols-2 md:py-12">
      <img
        src={produk.foto_url}
        alt={produk.nama}
        className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover"
      />
      <div className="flex flex-col gap-4">
        <Link
          href="/"
          className="self-start text-sm text-teks-lembut underline underline-offset-4 hover:text-utama"
        >
          Kembali ke katalog
        </Link>
        <DetailProdukInteraktif produk={produk} />
      </div>
    </article>
  );
}
