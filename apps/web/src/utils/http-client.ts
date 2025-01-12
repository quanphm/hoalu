import { hc } from "@woben/server/hc";

export const apiClient = hc(import.meta.env.PUBLIC_API_URL);
