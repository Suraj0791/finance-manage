import { seedTransactions } from "@/actions/seed";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const srcPath = "C:\\Users\\suraj sharma\\.gemini\\antigravity-ide\\brain\\fdd96bd3-55ab-48c7-85ac-cbc3decdd8da\\sample_receipt_1779610405716.png";
    const destPath = path.join(process.cwd(), "public", "sample-receipt.png");
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log("Sample receipt successfully copied to public/sample-receipt.png");
    } else {
      console.warn("Source path for sample receipt not found:", srcPath);
    }
  } catch (err) {
    console.error("Error copying sample receipt:", err);
  }

  const result = await seedTransactions();
  return Response.json(result);
}