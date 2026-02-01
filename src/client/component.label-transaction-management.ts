import { html, css, LitElement, TemplateResult, PropertyValues } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { globalStyles } from "./styles.global.js";
import { Label, TransactionWithLabels } from "../shared/type.label.js";
import { getAvailableLabelsForTransaction, createLabel, loadLabels, toTitleCase } from "./util.labels.js";
import { SpinderModal } from "./component.modal.js";

@customElement("spinder-label-transaction-management")
export class SpinderLabelTransactionManagement extends LitElement {
  static override styles = [
    globalStyles,
    css`
      .modal-body {
        max-height: 70vh;
        overflow-y: auto;
      }

      .labels-section {
        margin-bottom: var(--size-large);
      }

      .section-title {
        font-size: var(--font-medium);
        font-weight: var(--font-weight-semibold);
        color: var(--color-primary-text);
        margin-bottom: var(--size-medium);
      }

      .staged-labels {
        display: flex;
        flex-wrap: wrap;
        gap: var(--size-small);
        min-height: 40px;
        padding: var(--size-medium);
        border: 1px solid var(--color-overlay-strong);
        border-radius: var(--border-radius-medium);
        background: var(--color-primary-surface);
      }

      .staged-label {
        display: flex;
        align-items: center;
        gap: var(--size-small);
        padding: var(--size-small) var(--size-medium);
        background: var(--color-accent);
        color: var(--color-white);
        border-radius: var(--border-radius-medium);
        font-size: var(--font-small);
      }

      .remove-label-btn {
        background: none;
        border: none;
        color: var(--color-white);
        cursor: pointer;
        font-size: var(--font-medium);
        padding: 0;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }

      .remove-label-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .add-existing-section {
        margin-bottom: var(--size-large);
      }

      .control-row {
        display: flex;
        gap: var(--size-medium);
        align-items: flex-start;
      }

      .label-dropdown {
        flex: 1;
        padding: var(--size-medium);
        border: 1px solid var(--color-overlay-strong);
        border-radius: var(--border-radius-medium);
        background: var(--color-primary-surface);
        color: var(--color-primary-text);
        font-size: var(--font-medium);
      }

      .add-existing-btn {
        width: 200px;
        padding: var(--size-medium) var(--size-large);
        background: var(--color-accent);
        color: var(--color-white);
        border: none;
        border-radius: var(--border-radius-medium);
        cursor: pointer;
        font-size: var(--font-medium);
        transition: var(--transition-all);
      }

      .add-existing-btn:hover {
        background: var(--color-accent-dark);
      }

      .add-existing-btn:disabled {
        background: var(--color-overlay-medium);
        cursor: not-allowed;
      }

      .create-new-section {
        margin-bottom: var(--size-large);
      }

      .new-label-input {
        flex: 1;
        padding: var(--size-medium);
        border: 1px solid var(--color-overlay-strong);
        border-radius: var(--border-radius-medium);
        background: var(--color-primary-surface);
        color: var(--color-primary-text);
        font-size: var(--font-medium);
        box-sizing: border-box;
      }

      .create-add-btn {
        width: 200px;
        padding: var(--size-medium) var(--size-large);
        background: var(--color-success);
        color: var(--color-white);
        border: none;
        border-radius: var(--border-radius-medium);
        cursor: pointer;
        font-size: var(--font-medium);
        transition: var(--transition-all);
      }

      .create-add-btn:hover:not(:disabled) {
        background: var(--color-success-hover);
      }

      .create-add-btn:disabled {
        background: var(--color-overlay-medium);
        cursor: not-allowed;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--size-medium);
        margin-top: var(--size-large);
        padding-top: var(--size-large);
        border-top: 1px solid var(--color-overlay-strong);
      }

      .btn-secondary {
        padding: var(--size-medium) var(--size-large);
        background: var(--color-primary-surface);
        color: var(--color-primary-text);
        border: 1px solid var(--color-overlay-strong);
        border-radius: var(--border-radius-medium);
        cursor: pointer;
        font-size: var(--font-medium);
        transition: var(--transition-all);
      }

      .btn-secondary:hover {
        background: var(--color-overlay-light);
      }

      .btn-primary {
        padding: var(--size-medium) var(--size-large);
        background: var(--color-accent);
        color: var(--color-white);
        border: none;
        border-radius: var(--border-radius-medium);
        cursor: pointer;
        font-size: var(--font-medium);
        transition: var(--transition-all);
      }

      .btn-primary:hover {
        background: var(--color-accent-dark);
      }
    `,
  ];

  @property({ attribute: false })
  transaction!: TransactionWithLabels;

  @state()
  private stagedLabels: Label[] = [];

  @state()
  private availableLabels: Label[] = [];

  @state()
  private newLabelName = "";

  @state()
  private selectedLabelId = "";

  @query("spinder-modal")
  private modal!: SpinderModal;

