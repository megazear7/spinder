import { css, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { LitElement } from "lit";
import { globalStyles } from "./styles.global.js";
import { leftArrowIcon } from "./icons.js";
import "./component.sample-csv.js";

@customElement("spinder-csv-help-page")
export class SpinderCsvHelpPage extends LitElement {
  static override styles = [
    globalStyles,
    css`
      main {
        max-width: 800px;
        margin: 0 auto;
        padding: var(--size-large);
      }

      .back-link {
        display: flex;
        margin-bottom: var(--size-large);
      }

      h1 {
        color: var(--color-primary-text);
        margin-bottom: var(--size-large);
      }

      h2 {
        color: var(--color-primary-text);
        margin-top: var(--size-large);
        margin-bottom: var(--size-medium);
      }

      p {
        color: var(--color-primary-text);
        line-height: 1.6;
        margin-bottom: var(--size-medium);
      }

      ul {
        margin-bottom: var(--size-medium);
        padding-left: var(--size-large);
      }

      li {
        color: var(--color-primary-text);
        margin-bottom: var(--size-small);
      }

      strong {
        color: var(--color-accent);
      }
    `,
  ];

  override render(): TemplateResult {
    return html`
      <main>
        <a href="/" class="back-link standalone">${leftArrowIcon} Back to Home</a>
        <h1>CSV Upload Guide</h1>
        <p>
          To import your financial transactions into Spinder, you can upload a CSV file containing your transaction
          data. This allows you to easily bring in data from your bank statements or other financial records. The CSV
          format is the standard CSV download format that Chase bank provides through its web interface. You can
          <a href="/example.csv" download="sample-transactions.csv">download a sample CSV file</a> to see the expected
          format.
        </p>

        <h2>Required CSV Columns</h2>
        <p>Your CSV file must include the following columns (column names are case-insensitive):</p>
        <ul>
          <li>
            <strong>Date:</strong>
            The transaction date in YYYY-MM-DD format (e.g., 2023-12-25)
          </li>
          <li>
            <strong>Description:</strong>
            A description of the transaction (e.g., "Grocery Store Purchase")
          </li>
          <li>
            <strong>Amount:</strong>
            The transaction amount as a number (positive for income/credits, negative for expenses/debits)
          </li>
        </ul>

        <h2>Optional Columns</h2>
        <p>The following columns are optional but recommended:</p>
        <ul>
          <li>
            <strong>Category:</strong>
            A category for the transaction (e.g., "Food", "Transportation")
          </li>
          <li>
            <strong>Notes:</strong>
            Additional notes or details about the transaction
          </li>
        </ul>

        <h2>Important Notes</h2>
        <p>
          <strong>No Duplicate Transactions:</strong>
          When uploading CSV files, existing transactions will not be duplicated. The system automatically checks for
          uniqueness based on the combination of date, description, and amount to prevent duplicate entries.
        </p>
        <p>
          <strong>Data Processing:</strong>
          All processing happens locally in your browser. Your CSV file data is not sent to any external servers.
        </p>

        <spinder-sample-csv></spinder-sample-csv>
      </main>
      <spinder-footer></spinder-footer>
    `;
  }
}
