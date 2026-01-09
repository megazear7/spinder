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
    `,
  ];

  override render(): TemplateResult {
    return html`
      <main>
        <h1>Not Found!</h1>
      </main>
      <spinder-footer></spinder-footer>
    `;
  }
}
