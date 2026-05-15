import { html, css, LitElement, TemplateResult, PropertyValues } from "lit";
import { customElement, state, query } from "lit/decorators.js";
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
import { Bucket } from "../shared/type.bucket.js";
import { loadBuckets } from "./util.buckets.js";
import { formatCurrency } from "../shared/util.math.js";
import { UpdateTimeFilterEvent } from "./event.update-time-filter.js";
import { UpdateBucketFilterEvent } from "./event.update-bucket-filter.js";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from "chart.js";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

type Granularity = "day" | "week" | "month" | "year";

interface TimeBucket {
  label: string;
  start: Date;
  end: Date;
  amount: number;
}

const CHART_COLORS = [
  "#39a7e8",
  "#63bb23",
  "#fdd848",
  "#ff6b6b",
  "#a855f7",
  "#f97316",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#f59e0b",
];

// Chart.js renders to canvas and cannot access CSS variables directly.
// These constants mirror the design tokens defined in app.css.
const CHART_ACCENT_COLOR = "#39a7e8";
const CHART_TICK_COLOR = "#999";
const CHART_TICK_FONT_SIZE = 11;
const CHART_LABEL_FONT_SIZE = 12;
const CHART_GRID_COLOR = "rgba(255,255,255,0.05)";
const CHART_TOOLTIP_BG = "rgba(44, 47, 51, 0.95)";
const CHART_TOOLTIP_BORDER = "rgba(57, 167, 232, 0.4)";
const CHART_TOOLTIP_TEXT = "#e0e6ed";
const CHART_BAR_BG = `${CHART_ACCENT_COLOR}80`;
const CHART_BAR_BORDER = CHART_ACCENT_COLOR;
const CHART_BUCKET_OPACITY = "99";

const sharedTooltipStyle = {
  backgroundColor: CHART_TOOLTIP_BG,
  borderColor: CHART_TOOLTIP_BORDER,
  borderWidth: 1,
  titleColor: CHART_TOOLTIP_TEXT,
  bodyColor: CHART_TOOLTIP_TEXT,
  padding: 10,
};

