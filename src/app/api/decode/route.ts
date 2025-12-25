import Jimp from 'jimp';
import jsQR from 'jsqr';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Parse the multipart form data 📥
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No image provided" }, 
        { status: 400 }
      );
    }

    // 2. Convert File to Buffer 🔄
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Read and preprocess image with Jimp 🖼️
    const image = await Jimp.read(buffer);

    // Only preprocess if the image is small enough to avoid performance issues
    if (image.bitmap.width < 1000 && image.bitmap.height < 1000) {
      // Preprocess the image to improve QR code detection for small or low-contrast codes
      image.resize(image.bitmap.width * 2, image.bitmap.height * 2, Jimp.RESIZE_BEZIER)
           .greyscale()
           .contrast(0.2);
    }

    const { data, width, height } = image.bitmap;

    // 4. Decode the QR Code 🔍
    const code = jsQR(new Uint8ClampedArray(data), width, height);

    if (code) {
      return NextResponse.json({ 
        success: true,
        data: code.data 
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: "No QR code found in image" 
        }, 
        { status: 404 }
      );
    }

  } catch (error) {
    console.error("QR Decoding Error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

