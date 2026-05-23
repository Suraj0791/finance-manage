export async function POST() {
  return new Response("Clerk webhooks are disabled.", { status: 410 });
}
