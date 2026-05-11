import { html, css, LitElement, TemplateResult } from "lit";
import { customElement, state, query } from "lit/decorators.js";
import { consume } from "@lit/context";
import { globalStyles } from "./styles.global.js";
import {
  TransactionContext,
  transactionContext,
  TimeFilterContext,
  timeFilterContext,
  BucketFilterContext,
  bucketFilterContext,
} from "./context.js";
import { Bucket, BucketWithData } from "../shared/type.bucket.js";
import { loadBuckets, saveBuckets } from "./util.buckets.js";
import { editIcon, plusIcon, leftArrowIcon, rightArrowIcon } from "./icons.js";
import { UpdateBucketFilterEvent } from "./event.update-bucket-filter.js";
import "./component.modal.js";
import { formatCurrency } from "../shared/util.math.js";
import { SpinderModal } from "./component.modal.js";

const MIN_MONTHLY_GOAL = 0.01;

@customElement("spinder-buckets")
export class SpinderBuckets extends LitElement {
  static override styles = [
    globalStyles,
    css`
      .buckets-container {
        display: flex;
        gap: var(--size-medium);
        overflow-x: auto;
        padding: var(--size-medium) 0;
        scrollbar-width: thin;
        scrollbar-color: var(--color-overlay-medium) transparent;
        margin-top: var(--size-large);
      }

      .goals-summary {
        margin-top: var(--size-large);
        text-align: left;
        font-size: var(--font-small);
        color: var(--color-primary-text-muted);
      }

      .buckets-container::-webkit-scrollbar {
        height: 6px;
      }

      .buckets-container::-webkit-scrollbar-track {
        background: transparent;
      }

      .buckets-container::-webkit-scrollbar-thumb {
        background: var(--color-overlay-medium);
        border-radius: 3px;
      }

      .bucket {
        flex-shrink: 0;
        background: var(--color-primary-surface);
        border: 1px solid var(--color-overlay-strong);
        border-radius: var(--border-radius-medium);
        padding: var(--size-large);
        min-width: 200px;
        cursor: pointer;
        transition: var(--transition-all);
        position: relative;
      }

      .bucket:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-hover);
      }

      .bucket.add-bucket {
        border-style: dashed;
        border-color: var(--color-accent);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-accent);
      }

      .bucket.add-bucket:hover {
        background: var(--color-2-faded);
      }

      .bucket.selected {
        background: var(--color-2-faded);
        border-color: var(--color-2);
      }

      .bucket-name {
        font-size: var(--font-medium);
        font-weight: var(--font-weight-semibold);
        color: var(--color-primary-text);
        margin-bottom: var(--size-small);
      }

      .bucket-stats {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: var(--size-medium);
        flex-direction: column;
        gap: var(--size-small);
      }

      .bucket-count {
        font-size: var(--font-small);
        color: var(--color-primary-text-muted);
      }

      .bucket-amount {
        font-size: var(--font-medium);
        font-weight: var(--font-weight-bold);
        font-family: var(--font-family-monospace);
      }

      .bucket-amount.positive {
        color: var(--color-success);
      }

      .bucket-amount.negative {
        color: var(--color-error);
      }

      .goal-container {
        width: 100%;
        margin-top: var(--size-small);
        text-align: left;
      }

      .goal-text {
        font-size: var(--font-small);
        color: var(--color-primary-text-muted);
        display: flex;
        justify-content: space-between;
        gap: var(--size-small);
      }

      .goal-progress-track {
        width: 100%;
        height: 8px;
        border-radius: var(--border-radius-medium);
        background: var(--color-overlay-medium);
        overflow: hidden;
        margin-top: var(--size-small);
      }

      .goal-progress-fill {
        height: 100%;
        border-radius: var(--border-radius-medium);
        transition: var(--transition-all);
      }

      .goal-progress-fill.on-track {
        background: var(--color-success);
      }

      .goal-progress-fill.approaching {
        background: var(--color-warning);
      }

      .goal-progress-fill.exceeded {
        background: var(--color-error);
      }

      .goal-alert {
        margin-top: var(--size-small);
        font-size: var(--font-tiny);
        font-weight: var(--font-weight-semibold);
      }

      .goal-alert.approaching {
        color: var(--color-warning);
      }

      .goal-alert.exceeded {
        color: var(--color-error);
      }

      .edit-button {
        position: absolute;
        top: var(--size-small);
        right: var(--size-small);
        background: var(--color-overlay-light);
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transition: var(--transition-all);
        color: var(--color-primary-text-muted);
      }

      .bucket:hover .edit-button {
        opacity: 1;
      }

      .edit-button:hover {
        background: var(--color-accent);
        color: var(--color-white);
        box-shadow: var(--shadow-hover);
      }

      .arrow-buttons {
        position: absolute;
        bottom: var(--size-small);
        left: var(--size-small);
        right: var(--size-small);
        display: flex;
        justify-content: space-between;
        opacity: 0;
        transition: var(--transition-all);
      }

      .bucket:hover .arrow-buttons {
        opacity: 1;
      }

      .arrow-button {
        background: var(--color-overlay-light);
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: var(--transition-all);
        color: var(--color-primary-text-muted);
      }

      .arrow-button:hover {
        background: var(--color-accent);
        color: var(--color-white);
        box-shadow: var(--shadow-hover);
      }

      .arrow-button:disabled {
        opacity: 0.3;
      }

      .arrow-button:disabled:hover {
        background: var(--color-overlay-light);
        color: var(--color-primary-text-muted);
      }

      .bucket.uncategorized {
        border-style: dashed;
        border-color: var(--color-primary-text-muted);
      }

      .bucket.uncategorized:hover {
        background: rgba(153, 153, 153, 0.05);
      }

      .bucket.uncategorized.selected {
        background: rgba(153, 153, 153, 0.1);
        border-color: var(--color-primary-text-muted);
      }

      .uncategorized-name {
        font-size: var(--font-medium);
        font-weight: var(--font-weight-semibold);
        color: var(--color-primary-text-muted);
        margin-bottom: var(--size-small);
      }

      .uncategorized-amount {
        font-size: var(--font-medium);
        font-weight: var(--font-weight-bold);
        font-family: var(--font-family-monospace);
        color: var(--color-primary-text-muted);
      }

      .bulk-categorize-btn {
        margin-top: var(--size-medium);
        width: 100%;
        padding: var(--size-small) var(--size-medium);
        border: 1px solid var(--color-primary-text-muted);
        border-radius: var(--border-radius-medium);
        background: transparent;
        color: var(--color-primary-text-muted);
        font-size: var(--font-tiny);
        cursor: pointer;
        transition: var(--transition-all);
      }

      .bulk-categorize-btn:hover {
        background: var(--color-overlay-light);
        color: var(--color-primary-text);
        border-color: var(--color-primary-text);
      }

      .add-icon {
        width: 24px;
        height: 24px;
      }

      /* Modal body styles */
      .modal-body {
        max-height: 70vh;
        overflow-y: auto;
      }

      .modal-header-custom {
        margin-bottom: var(--size-large);
      }

      .modal-title {
        font-size: var(--font-large);
        font-weight: var(--font-weight-bold);
        color: var(--color-primary-text);
        margin: 0 0 var(--size-large) 0;
      }

      .form-group {
        margin-bottom: var(--size-large);
      }

      .form-label {
        display: block;
        font-size: var(--font-medium);
        font-weight: var(--font-weight-medium);
        color: var(--color-primary-text);
        margin-bottom: var(--size-small);
      }

      .form-input {
        width: 100%;
        box-sizing: border-box;
        padding: var(--size-medium);
        border: 1px solid var(--color-overlay-strong);
        border-radius: var(--border-radius-medium);
        background: var(--color-primary-surface);
        color: var(--color-primary-text);
        font-size: var(--font-medium);
        transition: var(--transition-all);
      }

      .form-input:focus {
        outline: none;
        border-color: var(--color-accent);
        box-shadow: 0 0 0 2px rgba(57, 167, 232, 0.2);
      }

      .filter-texts-container {
        display: flex;
        flex-direction: column;
        gap: var(--size-small);
      }

      .filter-text-row {
        display: flex;
        gap: var(--size-small);
        align-items: center;
      }

      .filter-text-input {
        flex: 1;
      }

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

      .btn-danger {
        background: var(--color-error);
        color: var(--color-white);
      }

      .btn-danger:hover {
        background: var(--color-error-hover);
      }

      .btn-icon {
        width: 32px;
        height: 32px;
        padding: 0;
        border-radius: 50%;
        background: var(--color-overlay-light);
        color: var(--color-primary-text);
        font-size: var(--font-large);
        font-weight: var(--font-weight-bold);
      }

      .btn-icon:hover {
        background: var(--color-overlay-medium);
      }

      .btn-remove {
        color: var(--color-error);
      }

      .btn-add-filter {
        align-self: flex-start;
        margin-top: var(--size-small);
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--size-medium);
        margin-top: var(--size-large);
        padding-top: var(--size-large);
        border-top: 1px solid var(--color-overlay-strong);
      }
    `,
  ];

