import { css, html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { globalStyles } from "./styles.global.js";
import { saveTransactions } from "./util.transaction.js";
import { UpdateTransactionsEvent } from "./event.update-transactions.js";

@customElement("spinder-footer")
export class SpinderFooter extends LitElement {
  static override styles = [
    globalStyles,
    css`
      footer {
        background: var(--color-overlay-light);
        border-top: 1px solid var(--color-overlay-strong);
        padding: var(--size-large);
        margin-top: var(--size-large);
      }

      .footer-content {
        width: fit-content;
        margin: 0 auto;
        display: flex;
        flex-wrap: wrap;
        gap: var(--size-large);
        align-items: center;
        justify-content: space-between;
      }

      .footer-links {
        display: flex;
        flex-wrap: wrap;
        gap: var(--size-large);
        align-items: center;
      }

      .footer-link {
        color: var(--color-primary-text);
        text-decoration: none;
        font-size: var(--font-small);
        transition: var(--transition-all);
      }

      .footer-link:hover {
        color: var(--color-accent);
      }

      .footer-link.external::after {
        font-size: var(--font-small);
        opacity: 0.7;
      }

      .footer-link.internal::before {
        opacity: 0.7;
      }

      @media (max-width: 768px) {
        .footer-content {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--size-medium);
        }

        .footer-links {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--size-medium);
        }
      }
    `,
  ];

  override render(): TemplateResult {
    return html`
      <footer>
        <div class="footer-content">
          <div class="footer-links">
            <a href="/csv-help" class="footer-link internal">CSV Upload Help</a>
            <a href="/security" class="footer-link internal">Security & Privacy</a>
            <a href="#" class="footer-link" @click=${this.clearAllTransactions}>Clear All Transactions</a>
            <a
              href="https://www.alexlockhart.me/"
              target="_blank"
              rel="noopener noreferrer"
              class="footer-link external">
              More by Alex Lockhart
            </a>
            <a
              href="https://buymeacoffee.com/alexlockhart"
              target="_blank"
              rel="noopener noreferrer"
              class="footer-link external">
              Buy me a coffee
            </a>
          </div>
        </div>
      </footer>
    `;
  }

  private clearAllTransactions(event: Event): void {
    event.preventDefault();
    if (confirm("Are you sure you want to clear all transactions? This action cannot be undone.")) {
      saveTransactions([]);
      this.dispatchEvent(new UpdateTransactionsEvent({ transactions: [] }));
    }
  }
}
