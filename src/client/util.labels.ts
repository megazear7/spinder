import { Label } from "../shared/type.label.js";
import { Transaction } from "../shared/type.transaction.js";

const LABELS_STORAGE_KEY = "spinder_labels";

export function loadLabels(): Label[] {
  try {
    const stored = localStorage.getItem(LABELS_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    // Validate the data
    return parsed.map((label: unknown) => Label.parse(label));
  } catch (error) {
    console.error("Error loading labels:", error);
    return [];
  }
}

export function saveLabels(labels: Label[]): void {
  try {
    localStorage.setItem(LABELS_STORAGE_KEY, JSON.stringify(labels));
  } catch (error) {
    console.error("Error saving labels:", error);
  }
}

export function createLabel(name: string): Label {
  const label = Label.parse({
    id: crypto.randomUUID(),
    name: name.trim(),
  });
  return label;
}

export function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export function addLabelToTransaction(transaction: Transaction, labelId: string): Transaction {
  const labels = transaction.labels || [];
  if (labels.some((label) => label.id === labelId)) {
    return transaction; // Label already exists
  }

  const allLabels = loadLabels();
  const labelToAdd = allLabels.find((label) => label.id === labelId);
  if (!labelToAdd) {
    return transaction; // Label not found
  }

  return {
    ...transaction,
    labels: [...labels, labelToAdd],
  };
}

export function removeLabelFromTransaction(transaction: Transaction, labelId: string): Transaction {
  const labels = transaction.labels || [];
  return {
    ...transaction,
    labels: labels.filter((label) => label.id !== labelId),
  };
}

export function getLabelsForTransaction(transaction: Transaction): Label[] {
  return transaction.labels || [];
}

export function getAvailableLabelsForTransaction(transaction: Transaction): Label[] {
  const allLabels = loadLabels();
  const transactionLabelIds = new Set((transaction.labels || []).map((label) => label.id));
  return allLabels.filter((label) => !transactionLabelIds.has(label.id));
}
