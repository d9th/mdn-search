import { ZodError } from "https://deno.land/x/zod@v3.23.8/ZodError.ts";
import { getMdnSearchResult } from "./mdn.ts";

const arg = Deno.args;
const searchWord = arg.join(" ");

try {
  const items = await getMdnSearchResult(searchWord);
  console.log(JSON.stringify({ items }));
} catch (error) {
  if (error instanceof ZodError) {
    console.error("ERROR", error.errors);
  } else {
    console.error("ERROR", error.message);
  }
}
