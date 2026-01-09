import { css, html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { globalStyles } from "./styles.global.js";

@customElement("spinder-not-found-page")
export class SpinderNotFoundPage extends LitElement {
  static override styles = [
    globalStyles,
    css`
      main {
        text-align: center;
        padding: var(--size-large);
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
        background: var(--color-accent);
        color: var(--color-white);
      }

      .btn:hover {
        background: var(--color-accent-dark);
      }
    `,
  ];

  override render(): TemplateResult {
    return html`
      <main>
        <h1>Not Found!</h1>
        <button class="btn" @click=${this.goHome}>Go to Home Page</button>
      </main>
      <spinder-footer></spinder-footer>
    `;
  }

  private goHome(): void {
    window.location.href = "/";
  }
}
