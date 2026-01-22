import { App } from "@/app/api/[[...slugs]]/route";
import { treaty } from "@elysiajs/eden";

export const client = treaty<App>("noira.vercel.app").api;
