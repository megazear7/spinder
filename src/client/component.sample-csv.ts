import { css, html, TemplateResult } from "lit";
import { customElement, query } from "lit/decorators.js";
import { SpinderAppProvider } from "./provider.app.js";
import { globalStyles } from "./styles.global.js";
import { loadTransactions, parseTransaction, addTransactions, saveTransactions } from "./util.transaction.js";
import { saveBuckets } from "./util.buckets.js";
import { UpdateTransactionsEvent } from "./event.update-transactions.js";
import { Transaction } from "../shared/type.transaction.js";
import { Bucket } from "../shared/type.bucket.js";
import "./component.modal.js";
import { SpinderModal } from "./component.modal.js";

@customElement("spinder-sample-csv")
export class SpinderSampleCsv extends SpinderAppProvider {
  static override styles = [
    globalStyles,
    css`
      .btn {
        padding: var(--size-medium) var(--size-large);
        border: none;
        border-radius: var(--border-radius-medium);
        font-size: var(--font-medium);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: var(--transition-all);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--size-small);
      }

      .btn-primary {
        background: var(--color-accent);
        color: var(--color-white);
      }

      .btn-primary:hover {
        background: var(--color-accent-dark);
      }

      .btn-secondary {
        background: var(--color-primary-surface);
        color: var(--color-primary-text);
        border: 1px solid var(--color-overlay-strong);
      }

      .btn-secondary:hover {
        background: var(--color-overlay-light);
      }
    `,
  ];

  @query("spinder-modal") modal!: SpinderModal;

  override render(): TemplateResult {
    return html`
      <div style="margin-top: var(--size-xl); text-align: center;">
        <button class="btn btn-primary" @click=${this.handleLoadSampleData}>Load Sample Data</button>
        <p
          style="margin-top: var(--size-medium); font-size: var(--font-small); color: var(--color-primary-text-muted);"
        >
          Try Spinder with sample knight expenses for slaying a dragon
        </p>
      </div>
      <spinder-modal>
        <div slot="body" class="modal-body">
          <div style="text-align: center; padding: var(--size-large) 0;">
            <h3 style="color: var(--color-primary-text); margin-bottom: var(--size-large);">Load Sample Data?</h3>
            <p style="color: var(--color-primary-text); margin-bottom: var(--size-large);">
              You already have transaction data loaded. Loading sample data will add the sample transactions to your
              existing data.
            </p>
            <div style="display: flex; gap: var(--size-medium); justify-content: center;">
              <button class="btn btn-secondary" @click=${() => this.modal.close()}>Cancel</button>
              <button class="btn btn-primary" @click=${this.handleConfirmLoadSample}>Load Sample Data</button>
            </div>
          </div>
        </div>
      </spinder-modal>
    `;
  }

  private async handleLoadSampleData(): Promise<void> {
    const currentTransactions = loadTransactions();

    if (currentTransactions.length > 0) {
      // Show confirmation dialog
      this.showConfirmationDialog();
    } else {
      // Load sample data directly
      await this.loadSampleData();
    }
  }

  private showConfirmationDialog(): void {
    this.modal.open();
  }

  private async handleConfirmLoadSample(): Promise<void> {
    this.modal.close();
    await this.loadSampleData();
  }

  private async loadSampleData(): Promise<void> {
    try {
      // Fetch the example.csv file
      const response = await fetch("/example.csv");
      if (!response.ok) {
        throw new Error("Failed to load sample data");
      }

      const csv = await response.text();

      // Parse the sample transactions
      const sampleTransactions = parseTransaction(csv);

      // Distribute transactions across recent days (5-15 per day)
      const updatedTransactions = this.distributeTransactionsAcrossDays(sampleTransactions);

      // Add to existing transactions and save
      const currentTransactions = loadTransactions();
      const allTransactions = addTransactions(currentTransactions, updatedTransactions);
      saveTransactions(allTransactions);

      // Load example buckets
      const exampleBuckets: Bucket[] = [
        { name: "Dragon", filterTexts: ["dragon", "Dragon"] },
        { name: "Prize", filterTexts: ["prize", "tournament", "Prize"] },
        { name: "Zombie", filterTexts: ["zombie", "Zombie"] },
      ];

      // Save buckets
      saveBuckets(exampleBuckets);

      // Update the transaction context
      this.dispatchEvent(new UpdateTransactionsEvent({ transactions: allTransactions }));

      // Navigate back to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Error loading sample data:", error);
      alert("Failed to load sample data. Please try again.");
    }
  }

  private distributeTransactionsAcrossDays(transactions: Transaction[]): Transaction[] {
    const today = new Date();
    const totalTransactions = transactions.length;
    const minPerDay = 5;
    const maxPerDay = 15;

    // Calculate how many days we need
    const avgPerDay = (minPerDay + maxPerDay) / 2;
    const estimatedDays = Math.ceil(totalTransactions / avgPerDay);

    // Create date distribution
    const dayCounts: { [key: string]: number } = {};
    const distributedTransactions: Transaction[] = [];

    // Distribute transactions randomly across days
    for (let i = 0; i < totalTransactions; i++) {
      const daysBack = Math.floor(Math.random() * estimatedDays);
      const transactionDate = new Date(today);
      transactionDate.setDate(today.getDate() - daysBack);

      const dateKey = transactionDate.toISOString().split("T")[0];

      // Ensure we don't exceed max per day
      if (!dayCounts[dateKey]) {
        dayCounts[dateKey] = 0;
      }

      if (dayCounts[dateKey] >= maxPerDay) {
        // Try next day
        i--;
        continue;
      }

      dayCounts[dateKey]++;

      // Update transaction with new date
      const updatedTransaction = {
        ...transactions[i],
        postingDate: dateKey,
      };

      distributedTransactions.push(updatedTransaction);
    }

    // Sort by date to maintain chronological order
    return distributedTransactions.sort(
      (a, b) => new Date(a.postingDate).getTime() - new Date(b.postingDate).getTime(),
    );
  }
}