  @consume({ context: transactionContext, subscribe: true })
  @state()
  transactionContext?: TransactionContext;

  @consume({ context: timeFilterContext, subscribe: true })
  @state()
  timeFilterContext?: TimeFilterContext;

  @consume({ context: bucketFilterContext, subscribe: true })
  @state()
  bucketFilterContext?: BucketFilterContext;

  @query("spinder-modal")
  private modal!: SpinderModal;

  @state()
  private buckets: Bucket[] = [];

  @state()
  private editingBucket: Bucket | null = null;

  @state()
  private modalName = "";

  @state()
  private modalFilterTexts: string[] = [];

  @state()
  private modalMonthlyGoal = "";

  override connectedCallback(): void {
    super.connectedCallback();
    this.loadBuckets();
  }

  private loadBuckets(): void {
    this.buckets = loadBuckets();
  }

  private saveBuckets(): void {
    saveBuckets(this.buckets);
  }

  private getBucketsWithData(): BucketWithData[] {
    if (!this.transactionContext?.transactions) return [];

    // First apply time filter to all transactions
    let filteredTransactions = this.transactionContext.transactions;
    if (this.timeFilterContext?.startDate && this.timeFilterContext?.endDate) {
      const startDate = this.timeFilterContext.startDate;
      const endDate = this.timeFilterContext.endDate;
      filteredTransactions = filteredTransactions.filter((tx) => {
        const txDate = new Date(tx.postingDate);
        return txDate >= startDate && txDate <= endDate;
      });
    }

    return this.buckets.map((bucket) => {
      const matchingTransactions = filteredTransactions.filter((tx) =>
        bucket.filterTexts.some((filterText) => tx.description.toLowerCase().includes(filterText.toLowerCase())),
      );
      const spentAmount = matchingTransactions
        .filter((tx) => tx.amount < 0)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const goalProgress =
        bucket.monthlyGoal != null && bucket.monthlyGoal >= MIN_MONTHLY_GOAL
          ? (spentAmount / bucket.monthlyGoal) * 100
          : 0;
      const goalStatus =
        bucket.monthlyGoal == null || bucket.monthlyGoal < MIN_MONTHLY_GOAL
          ? "none"
          : goalProgress >= 100
            ? "exceeded"
            : goalProgress >= 80
              ? "approaching"
              : "on-track";

      return {
        name: bucket.name,
        filterTexts: bucket.filterTexts,
        monthlyGoal: bucket.monthlyGoal,
        transactionCount: matchingTransactions.length,
        totalAmount: matchingTransactions.reduce((sum, tx) => sum + tx.amount, 0),
        spentAmount,
        goalProgress,
        goalStatus,
      };
    });
  }

