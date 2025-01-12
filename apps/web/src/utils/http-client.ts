import { hcWithType } from "@woben/server/hc";

export const apiClient = hcWithType(import.meta.env.PUBLIC_API_URL);
