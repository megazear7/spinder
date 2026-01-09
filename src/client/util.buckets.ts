import { Bucket } from "../shared/type.bucket.js";

export const saveBuckets = (buckets: Bucket[]): void => {
  localStorage.setItem("buckets", JSON.stringify(buckets));
};

export const loadBuckets = (): Bucket[] => {
  const data = localStorage.getItem("buckets");
  if (data) {
    return JSON.parse(data);
  }
  return [];
};
