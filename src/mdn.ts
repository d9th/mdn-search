import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const API_URL = "https://developer.mozilla.org/api/v1/search";
const DOC_BASE_URL = "https://developer.mozilla.org";
const LOCALE = "en-US";

const highlightSchema = z.object({
  body: z.array(z.string()),
  title: z.array(z.string()),
});
const itemSchema = z.object({
  mdn_url: z.string(),
  score: z.number(),
  title: z.string(),
  locale: z.string(),
  slug: z.string(),
  popularity: z.number(),
  summary: z.string(),
  highlight: highlightSchema,
});
const searchResultsSchema = z.object({
  documents: z.array(itemSchema),
});

type searchResults = z.infer<typeof searchResultsSchema>;
type Item = z.infer<typeof itemSchema>;
type Highlight = z.infer<typeof highlightSchema>;
type Result = ReturnType<typeof formatForAlfred>;

async function getMdnSearchResult(searchWord: string): Promise<Result[]> {
  const res = await fetchMDN(searchWord);
  const documents = extractDocs(res);
  const items = documents.map((doc) => formatForAlfred(doc));
  return items;
}

async function fetchMDN(
  query: string,
  locale: string = LOCALE,
): Promise<searchResults> {
  const res = await fetch(buildSearchURL(query, locale));
  if (!res.ok) {
    throw new Error(
      `${res.status}:${res.statusText} Failed to fetch data from MDN API.`,
    );
  }
  const json = await res.json();
  const searchResults = searchResultsSchema.parse(json);
  return searchResults;
}

function extractDocs(data: searchResults) {
  const { documents } = data;
  return documents;
}

function buildSearchURL(
  query: string,
  locale: string,
  apiEndpoint: string = API_URL,
) {
  const url = new URL(apiEndpoint);
  url.searchParams.set("q", query);
  url.searchParams.set("locale", locale);
  url.searchParams.set("sort", "best");
  return url;
}

function buildArticleURL(articlePath: string, baseURL: string = DOC_BASE_URL) {
  const articleURL = new URL(baseURL);
  articleURL.pathname = articlePath;
  return articleURL.href;
}

function formatForAlfred(item: Item, baseURL: string = DOC_BASE_URL) {
  const { title, summary, mdn_url } = item;
  const articleURL = buildArticleURL(mdn_url, baseURL);
  const subtitle = summary.trim();
  return {
    title,
    arg: articleURL,
    subtitle,
    quicklookurl: articleURL,
    text: {
      copy: articleURL,
      largetype: subtitle,
    },
    type: "default",
  };
}

export { getMdnSearchResult };
