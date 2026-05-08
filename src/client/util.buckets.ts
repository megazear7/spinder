import { Bucket } from "../shared/type.bucket.js";

export const saveBuckets = (buckets: Bucket[]): void => {
  localStorage.setItem("buckets", JSON.stringify(buckets));
};

export const loadBuckets = (): Bucket[] => {
  const data = localStorage.getItem("buckets");
  if (data) {
    try {
      const parsed = JSON.parse(data);
      return Bucket.array().parse(parsed);
    } catch {
      return [];
    }
  }
  return [];
};
