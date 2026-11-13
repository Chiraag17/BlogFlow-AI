import { NextResponse } from "next/server";

export async function GET() {
  const googleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
  const githubConfigured = Boolean(
    process.env.GITHUB_ID && process.env.GITHUB_SECRET
  );

  return NextResponse.json({
    google: googleConfigured,
    github: githubConfigured,
  });
}
