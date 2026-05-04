import { api } from "@/lib/api";

export const getExecutiveStats = () =>
  api("/odata/v4/executive/getExecutiveStats()");