@customElement("spinder-time-series-chart")
export class SpinderTimeSeriesChart extends LitElement {
  static override styles = [
    globalStyles,
    css`
      :host {
        display: block;
        margin: var(--size-large) 0;
      }

      .chart-container {
        background: var(--color-overlay-light);
        border: 1px solid var(--color-overlay-strong);
        border-radius: var(--border-radius-large);
        padding: var(--size-large);
      }

      .chart-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--size-medium);
        margin-bottom: var(--size-large);
      }

      .chart-title {
        font-size: var(--font-large);
        font-weight: var(--font-weight-semibold);
        color: var(--color-primary-text);
        margin: 0;
      }

      .chart-controls {
        display: flex;
        gap: var(--size-small);
        flex-wrap: wrap;
      }

      .granularity-btn {
        padding: var(--size-small) var(--size-medium);
        border: 1px solid var(--color-overlay-strong);
        border-radius: var(--border-radius-medium);
        background: transparent;
        color: var(--color-primary-text-muted);
        font-size: var(--font-small);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        transition: var(--transition-all);
        letter-spacing: var(--letter-spacing-wide);
        text-transform: var(--text-transform-uppercase);
      }

      .granularity-btn:hover {
        border-color: var(--color-accent);
        color: var(--color-accent);
        background: var(--color-accent-light);
      }

      .granularity-btn.active {
        border-color: var(--color-accent);
        background: var(--color-accent-medium);
        color: var(--color-accent);
      }

      .mode-toggle {
        display: flex;
        gap: var(--size-small);
        flex-wrap: wrap;
        align-items: center;
      }

      .mode-btn {
        padding: var(--size-small) var(--size-medium);
        border: 1px solid var(--color-overlay-strong);
        border-radius: var(--border-radius-medium);
        background: transparent;
        color: var(--color-primary-text-muted);
        font-size: var(--font-small);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        transition: var(--transition-all);
        letter-spacing: var(--letter-spacing-wide);
        text-transform: var(--text-transform-uppercase);
      }

      .mode-btn:hover {
        border-color: var(--color-2);
        color: var(--color-2);
        background: var(--color-2-faded);
      }

      .mode-btn.active {
        border-color: var(--color-2);
        background: var(--color-2-faded);
        color: var(--color-2);
      }

      .canvas-wrapper {
        position: relative;
        width: 100%;
        height: 300px;
      }

      canvas {
        display: block;
        width: 100% !important;
        height: 100% !important;
        cursor: pointer;
      }

      .chart-hint {
        text-align: center;
        color: var(--color-primary-text-muted);
        font-size: var(--font-tiny);
        margin-top: var(--size-medium);
      }

      .no-data {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: var(--color-primary-text-muted);
        font-size: var(--font-medium);
      }

      .active-filter-badge {
        display: inline-flex;
        align-items: center;
        gap: var(--size-small);
        padding: var(--size-tiny) var(--size-medium);
        background: var(--color-accent-light);
        border: 1px solid var(--color-accent-medium);
        border-radius: var(--border-radius-medium);
        color: var(--color-accent);
        font-size: var(--font-small);
        font-weight: var(--font-weight-semibold);
      }

      .clear-filter-btn {
        background: none;
        border: none;
        color: var(--color-accent);
        cursor: pointer;
        font-size: var(--font-small);
        padding: 0;
        line-height: 1;
        opacity: 0.7;
        transition: var(--transition-all);
      }

      .clear-filter-btn:hover {
        opacity: 1;
      }

      @media (max-width: 768px) {
        .chart-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .canvas-wrapper {
          height: 220px;
        }

        .granularity-btn,
        .mode-btn {
          padding: var(--size-tiny) var(--size-small);
          font-size: 11px;
        }
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

  @state()
  private granularity: Granularity = "week";

  @state()
  private chartMode: "trend" | "buckets" = "trend";

  @state()
  private buckets: Bucket[] = [];

  @query("canvas")
  private canvasEl?: HTMLCanvasElement;

  private chartInstance: Chart | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.buckets = loadBuckets();
  }

  override updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (
      changedProps.has("transactionContext") ||
      changedProps.has("timeFilterContext") ||
      changedProps.has("bucketFilterContext") ||
      changedProps.has("granularity") ||
      changedProps.has("chartMode")
    ) {
      // Defer to next animation frame so the canvas element has been laid out
      // and Chart.js can read its pixel dimensions correctly.
      requestAnimationFrame(() => this.renderChart());
    }
  }

  private getFilteredTransactions(): Transaction[] {
    const transactions = this.transactionContext?.transactions ?? [];
    let filtered = transactions.filter((tx) => tx.amount < 0);

    if (this.timeFilterContext?.startDate && this.timeFilterContext?.endDate) {
      const start = this.timeFilterContext.startDate;
      const end = this.timeFilterContext.endDate;
      filtered = filtered.filter((tx) => {
        const d = new Date(tx.postingDate);
        return d >= start && d <= end;
      });
    }

    if (this.bucketFilterContext?.filterTexts?.length) {
      if (this.bucketFilterContext.isUncategorized) {
        filtered = filtered.filter(
          (tx) =>
            !this.buckets.some((b) =>
              b.filterTexts.some((f) => tx.description.toLowerCase().includes(f.toLowerCase())),
            ),
        );
      } else {
        filtered = filtered.filter((tx) =>
          this.bucketFilterContext!.filterTexts.some((f) => tx.description.toLowerCase().includes(f.toLowerCase())),
        );
      }
    }

    return filtered;
  }

  private getTimeBuckets(transactions: Transaction[]): TimeBucket[] {
    if (transactions.length === 0) return [];

    const dates = transactions.map((tx) => new Date(tx.postingDate));
    const minDate = this.timeFilterContext?.startDate ?? new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = this.timeFilterContext?.endDate ?? new Date(Math.max(...dates.map((d) => d.getTime())));

    const buckets: TimeBucket[] = [];
    const cursor = new Date(minDate);
    cursor.setHours(0, 0, 0, 0);

    while (cursor <= maxDate) {
      const start = new Date(cursor);
      let end: Date;
      let label: string;

      if (this.granularity === "day") {
        end = new Date(cursor);
        end.setHours(23, 59, 59, 999);
        label = cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        cursor.setDate(cursor.getDate() + 1);
      } else if (this.granularity === "week") {
        end = new Date(cursor);
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        label = `${cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
        cursor.setDate(cursor.getDate() + 7);
      } else if (this.granularity === "month") {
        end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999);
        label = cursor.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        cursor.setMonth(cursor.getMonth() + 1);
        cursor.setDate(1);
      } else {
        end = new Date(cursor.getFullYear(), 11, 31, 23, 59, 59, 999);
        label = String(cursor.getFullYear());
        cursor.setFullYear(cursor.getFullYear() + 1);
      }

