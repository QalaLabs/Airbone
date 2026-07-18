import { type NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Missing key parameter" }, { status: 400 });
    }

    // Sanitize key path
    const sanitizedKey = key.replace(/\.\./g, "");
    
    // Resolve absolute path in public directory
    const publicDir = path.join(process.cwd(), "public");
    const mockDir = path.join(publicDir, "_mock");
    const filePath = path.join(mockDir, sanitizedKey);
    const fileDir = path.dirname(filePath);

    // Ensure target directory exists
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    // Read request body as arrayBuffer and write to file
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync(filePath, buffer);

    console.log(`[Upload Mock] Successfully saved file to: ${filePath}`);

    return NextResponse.json({ success: true, key: sanitizedKey });
  } catch (err: any) {
    console.error("[Upload Mock Error]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
