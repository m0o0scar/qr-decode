import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { readBarcodes } from 'zxing-wasm/reader';

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
    const fileBuffer = Buffer.from(bytes);

    // 3. Pre-process the image for better recognition 🛠️
    // Rotate based on metadata, resize to 1000px, and convert to grayscale
    const { data, info } = await sharp(fileBuffer)
      .rotate()
      .resize(1000)
      .grayscale()
      .threshold(128)
      .toBuffer({ resolveWithObject: true });

    console.log(
      `🧪 Image optimized to ${info.width}x${info.height}. Decoding...`
    );

    // 4. Decode the QR Code 🔍
    const results = await readBarcodes(data, {
      formats: ['QRCode'],
      tryHarder: true, // Spend more CPU cycles to find distorted QR codes
      maxNumberOfSymbols: 1,
    });

    if (results.length > 0) {
      console.log('✅ QR Code decoded successfully!');
      return NextResponse.json({ 
        success: true,
        data: results[0].text 
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: "No QR code found in image. Try a clearer image or different lighting." 
        }, 
        { status: 404 }
      );
    }

  } catch (error) {
    console.error("🛑 QR Decoding Error:", error);
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