  private getUncategorizedData(): { count: number; totalAmount: number } {
    if (!this.transactionContext?.transactions) return { count: 0, totalAmount: 0 };

    let filteredTransactions = this.transactionContext.transactions;
    if (this.timeFilterContext?.startDate && this.timeFilterContext?.endDate) {
      const startDate = this.timeFilterContext.startDate;
      const endDate = this.timeFilterContext.endDate;
      filteredTransactions = filteredTransactions.filter((tx) => {
        const txDate = new Date(tx.postingDate);
        return txDate >= startDate && txDate <= endDate;
      });
    }

    const uncategorized = filteredTransactions.filter(
      (tx) =>
        !this.buckets.some((bucket) =>
          bucket.filterTexts.some((filterText) => tx.description.toLowerCase().includes(filterText.toLowerCase())),
        ),
    );

    return {
      count: uncategorized.length,
      totalAmount: uncategorized.reduce((sum, tx) => sum + tx.amount, 0),
    };
  }

  private handleUncategorizedClick(): void {
    this.dispatchEvent(new UpdateBucketFilterEvent([], "Uncategorized", true));
  }

  private handleBulkCategorize(e: Event): void {
    e.stopPropagation();
    this.handleAddBucket();
  }

  private isUncategorizedSelected(): boolean {
    return this.bucketFilterContext?.isUncategorized === true;
  }

