/*
23 -> $23.00
-23 -> $23.00
2345.5 -> $2,345.50
-2345.5 -> $2,345.50
1000000 -> $1,000,000.00
-1000000 -> $1,000,000.00
1.324234234 -> $1.32
-1.324234234 -> $1.32
1.87232434 -> $1.87
-1.87232434 -> $1.87
0 -> $0.00
-0 -> $0.00
*/
export const formatCurrency = (num: number): string => {
  const val = Math.abs(num).toFixed(2);
  const [integer, decimal] = val.split(".");
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${formattedInteger}.${decimal}`;
};
