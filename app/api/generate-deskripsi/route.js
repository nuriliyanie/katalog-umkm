import { NextResponse } from "next/server";
import { generateDeskripsiProduk } from "@/app/admin/actions";

export async function POST(request) {
  try {
    let body = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else if (
      contentType.includes("form-data") ||
      contentType.includes("x-www-form-urlencoded")
    ) {
      const formData = await request.formData();
      body = {
        nama: formData.get("nama"),
        kategori: formData.get("kategori"),
        kataKunci: formData.get("kata_kunci") || formData.get("kataKunci"),
      };
    } else {
      try {
        body = await request.json();
      } catch {
        body = {};
      }
    }

    const nama = body.nama;
    const kategori = body.kategori;
    const kataKunci = body.kataKunci || body.kata_kunci;

    const res = await generateDeskripsiProduk({ nama, kategori, kataKunci });

    if (res?.error) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Gagal membuat deskripsi." },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const nama = searchParams.get("nama");
  const kategori = searchParams.get("kategori");
  const kataKunci =
    searchParams.get("kata_kunci") || searchParams.get("kataKunci");

  const res = await generateDeskripsiProduk({ nama, kategori, kataKunci });

  if (res?.error) {
    return NextResponse.json({ error: res.error }, { status: 400 });
  }

  return NextResponse.json(res);
}
