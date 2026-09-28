import { renderFull } from '@/lib/source';

export const revalidate = false;

export async function GET() {
  return new Response(await renderFull(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
