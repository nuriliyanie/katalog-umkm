import { notFound, redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { ubahProduk } from "@/app/admin/actions";
import { createSessionClient, createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;

  // Validasi sesi/token di sisi server
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Ambil data produk lama langsung dari Supabase
  let produk = null;
  try {
    let res = await supabase
      .from("produk")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (res.error) {
      const serverSupabase = createServerClient();
      res = await serverSupabase
        .from("produk")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    }

    if (!res.error && res.data) {
      produk = res.data;
    }
  } catch {
    // Abaikan jika koneksi gagal
  }

  if (!produk) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      <FormProduk
        produk={produk}
        labelTombol="Simpan perubahan"
        action={ubahProduk}
      />
    </div>
  );
}