  private handleBucketClick(bucket: BucketWithData): void {
    // For bucket clicks, we'll use all filter texts for comprehensive filtering
    this.dispatchEvent(new UpdateBucketFilterEvent(bucket.filterTexts, bucket.name));
  }

  private handleAddBucket(): void {
    this.editingBucket = null;
    this.modalName = "";
    this.modalFilterTexts = [""];
    this.modalMonthlyGoal = "";
    this.modal.open();
  }

  private handleEditBucket(bucket: Bucket): void {
    this.editingBucket = bucket;
    this.modalName = bucket.name;
    this.modalFilterTexts = [...bucket.filterTexts];
    this.modalMonthlyGoal = bucket.monthlyGoal != null ? bucket.monthlyGoal.toString() : "";
    this.modal.open();
  }

  private handleSaveBucket(): void {
    if (!this.modalName.trim() || this.modalFilterTexts.every((text) => !text.trim())) return;

    const cleanedFilterTexts = this.modalFilterTexts.map((text) => text.trim()).filter((text) => text.length > 0);
    const parsedMonthlyGoal = this.modalMonthlyGoal.trim() ? Number(this.modalMonthlyGoal) : undefined;
    const monthlyGoalInput = this.shadowRoot?.querySelector("#bucket-monthly-goal") as HTMLInputElement | null;

    if (cleanedFilterTexts.length === 0) return;
    if (parsedMonthlyGoal != null && (!Number.isFinite(parsedMonthlyGoal) || parsedMonthlyGoal < MIN_MONTHLY_GOAL)) {
      if (monthlyGoalInput) {
        monthlyGoalInput.setCustomValidity(`Monthly budget goal must be at least ${MIN_MONTHLY_GOAL}.`);
        monthlyGoalInput.reportValidity();
      }
      return;
    }
    if (monthlyGoalInput) {
      monthlyGoalInput.setCustomValidity("");
    }

    if (this.editingBucket) {
      // Update existing bucket
      const index = this.buckets.findIndex((b) => b === this.editingBucket);
      if (index !== -1) {
        this.buckets[index] = {
          name: this.modalName.trim(),
          filterTexts: cleanedFilterTexts,
          monthlyGoal: parsedMonthlyGoal,
        };
      }
    } else {
      // Add new bucket
      this.buckets = [
        ...this.buckets,
        {
          name: this.modalName.trim(),
          filterTexts: cleanedFilterTexts,
          monthlyGoal: parsedMonthlyGoal,
        },
      ];
    }

    this.saveBuckets();
    this.modal.close();
  }

  private addFilterText(): void {
    this.modalFilterTexts = [...this.modalFilterTexts, ""];
  }

