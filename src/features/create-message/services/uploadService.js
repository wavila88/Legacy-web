/**
 * Uploads a file to storage.
 * Replace this mock with a real upload to S3 / Cloudflare R2 / Supabase in production.
 */
export async function uploadFile(file) {
  await new Promise((r) => setTimeout(r, 800));
  return `https://storage.legado.app/uploads/${Date.now()}-${file.name}`;
}
