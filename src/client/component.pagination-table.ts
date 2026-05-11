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
  LabelFilterContext,
  labelFilterContext,
} from "./context.js";
import { Transaction } from "../shared/type.transaction.js";
import { searchTransactions } from "./util.transaction.js";
import { UpdateBucketFilterEvent } from "./event.update-bucket-filter.js";
import { UpdateTransactionsEvent } from "./event.update-transactions.js";
import { formatCurrency } from "../shared/util.math.js";
import { getLabelsForTransaction, saveLabels, loadLabels, toTitleCase } from "./util.labels.js";
import { UpdateLabelFilterEvent } from "./event.update-label-filter.js";
import { Label } from "../shared/type.label.js";
import { loadBuckets } from "./util.buckets.js";
import "./component.sample-csv.js";
import "./component.label-transaction-management.js";

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
        flex-wrap: wrap;
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

      .rows-per-page {
        display: flex;
        align-items: center;
        gap: var(--size-small);
        font-size: var(--font-small);
        color: var(--color-primary-text-muted);
      }

      .rows-per-page select {
        padding: var(--size-small) var(--size-medium);
        border: 2px solid var(--color-overlay-strong);
        border-radius: var(--border-radius-medium);
        background: var(--color-primary-surface);
        color: var(--color-primary-text);
        font-size: var(--font-small);
        cursor: pointer;
        transition: var(--transition-all);
      }

      .rows-per-page select:focus {
        outline: none;
        border-color: var(--color-accent);
      }

      .page-jump {
        display: flex;
        align-items: center;
        gap: var(--size-small);
        font-size: var(--font-small);
        color: var(--color-primary-text-muted);
      }

      .page-jump-input {
        width: 60px;
        padding: var(--size-small) var(--size-medium);
        border: 2px solid var(--color-overlay-strong);
        border-radius: var(--border-radius-medium);
        background: var(--color-primary-surface);
        color: var(--color-primary-text);
        font-size: var(--font-small);
        text-align: center;
        transition: var(--transition-all);
      }

      .page-jump-input:focus {
        outline: none;
        border-color: var(--color-accent);
      }

      .page-jump-btn {
        padding: var(--size-small) var(--size-medium);
        border: 2px solid var(--color-accent);
        background: transparent;
        color: var(--color-accent);
        border-radius: var(--border-radius-medium);
        font-size: var(--font-small);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        transition: var(--transition-all);
      }

      .page-jump-btn:hover {
        background: var(--color-accent);
        color: var(--color-white);
      }

      .amount-zero {
        color: var(--color-primary-text-muted);
        opacity: var(--opacity-muted);
        font-weight: var(--font-weight-normal);
        font-size: var(--font-medium);
        font-family: var(--font-family-monospace);
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

      .label-btn {
        background: none;
        border: none;
        color: var(--color-primary-text-muted);
        cursor: pointer;
        font-size: var(--font-small);
        padding: var(--size-small);
        border-radius: var(--border-radius-medium);
        transition: var(--transition-all);
      }

      .label-btn:hover {
        background: var(--color-overlay-light);
        color: var(--color-accent);
      }

      .label-display {
        display: inline-block;
        background: transparent;
        color: var(--color-white);
        padding: var(--size-small) var(--size-medium);
        border-radius: var(--border-radius-medium);
        font-size: var(--font-small);
        margin-right: var(--size-small);
        cursor: pointer;
        transition: var(--transition-all);
      }

      .label-display:hover {
        background: var(--color-accent);
        transform: translateY(-1px);
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

  @consume({ context: labelFilterContext, subscribe: true })
  @property({ attribute: false })
  labelFilterContext?: LabelFilterContext;

  @state()
  private searchQuery = "";

  @state()
  private currentPage = 1;

  @state()
  private itemsPerPage = (() => {
    const stored = localStorage.getItem("spinder_rows_per_page");
    const parsed = parseInt(stored ?? "");
    return [10, 20, 50, 100].includes(parsed) ? parsed : 20;
  })();

  @state()
  private pageJumpValue = "";

  private get filteredTransactions(): Transaction[] {
    if (!this.transactionContext?.transactions) return [];

    let transactions = this.transactionContext.transactions;

    // Apply bucket filter first (if it exists)
    if (this.bucketFilterContext?.isUncategorized) {
      // Show only transactions that don't match any bucket
      const allBuckets = loadBuckets();
      transactions = transactions.filter(
        (tx) =>
          !allBuckets.some((bucket) =>
            bucket.filterTexts.some((filterText) => tx.description.toLowerCase().includes(filterText.toLowerCase())),
          ),
      );
    } else if (this.bucketFilterContext?.filterTexts && this.bucketFilterContext.filterTexts.length > 0) {
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

    // Apply label filter (if it exists)
    if (this.labelFilterContext?.labelId) {
      transactions = transactions.filter((tx) =>
        tx.labels?.some((label) => label.id === this.labelFilterContext!.labelId),
      );
    }

    // Then apply search query
    if (this.searchQuery) {
      transactions = searchTransactions(transactions, this.searchQuery);
    }

    return transactions;
  }

  private get sortedFilteredTransactions(): Transaction[] {
    const nonZero: Transaction[] = [];
    const zero: Transaction[] = [];
    for (const t of this.filteredTransactions) {
      if (t.amount === 0 || isNaN(t.amount)) {
        zero.push(t);
      } else {
        nonZero.push(t);
      }
    }
    return [...nonZero, ...zero];
  }

  private get paginatedTransactions(): Transaction[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.sortedFilteredTransactions.slice(start, end);
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

  private renderLabelsCell(transaction: Transaction): TemplateResult {
    const labels = getLabelsForTransaction(transaction);

    if (labels.length === 0) {
      return html`
        <button class="label-btn" @click=${() => this.openLabelModal(transaction)}>+ label</button>
      `;
    }

    if (labels.length === 1) {
      return html`
        <span class="label-display" @click=${() => this.applyLabelFilter(labels[0])}>
          ${toTitleCase(labels[0].name)}
        </span>
        <button class="label-btn" @click=${() => this.openLabelModal(transaction)}>+ label</button>
      `;
    }

    // Multiple labels: show first one + "+X more" button
    const firstLabel = labels[0];
    const remainingCount = labels.length - 1;

    return html`
      <span class="label-display" @click=${() => this.applyLabelFilter(firstLabel)}>
        ${toTitleCase(firstLabel.name)}
      </span>
      <button class="label-btn" @click=${() => this.openLabelModal(transaction)}>+${remainingCount} more</button>
    `;
  }

  @state()
  private modalTransaction: Transaction | null = null;

  @state()
  private showLabelModal = false;

  private openLabelModal(transaction: Transaction): void {
    this.modalTransaction = transaction;
    this.showLabelModal = true;
  }

  private closeLabelModal(): void {
    this.showLabelModal = false;
    this.modalTransaction = null;
  }

  private handleLabelsUpdated(event: CustomEvent): void {
    if (!this.modalTransaction) return;

    const { stagedLabels }: { stagedLabels: Label[] } = event.detail;
    const updatedTransaction = {
      ...this.modalTransaction,
      labels: stagedLabels,
    };

    // Save any new labels that were created
    const existingLabels = loadLabels();
    const existingLabelIds = new Set(existingLabels.map((label) => label.id));
    const newLabels = stagedLabels.filter((label: Label) => !existingLabelIds.has(label.id));

    if (newLabels.length > 0) {
      const updatedLabels = [...existingLabels, ...newLabels];
      saveLabels(updatedLabels);
    }

    // Update the transaction in the context
    if (this.transactionContext?.transactions) {
      const updatedTransactions = this.transactionContext.transactions.map((tx) =>
        tx === this.modalTransaction ? updatedTransaction : tx,
      );
      this.dispatchEvent(new UpdateTransactionsEvent({ transactions: updatedTransactions }));
    }

    this.closeLabelModal();
  }

  private applyLabelFilter(label: { id: string; name: string }): void {
    this.dispatchEvent(new UpdateLabelFilterEvent(label.id, label.name));
  }

  private handleSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.currentPage = 1; // Reset to first page on search
  }

  private handleRowsPerPageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newValue = parseInt(select.value);
    this.itemsPerPage = newValue;
    localStorage.setItem("spinder_rows_per_page", String(newValue));
    this.currentPage = 1;
  }

  private handlePageJumpInput(event: Event): void {
    this.pageJumpValue = (event.target as HTMLInputElement).value;
  }

  private handlePageJump(): void {
    const page = parseInt(this.pageJumpValue);
    if (!isNaN(page) && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
    this.pageJumpValue = "";
  }

  private handlePageJumpKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      this.handlePageJump();
    }
  }

  override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);
    if (
      changedProperties.has("bucketFilterContext") ||
      changedProperties.has("timeFilterContext") ||
      changedProperties.has("labelFilterContext")
    ) {
      this.currentPage = 1;
      this.pageJumpValue = "";
    }
  }

  private getSearchPlaceholder(): string {
    const isUncategorized = this.bucketFilterContext?.isUncategorized;
    const bucketName = this.bucketFilterContext?.name;
    const labelName = this.labelFilterContext?.labelName;

    if (isUncategorized && labelName) {
      return `Search within uncategorized transactions and "${labelName}" label...`;
    } else if (isUncategorized) {
      return `Search within uncategorized transactions...`;
    } else if (bucketName && labelName) {
      return `Search within "${bucketName}" bucket and "${labelName}" label...`;
    } else if (bucketName) {
      return `Search within "${bucketName}" bucket...`;
    } else if (labelName) {
      return `Search within "${labelName}" label...`;
    }
    return "Search transactions...";
  }

  private clearBucketFilter(): void {
    this.dispatchEvent(new UpdateBucketFilterEvent([], ""));
  }

  private clearLabelFilter(): void {
    this.dispatchEvent(new UpdateLabelFilterEvent());
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
            <spinder-sample-csv></spinder-sample-csv>
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
            placeholder=${this.getSearchPlaceholder()}
            .value=${this.searchQuery}
            @input=${this.handleSearchChange} />
          ${this.bucketFilterContext?.name && !this.bucketFilterContext?.isUncategorized
            ? html`
                <div class="filter-indicator">
                  <span>Filtering: "${this.bucketFilterContext.name}" bucket</span>
                  <button class="clear-filter-btn" @click=${this.clearBucketFilter} title="Clear bucket filter">
                    ✕
                  </button>
                </div>
              `
            : ""}
          ${this.bucketFilterContext?.isUncategorized
            ? html`
                <div class="filter-indicator">
                  <span>Filtering: Uncategorized transactions</span>
                  <button class="clear-filter-btn" @click=${this.clearBucketFilter} title="Clear filter">✕</button>
                </div>
              `
            : ""}
          ${this.labelFilterContext?.labelName
            ? html`
                <div class="filter-indicator">
                  <span>Filtering: "${this.labelFilterContext.labelName}" label</span>
                  <button class="clear-filter-btn" @click=${this.clearLabelFilter} title="Clear label filter">✕</button>
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
                <th>Labels</th>
              </tr>
            </thead>
            <tbody>
              ${this.paginatedTransactions.map(
                (transaction) => html`
                  <tr>
                    <td>${transaction.postingDate}</td>
                    <td>${transaction.description}</td>
                    <td
                      class="amount ${transaction.amount !== 0 && !isNaN(transaction.amount)
                        ? this.getAmountClass(transaction.amount)
                        : ""}">
                      ${transaction.amount === 0 || isNaN(transaction.amount)
                        ? html`
                            <span class="amount-zero">$0.00</span>
                          `
                        : formatCurrency(transaction.amount)}
                    </td>
                    <td>${formatCurrency(parseFloat(transaction.balance || "0"))}</td>
                    <td>${this.renderLabelsCell(transaction)}</td>
                  </tr>
                `,
              )}
            </tbody>
          </table>
        </div>

        ${this.totalPages > 1
          ? html`
              <div class="pagination">
                <div class="rows-per-page">
                  <span>Rows:</span>
                  <select @change=${this.handleRowsPerPageChange}>
                    ${[10, 20, 50, 100].map(
                      (n) => html`
                        <option value=${n} ?selected=${this.itemsPerPage === n}>${n}</option>
                      `,
                    )}
                  </select>
                </div>
                <button @click=${() => this.handlePageChange(this.currentPage - 1)} ?disabled=${this.currentPage === 1}>
                  ← Previous
                </button>
                <span>Page ${this.currentPage} of ${this.totalPages}</span>
                <button
                  @click=${() => this.handlePageChange(this.currentPage + 1)}
                  ?disabled=${this.currentPage === this.totalPages}>
                  Next →
                </button>
                <div class="page-jump">
                  <span>Go to:</span>
                  <input
                    type="number"
                    class="page-jump-input"
                    .value=${this.pageJumpValue}
                    @input=${this.handlePageJumpInput}
                    @keydown=${this.handlePageJumpKeydown}
                    min="1"
                    max=${this.totalPages}
                    placeholder="#" />
                  <button class="page-jump-btn" @click=${this.handlePageJump}>Go</button>
                </div>
              </div>
            `
          : html`
              <div class="pagination">
                <div class="rows-per-page">
                  <span>Rows:</span>
                  <select @change=${this.handleRowsPerPageChange}>
                    ${[10, 20, 50, 100].map(
                      (n) => html`
                        <option value=${n} ?selected=${this.itemsPerPage === n}>${n}</option>
                      `,
                    )}
                  </select>
                </div>
              </div>
            `}
      </div>

      ${this.showLabelModal && this.modalTransaction
        ? html`
            <spinder-label-transaction-management
              .transaction=${this.modalTransaction}
              @labels-updated=${this.handleLabelsUpdated}
              @modal-closed=${this.closeLabelModal}></spinder-label-transaction-management>
          `
        : ""}
    `;
  }
}