  private removeFilterText(index: number): void {
    if (this.modalFilterTexts.length > 1) {
      this.modalFilterTexts = this.modalFilterTexts.filter((_, i) => i !== index);
    }
  }

  private updateFilterText(index: number, value: string): void {
    this.modalFilterTexts = this.modalFilterTexts.map((text, i) => (i === index ? value : text));
  }

  private handleDeleteBucket(): void {
    if (!this.editingBucket) return;

    this.buckets = this.buckets.filter((b) => b !== this.editingBucket);
    this.saveBuckets();
    this.modal.close();
  }

  private moveBucketLeft(index: number): void {
    if (index === 0) return; // Already at the leftmost position

    const newBuckets = [...this.buckets];
    [newBuckets[index - 1], newBuckets[index]] = [newBuckets[index], newBuckets[index - 1]];
    this.buckets = newBuckets;
    this.saveBuckets();
  }

  private moveBucketRight(index: number): void {
    if (index === this.buckets.length - 1) return; // Already at the rightmost position

    const newBuckets = [...this.buckets];
    [newBuckets[index], newBuckets[index + 1]] = [newBuckets[index + 1], newBuckets[index]];
    this.buckets = newBuckets;
    this.saveBuckets();
  }

  private getAmountClass(amount: number): string {
    return amount >= 0 ? "positive" : "negative";
  }

  private getGoalAlertMessage(bucket: BucketWithData): string {
    if (bucket.goalStatus === "approaching") return "Approaching budget limit";
    if (bucket.goalStatus === "exceeded") return "Budget exceeded";
    return "";
  }

  private isBucketSelected(bucket: BucketWithData): boolean {
    if (!this.bucketFilterContext) return false;

    // Check if the bucket's name matches the filter context name
    return this.bucketFilterContext.name === bucket.name;
  }

