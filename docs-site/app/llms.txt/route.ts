import { renderIndex } from '@/lib/source';

export const revalidate = false;

export async function GET() {
  return new Response(renderIndex(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
