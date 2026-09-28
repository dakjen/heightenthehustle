import { resourceCategoryEnum } from "@/db/schema";

/** Categories a resource can live under (mirrors the DB enum). */
export const RESOURCE_CATEGORIES = resourceCategoryEnum.enumValues;
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];
