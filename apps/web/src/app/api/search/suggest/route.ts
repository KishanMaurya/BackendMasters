import { getSuggestions } from '@/features/search/queries';

const MAX_QUERY_LENGTH = 100;

/** For the search dialog. The browser only ever talks to this site, never directly to the API. */
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim().slice(0, MAX_QUERY_LENGTH) ?? '';
  return Response.json({ suggestions: await getSuggestions(query) });
}
