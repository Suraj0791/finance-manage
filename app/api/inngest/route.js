// Inngest endpoint is deprecated. Standard serverless cron routing is handled in app/api/cron/route.js
export async function GET() {
  return new Response("Inngest endpoint is disabled.", { status: 410 });
}

export async function POST() {
  return new Response("Inngest endpoint is disabled.", { status: 410 });
}
export async function PUT() {
  return new Response("Inngest endpoint is disabled.", { status: 410 });
}