  override render(): TemplateResult {
    const bucketsWithData = this.getBucketsWithData();
    const uncategorizedData = this.getUncategorizedData();
    const bucketsWithGoals = bucketsWithData.filter(
      (bucket) => bucket.monthlyGoal != null && bucket.monthlyGoal >= MIN_MONTHLY_GOAL,
    );
    const approachingGoals = bucketsWithGoals.filter((bucket) => bucket.goalStatus === "approaching").length;
    const exceededGoals = bucketsWithGoals.filter((bucket) => bucket.goalStatus === "exceeded").length;

    return html`
      ${bucketsWithGoals.length > 0
        ? html`
            <div class="goals-summary">
              Goals: ${bucketsWithGoals.length} active • ${approachingGoals} approaching • ${exceededGoals} exceeded
            </div>
          `
        : ""}
      <div class="buckets-container">
        <div
          class="bucket uncategorized ${this.isUncategorizedSelected() ? "selected" : ""}"
          @click=${this.handleUncategorizedClick}>
          <div class="uncategorized-name">Uncategorized</div>
          <div class="bucket-stats">
            <span class="bucket-count">${uncategorizedData.count} transactions</span>
            <span class="uncategorized-amount">${formatCurrency(uncategorizedData.totalAmount)}</span>
          </div>
          <button class="bulk-categorize-btn" @click=${this.handleBulkCategorize}>⊕ Bulk Categorize</button>
        </div>
        ${bucketsWithData.map(
          (bucket, index) => html`
            <div
              class="bucket ${this.isBucketSelected(bucket) ? "selected" : ""}"
              @click=${() => this.handleBucketClick(bucket)}>
              <button
                class="edit-button"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  const originalBucket = this.buckets.find(
                    (b) =>
                      b.name === bucket.name && JSON.stringify(b.filterTexts) === JSON.stringify(bucket.filterTexts),
                  );
                  if (originalBucket) this.handleEditBucket(originalBucket);
                }}
                aria-label="Edit bucket">
                ${editIcon}
              </button>
              <div class="bucket-name">${bucket.name}</div>
              <div class="bucket-stats">
                <span class="bucket-count">${bucket.transactionCount} transactions</span>
                <span class="bucket-amount ${this.getAmountClass(bucket.totalAmount)}">
                  ${formatCurrency(bucket.totalAmount)}
                </span>
                ${bucket.monthlyGoal != null && bucket.monthlyGoal >= MIN_MONTHLY_GOAL
                  ? html`
                      <div class="goal-container">
                        <div class="goal-text">
                          <span>Goal</span>
                          <span>${formatCurrency(bucket.spentAmount)} / ${formatCurrency(bucket.monthlyGoal)}</span>
                        </div>
                        <div class="goal-progress-track">
                          <div
                            class="goal-progress-fill ${bucket.goalStatus}"
                            style="width: ${Math.min(bucket.goalProgress, 100)}%"></div>
                        </div>
                        ${bucket.goalStatus === "approaching" || bucket.goalStatus === "exceeded"
                          ? html`
                              <div class="goal-alert ${bucket.goalStatus}">${this.getGoalAlertMessage(bucket)}</div>
                            `
                          : ""}
                      </div>
                    `
                  : ""}
              </div>
              <div class="arrow-buttons">
                <button
                  class="arrow-button"
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    this.moveBucketLeft(index);
                  }}
                  ?disabled=${index === 0}
                  aria-label="Move bucket left">
                  ${leftArrowIcon}
                </button>
                <button
                  class="arrow-button"
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    this.moveBucketRight(index);
                  }}
                  ?disabled=${index === bucketsWithData.length - 1}
                  aria-label="Move bucket right">
                  ${rightArrowIcon}
                </button>
              </div>
            </div>
          `,
        )}

        <div class="bucket add-bucket" @click=${this.handleAddBucket}>
          <div class="add-icon">${plusIcon}</div>
          <div>Add Bucket</div>
        </div>
      </div>

      <spinder-modal>
        <div slot="body" class="modal-body">
          <div class="modal-header-custom">
            <h2 class="modal-title">${this.editingBucket ? "Edit Bucket" : "Add New Bucket"}</h2>
          </div>

          <div class="form-group">
            <label class="form-label" for="bucket-name">Bucket Name</label>
            <input
              id="bucket-name"
              class="form-input"
              type="text"
              .value=${this.modalName}
              @input=${(e: Event) => (this.modalName = (e.target as HTMLInputElement).value)}
              placeholder="e.g., Groceries, Utilities, Entertainment" />
          </div>

          <div class="form-group">
            <label class="form-label">Filter Texts</label>
            <div class="filter-texts-container">
              ${this.modalFilterTexts.map(
                (filterText, index) => html`
                  <div class="filter-text-row">
                    <input
                      class="form-input filter-text-input"
                      type="text"
                      .value=${filterText}
                      @input=${(e: Event) => this.updateFilterText(index, (e.target as HTMLInputElement).value)}
                      placeholder="e.g., amazon, starbucks, walmart" />
                    ${this.modalFilterTexts.length > 1
                      ? html`
                          <button
                            class="btn-icon btn-remove"
                            @click=${() => this.removeFilterText(index)}
                            aria-label="Remove filter text">
                            ×
                          </button>
                        `
                      : ""}
                  </div>
                `,
              )}
              <button class="btn btn-secondary btn-add-filter" @click=${this.addFilterText} type="button">
                + Add Filter Text
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="bucket-monthly-goal">Monthly Budget Goal (optional)</label>
            <input
              id="bucket-monthly-goal"
              class="form-input"
              type="number"
              min=${MIN_MONTHLY_GOAL.toString()}
              step="0.01"
              .value=${this.modalMonthlyGoal}
              @input=${(e: Event) => (this.modalMonthlyGoal = (e.target as HTMLInputElement).value)}
              placeholder="e.g., 150" />
          </div>

          <div class="modal-actions">
            ${this.editingBucket
              ? html`
                  <button class="btn btn-danger" @click=${this.handleDeleteBucket}>Delete</button>
                `
              : ""}
            <button class="btn btn-primary" @click=${this.handleSaveBucket}>
              ${this.editingBucket ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </spinder-modal>
    `;
  }
}