      const amount = transactions
        .filter((tx) => {
          const d = new Date(tx.postingDate);
          return d >= start && d <= end;
        })
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

      buckets.push({ label, start, end, amount });
    }

    return buckets;
  }

  private getBucketBreakdown(): { name: string; amount: number; filterTexts: string[] }[] {
    const transactions = this.getFilteredTransactions();

    const result = this.buckets.map((bucket) => {
      const amount = transactions
        .filter((tx) => bucket.filterTexts.some((f) => tx.description.toLowerCase().includes(f.toLowerCase())))
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      return { name: bucket.name, amount, filterTexts: bucket.filterTexts };
    });

    const uncategorizedAmount = transactions
      .filter(
        (tx) =>
          !this.buckets.some((b) => b.filterTexts.some((f) => tx.description.toLowerCase().includes(f.toLowerCase()))),
      )
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    if (uncategorizedAmount > 0) {
      result.push({ name: "Uncategorized", amount: uncategorizedAmount, filterTexts: [] });
    }

    return result.filter((b) => b.amount > 0).sort((a, b) => b.amount - a.amount);
  }

  private renderChart(): void {
    if (!this.canvasEl) return;

    const transactions = this.getFilteredTransactions();

    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    if (this.chartMode === "trend") {
      this.renderTrendChart(transactions);
    } else {
      this.renderBucketsChart();
    }
  }

  private renderTrendChart(transactions: Transaction[]): void {
    if (!this.canvasEl) return;

    const timeBuckets = this.getTimeBuckets(transactions);

    const data: ChartData<"bar"> = {
      labels: timeBuckets.map((b) => b.label),
      datasets: [
        {
          label: "Spending",
          data: timeBuckets.map((b) => b.amount),
          backgroundColor: CHART_BAR_BG,
          borderColor: CHART_BAR_BORDER,
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };

    const options: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (_event, elements) => {
        if (elements.length > 0) {
          const idx = elements[0].index;
          const bucket = timeBuckets[idx];
          if (bucket) {
            this.dispatchEvent(new UpdateTimeFilterEvent(bucket.start, bucket.end, bucket.label));
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${formatCurrency(ctx.parsed.y as number)}`,
          },
          ...sharedTooltipStyle,
        },
      },
      scales: {
        x: {
          grid: { color: CHART_GRID_COLOR },
          ticks: { color: CHART_TICK_COLOR, font: { size: CHART_TICK_FONT_SIZE }, maxRotation: 45 },
        },
        y: {
          grid: { color: CHART_GRID_COLOR },
          ticks: {
            color: CHART_TICK_COLOR,
            font: { size: CHART_TICK_FONT_SIZE },
            callback: (value) => `$${(value as number).toLocaleString()}`,
          },
          beginAtZero: true,
        },
      },
    };

    this.chartInstance = new Chart(this.canvasEl, { type: "bar", data, options });
  }

  private renderBucketsChart(): void {
    if (!this.canvasEl) return;

    const breakdown = this.getBucketBreakdown();

    const data: ChartData<"bar"> = {
      labels: breakdown.map((b) => b.name),
      datasets: [
        {
          label: "Spending by Bucket",
          data: breakdown.map((b) => b.amount),
          backgroundColor: breakdown.map((_, i) => CHART_COLORS[i % CHART_COLORS.length] + CHART_BUCKET_OPACITY),
          borderColor: breakdown.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };

    const options: ChartOptions<"bar"> = {
      indexAxis: "y" as const,
      responsive: true,
      maintainAspectRatio: false,
      onClick: (_event, elements) => {
        if (elements.length > 0) {
          const idx = elements[0].index;
          const bucket = breakdown[idx];
          if (bucket) {
            if (bucket.name === "Uncategorized") {
              this.dispatchEvent(new UpdateBucketFilterEvent([], "Uncategorized", true));
            } else {
              this.dispatchEvent(new UpdateBucketFilterEvent(bucket.filterTexts, bucket.name, false));
            }
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${formatCurrency(ctx.parsed.x as number)}`,
          },
          ...sharedTooltipStyle,
        },
      },
      scales: {
        x: {
          grid: { color: CHART_GRID_COLOR },
          ticks: {
            color: CHART_TICK_COLOR,
            font: { size: CHART_TICK_FONT_SIZE },
            callback: (value) => `$${(value as number).toLocaleString()}`,
          },
          beginAtZero: true,
        },
        y: {
          grid: { color: CHART_GRID_COLOR },
          ticks: { color: CHART_TICK_COLOR, font: { size: CHART_LABEL_FONT_SIZE } },
        },
      },
    };

    this.chartInstance = new Chart(this.canvasEl, { type: "bar", data, options });
  }

  private handleGranularityChange(g: Granularity): void {
    this.granularity = g;
  }

  private handleModeChange(mode: "trend" | "buckets"): void {
    this.chartMode = mode;
  }

  private handleClearBucketFilter(): void {
    // Empty name and filterTexts with isUncategorized=false signals "no bucket selected"
    this.dispatchEvent(new UpdateBucketFilterEvent([], "", false));
  }

  private getChartTitle(): string {
    if (this.chartMode === "buckets") return "Spending by Category";
    const bucketName = this.bucketFilterContext?.name;
    if (bucketName) return `Spending: ${bucketName}`;
    return "Spending Over Time";
  }

  override render(): TemplateResult {
    const transactions = this.getFilteredTransactions();
    const hasData = transactions.length > 0;
    const hasBucketFilter =
      (this.bucketFilterContext?.name && this.bucketFilterContext.filterTexts.length > 0) ||
      this.bucketFilterContext?.isUncategorized === true;

    return html`
      <div class="chart-container">
        <div class="chart-header">
          <h2 class="chart-title">${this.getChartTitle()}</h2>
          <div class="chart-controls">
            <div class="mode-toggle">
              <button
                class="mode-btn ${this.chartMode === "trend" ? "active" : ""}"
                @click=${() => this.handleModeChange("trend")}>
                Trend
              </button>
              <button
                class="mode-btn ${this.chartMode === "buckets" ? "active" : ""}"
                @click=${() => this.handleModeChange("buckets")}>
                Buckets
              </button>
            </div>
            ${this.chartMode === "trend"
              ? html`
                  <div class="chart-controls">
                    ${(["day", "week", "month", "year"] as Granularity[]).map(
                      (g) => html`
                        <button
                          class="granularity-btn ${this.granularity === g ? "active" : ""}"
                          @click=${() => this.handleGranularityChange(g)}>
                          ${g}
                        </button>
                      `,
                    )}
                  </div>
                `
              : ""}
          </div>
        </div>
        ${hasBucketFilter
          ? html`
              <div style="margin-bottom: var(--size-medium);">
                <span class="active-filter-badge">
                  ${this.bucketFilterContext?.isUncategorized
                    ? "Uncategorized"
                    : (this.bucketFilterContext?.name ?? "")}
                  <button class="clear-filter-btn" @click=${this.handleClearBucketFilter} title="Clear bucket filter">
                    ✕
                  </button>
                </span>
              </div>
            `
          : ""}
        ${hasData
          ? html`
              <div class="canvas-wrapper">
                <canvas></canvas>
              </div>
              <p class="chart-hint">
                ${this.chartMode === "trend"
                  ? "Click a bar to drill down into that time period"
                  : "Click a bar to filter by that category"}
              </p>
            `
          : html`
              <div class="no-data">No spending data available for the selected filters</div>
            `}
      </div>
    `;
  }
}