  override connectedCallback(): void {
    super.connectedCallback();
    this.initializeStagedLabels();
    this.updateAvailableLabels();
  }

  override firstUpdated(): void {
    this.modal.open();
  }

  override updated(changedProperties: PropertyValues): void {
    if (changedProperties.has("transaction")) {
      this.modal.open();
    }
  }

  private initializeStagedLabels(): void {
    this.stagedLabels = [...(this.transaction.labels || [])];
  }

  private updateAvailableLabels(): void {
    this.availableLabels = getAvailableLabelsForTransaction(this.transaction);
  }

  private isNameTaken(name: string): boolean {
    const trimmed = name.trim().toLowerCase();
    const existingLabels = loadLabels();
    return existingLabels.some((label) => label.name.toLowerCase() === trimmed);
  }

  private addExistingLabel(): void {
    if (!this.selectedLabelId) return;

    const labelToAdd = this.availableLabels.find((label) => label.id === this.selectedLabelId);
    if (!labelToAdd) return;

    this.stagedLabels = [...this.stagedLabels, labelToAdd];
    this.availableLabels = this.availableLabels.filter((label) => label.id !== this.selectedLabelId);
    this.selectedLabelId = "";
  }

  private removeStagedLabel(labelId: string): void {
    const labelToRemove = this.stagedLabels.find((label) => label.id === labelId);
    if (!labelToRemove) return;

    this.stagedLabels = this.stagedLabels.filter((label) => label.id !== labelId);
    // Add back to available labels if it was originally available
    const wasOriginallyAvailable = !this.transaction.labels?.some((label) => label.id === labelId);
    if (wasOriginallyAvailable) {
      this.availableLabels = [...this.availableLabels, labelToRemove];
    }
  }

  private createAndAddLabel(): void {
    if (!this.newLabelName.trim()) return;

    if (this.isNameTaken(this.newLabelName)) return;

    try {
      const newLabel = createLabel(this.newLabelName.trim());
      this.stagedLabels = [...this.stagedLabels, newLabel];
      this.newLabelName = "";
    } catch (error) {
      console.error("Error creating label:", error);
    }
  }

  private handleSubmit(): void {
    // This will be handled by the parent component
    this.dispatchEvent(
      new CustomEvent("labels-updated", {
        detail: { stagedLabels: this.stagedLabels },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleCancel(): void {
    this.dispatchEvent(
      new CustomEvent("modal-closed", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render(): TemplateResult {
    return html`
      <spinder-modal @ModelSubmit=${this.handleSubmit} @ModelClosing=${this.handleCancel}>
        <div slot="body" class="modal-body">
          <div class="labels-section">
            <div class="section-title">Current Labels</div>
            <div class="staged-labels">
              ${this.stagedLabels.length === 0
                ? html`
                    <span style="color: var(--color-primary-text-muted); font-style: italic;">No labels</span>
                  `
                : this.stagedLabels.map(
                    (label) => html`
                      <div class="staged-label">
                        ${toTitleCase(label.name)}
                        <button
                          class="remove-label-btn"
                          @click=${() => this.removeStagedLabel(label.id)}
                          title="Remove label">
                          ×
                        </button>
                      </div>
                    `,
                  )}
            </div>
          </div>

          <div class="add-existing-section">
            <div class="section-title">Add Existing Label</div>
            <div class="control-row">
              <select
                class="label-dropdown"
                .value=${this.selectedLabelId}
                @change=${(e: Event) => (this.selectedLabelId = (e.target as HTMLSelectElement).value)}>
                <option value="">Select a label...</option>
                ${this.availableLabels.map(
                  (label) => html`
                    <option value=${label.id}>${label.name}</option>
                  `,
                )}
              </select>
              <button class="add-existing-btn" ?disabled=${!this.selectedLabelId} @click=${this.addExistingLabel}>
                Add Label
              </button>
            </div>
          </div>

          <div class="create-new-section">
            <div class="section-title">Create New Label</div>
            <div class="control-row">
              <input
                type="text"
                class="new-label-input"
                placeholder="Label name (max 10 characters)"
                maxlength="10"
                .value=${this.newLabelName}
                @input=${(e: Event) => (this.newLabelName = (e.target as HTMLInputElement).value)} />
              <button
                class="create-add-btn"
                ?disabled=${!this.newLabelName.trim() || this.isNameTaken(this.newLabelName)}
                title=${this.isNameTaken(this.newLabelName) ? "A label with this name already exists" : ""}
                @click=${this.createAndAddLabel}>
                Create and Add
              </button>
            </div>
          </div>
        </div>

        <div slot="footer" class="modal-actions">
          <button class="btn-secondary" @click=${this.handleCancel}>Cancel</button>
          <button class="btn-primary" @click=${this.handleSubmit}>Save Changes</button>
        </div>
      </spinder-modal>
    `;
  }
}
