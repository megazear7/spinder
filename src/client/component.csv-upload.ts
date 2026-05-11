import { html, css, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { globalStyles } from "./styles.global.js";
import { addTransactions, loadTransactions, parseTransaction, saveTransactions } from "./util.transaction.js";
import { UpdateTransactionsEvent } from "./event.update-transactions.js";
import { uploadIcon } from "./icons.js";

@customElement("spinder-csv-upload")
export class SpinderCsvUpload extends LitElement {
  static override styles = [
    globalStyles,
    css`
      .upload-container {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--size-xl);
        border: 2px dashed var(--color-overlay-strong);
        border-radius: var(--border-radius-large);
        background: var(--color-primary-surface);
        transition: var(--transition-all);
        cursor: pointer;
        text-align: center;
        margin-top: var(--size-large);
      }

      .upload-container:hover,
      .upload-container.drag-over {
        border-color: var(--color-accent);
        background: var(--color-2-faded);
        transform: var(--transform-hover);
        box-shadow: var(--shadow-hover);
      }

      .upload-container.drag-over {
        border-style: solid;
        background: var(--color-accent-medium);
      }

      .upload-icon {
        color: var(--color-primary-text-muted);
        transition: var(--transition-all);
      }

      .upload-container:hover .upload-icon,
      .upload-container.drag-over .upload-icon {
        color: var(--color-accent);
        transform: scale(1.1);
      }

      .upload-text {
        font-size: var(--font-large);
        font-weight: var(--font-weight-semibold);
        color: var(--color-primary-text);
        margin: 0;
      }

      .upload-subtext {
        font-size: var(--font-medium);
        color: var(--color-primary-text-muted);
        margin: var(--size-small) 0 0 0;
      }

      .upload-button {
        padding: var(--size-medium) var(--size-large);
        background: var(--color-accent);
        color: var(--color-white);
        border: none;
        border-radius: var(--border-radius-medium);
        font-size: var(--font-medium);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: var(--transition-all);
        display: inline-flex;
        align-items: center;
        gap: var(--size-small);
      }

      .upload-button:hover {
        background: var(--color-accent-dark);
        transform: translateY(-1px);
        box-shadow: var(--shadow-active);
      }

      .file-input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
      }

      .status {
        font-size: var(--font-small);
        font-weight: var(--font-weight-medium);
        padding: var(--size-small) var(--size-medium);
        border-radius: var(--border-radius-medium);
        transition: var(--transition-all);
        min-height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: var(--size-large);
      }

      .status.success {
        background: rgba(56, 173, 56, 0.1);
        color: var(--color-success);
        border: 1px solid rgba(56, 173, 56, 0.3);
      }

      .status.error {
        background: rgba(255, 49, 30, 0.1);
        color: var(--color-error);
        border: 1px solid rgba(255, 49, 30, 0.3);
      }

      .status.info {
        background: var(--color-overlay-light);
        color: var(--color-primary-text-muted);
      }

      @media (max-width: 768px) {
        .upload-container {
          padding: var(--size-large);
        }

        .upload-text {
          font-size: var(--font-medium);
        }

        .upload-subtext {
          font-size: var(--font-small);
        }
      }
    `,
  ];

  @state()
  private isDragOver = false;

  @state()
  private statusMessage = "";

  @state()
  private statusType: "success" | "error" | "info" = "info";

  private handleDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  private handleDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    // Only remove drag-over if we're leaving the container entirely
    if (!this.shadowRoot?.contains(event.relatedTarget as Node)) {
      this.isDragOver = false;
    }
  }

  private handleDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  private handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.processFile(file);
    }
    // Reset input value to allow re-uploading the same file
    input.value = "";
  }

  private processFile(file: File): void {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      this.showStatus("Please select a CSV file.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      try {
        const currentTransactions = loadTransactions();
        const newTransactions = parseTransaction(csv);
        const allTransactions = addTransactions(currentTransactions, newTransactions);
        saveTransactions(allTransactions);
        this.dispatchEvent(new UpdateTransactionsEvent({ transactions: allTransactions }));
        this.showStatus(`Successfully uploaded ${newTransactions.length} transactions!`, "success");
      } catch (error) {
        console.error("Error parsing CSV:", error);
        this.showStatus("Error parsing CSV file. Please check the format.", "error");
      }
    };
    reader.readAsText(file);
  }

  private showStatus(message: string, type: "success" | "error" | "info" = "info"): void {
    this.statusMessage = message;
    this.statusType = type;
    setTimeout(() => {
      this.statusMessage = "";
    }, 5000);
  }

  override render(): TemplateResult {
    return html`
      <div
        class="upload-container ${this.isDragOver ? "drag-over" : ""}"
        @dragover=${this.handleDragOver}
        @dragleave=${this.handleDragLeave}
        @drop=${this.handleDrop}>
        <input type="file" accept=".csv" @change=${this.handleFileChange} class="file-input" id="csv-upload" />
        <div class="upload-icon">${uploadIcon}</div>
        <div>
          <p class="upload-text">${this.isDragOver ? "Drop your CSV file here" : "Upload Transaction Data"}</p>
          <p class="upload-subtext">Drag & drop your CSV file or click to browse</p>
        </div>
        ${this.statusMessage
          ? html`
              <div class="status ${this.statusType}">${this.statusMessage}</div>
            `
          : ""}
      </div>
    `;
  }
}
