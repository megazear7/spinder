import { html, css, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { globalStyles } from "./styles.global.js";
import { UpdateTimeFilterEvent } from "./event.update-time-filter.js";
import { UpdateLabelFilterEvent } from "./event.update-label-filter.js";
import { loadLabels, toTitleCase } from "./util.labels.js";
import { calendarIcon, xIcon } from "./icons.js";

type TimeRange = {
  label: string;
  getRange: () => { start: Date; end: Date } | null;
};

@customElement("spinder-filters")
export class SpinderFilters extends LitElement {
  static override styles = [
    globalStyles,
    css`
      .time-filter-container {
        display: flex;
        align-items: center;
        gap: var(--size-medium);
        position: relative;
        padding: var(--size-large);
        background: var(--color-overlay-light);
        border-radius: var(--border-radius-medium);
        border: 1px solid var(--color-overlay-strong);
      }

      .time-icon {
        color: var(--color-primary-text-muted);
        flex-shrink: 0;
        width: var(--icon-size);
        height: var(--icon-size);
      }

      .time-select {
        flex: 1;
        padding: var(--size-small) var(--size-medium);
        border: 1px solid var(--color-overlay-strong);
        border-radius: var(--border-radius-medium);
        background: var(--color-primary-surface);
        color: var(--color-primary-text);
        font-size: var(--font-medium);
        cursor: pointer;
        transition: var(--transition-all);
        min-width: 200px;
        appearance: none; /* Hide default arrow */
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right var(--size-medium) center;
        background-size: 16px;
        border-radius: var(--border-radius-medium);
        padding: var(--size-medium);
      }

      .label-select {
        flex: 1;
        padding: var(--size-small) var(--size-medium);
        border: 1px solid var(--color-overlay-strong);
        border-radius: var(--border-radius-medium);
        background: var(--color-primary-surface);
        color: var(--color-primary-text);
        font-size: var(--font-medium);
        cursor: pointer;
        transition: var(--transition-all);
        min-width: 150px;
        appearance: none; /* Hide default arrow */
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right var(--size-medium) center;
        background-size: 16px;
        border-radius: var(--border-radius-medium);
        padding: var(--size-medium);
      }

      .time-select:focus,
      .label-select:focus {
        outline: none;
        border-color: var(--color-accent);
        box-shadow: 0 0 0 2px rgba(57, 167, 232, 0.2);
      }

      .time-select:hover,
      .label-select:hover {
        border-color: var(--color-accent);
      }

      .clear-button {
        background: none;
        border: none;
        color: var(--color-primary-text-muted);
        cursor: pointer;
        border-radius: var(--border-radius-medium);
        transition: var(--transition-all);
        font-size: var(--font-small);
        flex-shrink: 0;
        border-radius: 50%;
        padding: var(--size-tiny);
        width: calc(var(--icon-size) + var(--size-tiny) * 2);
        height: calc(var(--icon-size) + var(--size-tiny) * 2);
        box-sizing: border-box;
      }

      .clear-button:hover {
        background: var(--color-overlay-light);
        color: var(--color-error);
      }

      .selected-label {
        font-weight: var(--font-weight-medium);
        color: var(--color-accent);
      }
    `,
  ];

  @state()
  private selectedRange: string = "Last 7 Days";

  @state()
  private selectedLabelId: string = "";

  @state()
  private availableLabels: { id: string; name: string }[] = [];

  private timeRanges: TimeRange[] = [
    {
      label: "All Time",
      getRange: () => null,
    },
    {
      label: "Last 7 Days",
      getRange: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        return { start, end };
      },
    },
    {
      label: "Last 30 Days",
      getRange: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return { start, end };
      },
    },
    {
      label: "This Week",
      getRange: () => {
        const end = new Date();
        const start = new Date();
        const dayOfWeek = start.getDay();
        start.setDate(start.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      },
    },
    {
      label: "This Month",
      getRange: () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth(), 1);
        return { start, end };
      },
    },
    {
      label: "This Year",
      getRange: () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), 0, 1);
        return { start, end };
      },
    },
    {
      label: "Last Week",
      getRange: () => {
        const start = new Date();
        const dayOfWeek = start.getDay();
        start.setDate(start.getDate() - dayOfWeek - 7);
        start.setHours(0, 0, 0, 0);
        const endOfLastWeek = new Date(start);
        endOfLastWeek.setDate(start.getDate() + 6);
        endOfLastWeek.setHours(23, 59, 59, 999);
        return { start, end: endOfLastWeek };
      },
    },
    {
      label: "Last Month",
      getRange: () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
        const endOfLastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        return { start, end: endOfLastMonth };
      },
    },
    {
      label: "Last Year",
      getRange: () => {
        const end = new Date();
        const start = new Date(end.getFullYear() - 1, 0, 1);
        const endOfLastYear = new Date(end.getFullYear() - 1, 11, 31);
        return { start, end: endOfLastYear };
      },
    },
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    this.loadAvailableLabels();
  }

  private loadAvailableLabels(): void {
    this.availableLabels = loadLabels();
  }

  private handleRangeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedLabel = select.value;
    this.selectedRange = selectedLabel;

    const range = this.timeRanges.find((r) => r.label === selectedLabel);
    if (range) {
      const dateRange = range.getRange();
      this.dispatchEvent(new UpdateTimeFilterEvent(dateRange?.start, dateRange?.end, selectedLabel));
    }
  }

  private handleLabelChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedId = select.value;
    this.selectedLabelId = selectedId;

    const selectedLabel = this.availableLabels.find((label) => label.id === selectedId);
    this.dispatchEvent(new UpdateLabelFilterEvent(selectedId || undefined, selectedLabel?.name));
  }

  private handleClear(): void {
    this.selectedRange = "";
    this.selectedLabelId = "";
    const timeSelect = this.shadowRoot?.querySelector(".time-select") as HTMLSelectElement;
    const labelSelect = this.shadowRoot?.querySelector(".label-select") as HTMLSelectElement;
    if (timeSelect) {
      timeSelect.value = "";
    }
    if (labelSelect) {
      labelSelect.value = "";
    }
    this.dispatchEvent(new UpdateTimeFilterEvent(undefined, undefined, ""));
    this.dispatchEvent(new UpdateLabelFilterEvent());
  }

  override firstUpdated(): void {
    // Set the default "Last 7 Days" filter when component loads
    const range = this.timeRanges.find((r) => r.label === this.selectedRange);
    if (range) {
      const dateRange = range.getRange();
      this.dispatchEvent(new UpdateTimeFilterEvent(dateRange?.start, dateRange?.end, this.selectedRange));
    }
  }

  override render(): TemplateResult {
    return html`
      <div class="time-filter-container">
        <div class="time-icon">${calendarIcon}</div>
        <select class="time-select" @change=${this.handleRangeChange}>
          <option value="">Select time range...</option>
          ${this.timeRanges.map(
            (range) => html`
              <option value=${range.label} ?selected=${this.selectedRange === range.label}>${range.label}</option>
            `,
          )}
        </select>
        <select class="label-select" @change=${this.handleLabelChange}>
          <option value="">Select label...</option>
          ${this.availableLabels.map(
            (label) => html`
              <option value=${label.id} ?selected=${this.selectedLabelId === label.id}>${toTitleCase(label.name)}</option>
            `,
          )}
        </select>
        ${this.selectedRange || this.selectedLabelId
          ? html`
              <button class="clear-button" @click=${this.handleClear} title="Clear all filters">${xIcon}</button>
            `
          : ""}
      </div>
    `;
  }
}
