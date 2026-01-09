import { html, css, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { consume } from "@lit/context";
import { globalStyles } from "./styles.global.js";
import {
  TransactionContext,
  transactionContext,
  BucketFilterContext,
  bucketFilterContext,
  TimeFilterContext,
  timeFilterContext,
} from "./context.js";
import { Transaction } from "../shared/type.transaction.js";
import { searchTransactions } from "./util.transaction.js";
import { UpdateBucketFilterEvent } from "./event.update-bucket-filter.js";
import { formatCurrency } from "../shared/util.math.js";

@customElement("spinder-pagination-table")
export class SpinderPaginationTable extends LitElement {
  static override styles = [
    globalStyles,
    css`
      .container {
        margin: var(--size-large) 0 var(--size-3x) 0;
      }

      .search-container {
        display: flex;
        gap: var(--size-large);
        align-items: center;
        margin-bottom: var(--size-xl);
        padding: var(--size-large);
        background: var(--color-overlay-light);
        border-radius: var(--border-radius-medium);
        border: 1px solid var(--color-overlay-strong);
      }

      .search-input {
        flex: 1;
        padding: var(--size-medium) var(--size-large);
        border: var(--border-normal);
        border-radius: var(--border-radius-medium);
        background: var(--color-primary-surface);
        color: var(--color-primary-text);
        font-size: var(--font-small);
        transition: var(--transition-all);
      }

      .search-input:focus {
        outline: none;
        border: var(--border-active);
      }

      .search-input::placeholder {
        color: var(--color-primary-text-muted);
      }

      .summary {
        font-size: var(--font-medium);
        font-weight: var(--font-weight-bold);
        color: var(--color-accent);
        background: var(--color-accent-light);
        padding: var(--size-medium) var(--size-large);
        border-radius: var(--border-radius-medium);
        border: 1px solid var(--color-accent-strong);
      }

      .summary.spend {
        color: var(--color-error);
        background: rgba(255, 33, 33, 0.1);
        border-color: rgba(255, 33, 33, 0.3);
      }

      .summary.income {
        color: var(--color-success);
        background: rgba(56, 173, 56, 0.1);
        border-color: rgba(56, 173, 56, 0.3);
      }

      .filter-indicator {
        display: flex;
        align-items: center;
        gap: var(--size-small);
        font-size: var(--font-small);
        color: var(--color-accent);
        background: rgba(57, 167, 232, 0.1);
        padding: var(--size-small) var(--size-medium);
        border-radius: var(--border-radius-medium);
        border: 1px solid rgba(57, 167, 232, 0.3);
      }

      .clear-filter-btn {
        background: none;
        border: none;
        color: var(--color-accent);
        cursor: pointer;
        padding: var(--size-tiny);
        border-radius: 50%;
        transition: var(--transition-all);
        font-size: var(--font-small);
      }

      .clear-filter-btn:hover {
        background: var(--color-accent);
        color: var(--color-white);
      }

      .table-container {
        overflow-x: auto;
        border-radius: var(--border-radius-medium);
        box-shadow: var(--shadow-normal);
        border: 1px solid var(--color-overlay-strong);
      }

      table {
        width: 100%;
        border-collapse: collapse;
        background: var(--color-primary-surface);
        font-size: var(--font-small);
      }

      th {
        background: var(--color-2-dark);
        color: var(--color-white);
        font-weight: var(--font-weight-semibold);
        font-size: var(--font-small);
        text-transform: var(--text-transform-uppercase);
        letter-spacing: var(--letter-spacing-wide);
        padding: var(--size-large) var(--size-medium);
        position: sticky;
        top: 0;
        z-index: var(--z-index-sticky);
      }

      td {
        padding: var(--size-large) var(--size-medium);
        border-bottom: 1px solid var(--color-overlay-medium);
        color: var(--color-primary-text);
      }

      tbody tr {
        transition: var(--transition-all);
      }

      tbody tr:hover {
        background: var(--color-overlay-light);
        transform: var(--transform-hover);
        box-shadow: var(--shadow-hover);
      }

      tbody tr:last-child td {
        border-bottom: none;
      }

      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--size-medium);
        margin-top: var(--size-xl);
        padding: var(--size-large);
      }

      .pagination button {
        padding: var(--size-medium) var(--size-large);
        border: 2px solid var(--color-accent);
        background: transparent;
        color: var(--color-accent);
        border-radius: var(--border-radius-medium);
        font-size: var(--font-small);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        transition: var(--transition-all);
        min-width: var(--size-min-button);
      }

      .pagination button:hover:not(:disabled) {
        background: var(--color-accent);
        color: var(--color-white);
        transform: var(--transform-hover);
        box-shadow: var(--shadow-hover);
      }

      .pagination button:disabled {
        opacity: var(--opacity-disabled);
        transform: none;
      }

      .pagination span {
        color: var(--color-primary-text-muted);
        font-size: var(--font-small);
        font-weight: var(--font-weight-normal);
      }

      .amount {
        font-weight: var(--font-weight-bold);
        font-size: var(--font-medium);
        text-align: right;
        font-family: var(--font-family-monospace);
      }

      .debit {
        color: var(--color-error);
      }

      .credit {
        color: var(--color-success);
      }

      .empty-state {
        text-align: center;
        padding: var(--size-4x);
        color: var(--color-primary-text-muted);
        font-size: var(--font-large);
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .container {
          padding: var(--size-large);
          margin: var(--size-medium) 0;
        }

        .search-container {
          flex-direction: column;
          gap: var(--size-medium);
          align-items: stretch;
        }

        .summary {
          text-align: center;
        }

        th,
        td {
          padding: var(--size-medium);
          font-size: var(--font-tiny);
        }

        .pagination {
          flex-direction: column;
          gap: var(--size-small);
        }

        .pagination button {
          width: 100%;
        }
      }
    `,
  ];

  @consume({ context: transactionContext, subscribe: true })
  @property({ attribute: false })
  transactionContext?: TransactionContext;

  @consume({ context: bucketFilterContext, subscribe: true })
  @property({ attribute: false })
  bucketFilterContext?: BucketFilterContext;

  @consume({ context: timeFilterContext, subscribe: true })
  @property({ attribute: false })
  timeFilterContext?: TimeFilterContext;

  @state()
  private searchQuery = "";

  @state()
  private currentPage = 1;

  private itemsPerPage = 20;

  private get filteredTransactions(): Transaction[] {
    if (!this.transactionContext?.transactions) return [];

    let transactions = this.transactionContext.transactions;

    // Apply bucket filter first (if it exists)
    if (this.bucketFilterContext?.filterTexts && this.bucketFilterContext.filterTexts.length > 0) {
      transactions = transactions.filter((tx) =>
        this.bucketFilterContext!.filterTexts.some((filterText) =>
          tx.description.toLowerCase().includes(filterText.toLowerCase()),
        ),
      );
    }

    // Apply time filter (if it exists)
    if (this.timeFilterContext?.startDate && this.timeFilterContext?.endDate) {
      const startDate = this.timeFilterContext.startDate;
      const endDate = this.timeFilterContext.endDate;
      transactions = transactions.filter((tx) => {
        const txDate = new Date(tx.postingDate);
        return txDate >= startDate && txDate <= endDate;
      });
    }

    // Then apply search query
    if (this.searchQuery) {
      transactions = searchTransactions(transactions, this.searchQuery);
    }

    return transactions;
  }

  private get paginatedTransactions(): Transaction[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredTransactions.slice(start, end);
  }

  private get totalPages(): number {
    return Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
  }

  private get totalAmountSpend(): number {
    return this.filteredTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);
  }

  private get totalAmountIncome(): number {
    return this.filteredTransactions.filter((t) => t.amount >= 0).reduce((sum, t) => sum + t.amount, 0);
  }

  private handleSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.currentPage = 1; // Reset to first page on search
  }

  private clearBucketFilter(): void {
    this.dispatchEvent(new UpdateBucketFilterEvent([], ""));
  }

  private handlePageChange(page: number): void {
    this.currentPage = page;
  }

  private getAmountClass(amount: number): string {
    return amount >= 0 ? "credit" : "debit";
  }

  override render(): TemplateResult {
    if (!this.transactionContext?.transactions || this.transactionContext.transactions.length === 0) {
      return html`
        <div class="container">
          <div class="empty-state">
            <h3>No transactions loaded</h3>
            <p>Upload a CSV file to view your transaction data</p>
          </div>
        </div>
      `;
    }

    return html`
      <div class="container">
        <div class="search-container">
          <input
            type="text"
            class="search-input"
            placeholder=${this.bucketFilterContext?.name
              ? `Search within "${this.bucketFilterContext.name}" bucket...`
              : "Search transactions..."}
            .value=${this.searchQuery}
            @input=${this.handleSearchChange} />
          ${this.bucketFilterContext?.name
            ? html`
                <div class="filter-indicator">
                  <span>Filtering: "${this.bucketFilterContext.name}" bucket</span>
                  <button class="clear-filter-btn" @click=${this.clearBucketFilter} title="Clear bucket filter">
                    ✕
                  </button>
                </div>
              `
            : ""}
          <div class="summary spend">Expenses: ${formatCurrency(this.totalAmountSpend)}</div>
          <div class="summary income">Income: ${formatCurrency(this.totalAmountIncome)}</div>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Posting Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${this.paginatedTransactions.map(
                (transaction) => html`
                  <tr>
                    <td>${transaction.postingDate}</td>
                    <td>${transaction.description}</td>
                    <td class="amount ${this.getAmountClass(transaction.amount)}">
                      ${formatCurrency(transaction.amount)}
                    </td>
                    <td>${formatCurrency(parseFloat(transaction.balance || "0"))}</td>
                  </tr>
                `,
              )}
            </tbody>
          </table>
        </div>

        ${this.totalPages > 1
          ? html`
              <div class="pagination">
                <button @click=${() => this.handlePageChange(this.currentPage - 1)} ?disabled=${this.currentPage === 1}>
                  ← Previous
                </button>
                <span>Page ${this.currentPage} of ${this.totalPages}</span>
                <button
                  @click=${() => this.handlePageChange(this.currentPage + 1)}
                  ?disabled=${this.currentPage === this.totalPages}>
                  Next →
                </button>
              </div>
            `
          : ""}
      </div>
    `;
  }
}
