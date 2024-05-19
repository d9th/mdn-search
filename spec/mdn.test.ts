import { assertEquals, assertRejects } from "@std/assert";

import { ZodError } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { getMdnSearchResult } from "../src/mdn.ts";
import { stub } from "@std/testing/mock";

Deno.test("getMdnSearchResultはfetchに失敗した時に例外を投げる事", async () => {
  const mockFetch = stub(globalThis, "fetch", () => {
    const response = new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
    return Promise.resolve(response);
  });
  try {
    await assertRejects(
      () => getMdnSearchResult("deno"),
      Error,
      "500:Internal Server Error Failed to fetch data from MDN API.",
    );
  } finally {
    mockFetch.restore();
  }
});

Deno.test("getMdnSearchResultはfetchに成功した時にitemsを返す事", async () => {
  const mockFetch = stub(globalThis, "fetch", () => {
    const response = new Response(
      JSON.stringify({
        documents: [
          {
            mdn_url: "/ja/docs/Web/JavaScript/Reference/Global_Objects/Array",
            score: 1,
            title: "Array",
            locale: "ja",
            slug: "Array",
            popularity: 100,
            summary:
              "Array は、プリミティブ型の有限個の順序付けられた値の集合であり、0 から始まる 0 基底のインデックスでアクセスできます。",
            highlight: {
              body: [
                "Array は、プリミティブ型の有限個の順序付けられた値の集合であり、0 から始まる 0 基底のインデックスでアクセスできます。",
              ],
              title: [
                "Array",
              ],
            },
          },
        ],
      }),
      {
        status: 200,
        statusText: "OK",
      },
    );
    return Promise.resolve(response);
  });
  const expect = [{
    title: "Array",
    subtitle:
      "Array は、プリミティブ型の有限個の順序付けられた値の集合であり、0 から始まる 0 基底のインデックスでアクセスできます。",
    arg:
      "https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array",
    quicklookurl:
      "https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array",
    text: {
      copy:
        "https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array",
      largetype:
        "Array は、プリミティブ型の有限個の順序付けられた値の集合であり、0 から始まる 0 基底のインデックスでアクセスできます。",
    },
    type: "default",
  }];
  try {
    const result = await getMdnSearchResult("Array");
    assertEquals(result, expect);
  } finally {
    mockFetch.restore();
  }
});

Deno.test("getMdnSearchResultは戻り値がschemaと一致しない時は例外を投げる事", async () => {
  const mockFetch = stub(globalThis, "fetch", () => {
    const response = new Response(
      JSON.stringify({
        documents: [
          {
            mdn_url: 99, // 本来はstring
            score: 1,
            title: "Array",
            locale: "ja",
            slug: "Array",
            popularity: 100,
            summary:
              "Array は、プリミティブ型の有限個の順序付けられた値の集合であり、0 から始まる 0 基底のインデックスでアクセスできます。",
            highlight: {
              body: [
                "Array は、プリミティブ型の有限個の順序付けられた値の集合であり、0 から始まる 0 基底のインデックスでアクセスできます。",
              ],
              title: [
                "Array",
              ],
            },
          },
        ],
      }),
      {
        status: 200,
        statusText: "OK",
      },
    );
    return Promise.resolve(response);
  });

  try {
    await assertRejects(() => getMdnSearchResult("Array"), ZodError);
  } finally {
    mockFetch.restore();
  }
});
