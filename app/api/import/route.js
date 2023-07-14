import fs from "fs/promises"
import { NextResponse } from 'next/server'

export async function GET(request) {
  const deps = await fs.readFile("pdf.json", {
    encoding: "utf8",
  });

  return NextResponse.json({
    status: "OK",
    deps: deps
  });
}
