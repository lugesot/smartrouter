import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Serve the diagram as its own document so global site styles do not alter it.
export const dynamic = 'force-static';

export async function GET() {
  const html = await readFile(join(process.cwd(), 'public', 'dataflow.html'), 'utf8');

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
