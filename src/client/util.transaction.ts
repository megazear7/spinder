import { Transaction } from "../shared/type.transaction.js";

export function searchTransactions(transactions: Transaction[], query: string): Transaction[] {
  const lowerQuery = query.toLowerCase();
  return transactions.filter((transaction) =>
    Object.values(transaction).some((value) => value?.toString().toLowerCase().includes(lowerQuery)),
  );
}

export function parseTransaction(csv: string): Transaction[] {
  const rows = csv.split("\n").slice(1);
  const transactions: Transaction[] = [];

  for (const row of rows) {
    if (!row.trim()) continue; // Skip empty rows

    const values = row.split(",").map((v) => v.trim());
    try {
      const transaction = Transaction.parse({
        details: values[0] || "",
        postingDate: values[1] || "",
        description: values[2] || "",
        amount: parseFloat(values[3]) || 0,
        type: values[4] || "",
        balance: values[5] || undefined,
        checkOrSlipNumber: values[6] || undefined,
      });
      transactions.push(transaction);
    } catch (error) {
      console.error(`Error parsing row: ${row}`, error);
      console.error("Parsed values:", values);
      throw error; // Re-throw to let caller handle
    }
  }

  return transactions;
}

export function saveTransactions(transactions: Transaction[]): void {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

export function loadTransactions(): Transaction[] {
  const data = localStorage.getItem("transactions");
  if (data) {
    const parsed = JSON.parse(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return parsed.map((item: any) => Transaction.parse(item));
  }
  return [];
}

export function addTransactions(currentTransactions: Transaction[], newTransactions: Transaction[]): Transaction[] {
  // Create a copy of current transactions to modify
  const updatedTransactions = [...currentTransactions];
  const transactionsToAdd: Transaction[] = [];

  for (const newTx of newTransactions) {
    // Find if this transaction already exists
    const existingIndex = updatedTransactions.findIndex(
      (t) => t.description === newTx.description && t.amount === newTx.amount && t.postingDate === newTx.postingDate,
    );

    if (existingIndex !== -1) {
      // Transaction exists, check if we need to update balance
      const existingTx = updatedTransactions[existingIndex];
      if ((!existingTx.balance || existingTx.balance.trim() === "") && newTx.balance && newTx.balance.trim() !== "") {
        // Update the existing transaction with the balance from the new transaction
        updatedTransactions[existingIndex] = { ...existingTx, balance: newTx.balance };
        console.log("Updated existing transaction with balance:", existingTx.description, "Balance:", newTx.balance);
      }
      // If balance already exists or new transaction has no balance, do nothing
    } else {
      // Transaction doesn't exist, add it
      transactionsToAdd.push(newTx);
      console.log("Adding new transaction:", newTx);
    }
  }

  return [...updatedTransactions, ...transactionsToAdd];
}
