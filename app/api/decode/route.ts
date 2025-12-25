import { NextResponse } from 'next/server';
import jimp from 'jimp';
import jsQR from 'jsqr';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    // 1. Parse the multipart form data 📥
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Validate that the 'image' is a File object
    if (!(file instanceof File)) {
        return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `Image size exceeds the limit of ${MAX_FILE_SIZE / 1024 / 1024}MB` }, { status: 413 });
    }


    // 2. Convert File to Buffer 🔄
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Read image with Jimp to get pixel data 🖼️
    const image = await jimp.read(buffer);
    const { data, width, height } = image.bitmap;

    // 4. Decode the QR Code 🔍
    const code = jsQR(new Uint8ClampedArray(data), width, height);

    if (code) {
      return NextResponse.json({ text: code.data });
    } else {
      return NextResponse.json({ error: "No QR code found in image" }, { status: 404 });
    }
  } catch (error) {
    console.error("QR Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
