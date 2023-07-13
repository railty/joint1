import fs from "fs/promises"
import { NextResponse } from 'next/server'

export async function GET(request) {
  const strGraph = await fs.readFile("graph.json", {
    encoding: "utf8",
  });

  return NextResponse.json({
    status: "OK",
    graph: strGraph
  });
}
