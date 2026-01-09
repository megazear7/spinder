import { css, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { SpinderAppProvider } from "./provider.app.js";
import { globalStyles } from "./styles.global.js";
import { leftArrowIcon } from "./icons.js";

@customElement("spinder-security-page")
export class SpinderSecurityPage extends SpinderAppProvider {
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
        <h1>Security & Privacy</h1>
        <p>
          At Spinder, your financial data's security and privacy are our top priorities. We believe you should have
          complete control over your personal financial information.
        </p>

        <h2>Local Data Storage</h2>
        <p>
          <strong>Everything stays in your browser:</strong>
          All your transaction data, bucket configurations, and settings are stored locally in your browser's storage.
          No data is ever sent to external servers or cloud services.
        </p>

        <h2>No Data Transmission</h2>
        <p>
          <strong>Zero external communication:</strong>
          Spinder operates entirely offline once loaded. Your financial information never leaves your device or travels
          over the internet.
        </p>

        <h2>Browser-Based Processing</h2>
        <p>
          <strong>Client-side processing:</strong>
          All calculations, filtering, and data analysis happen directly in your browser using JavaScript. This ensures
          your data remains private and secure.
        </p>

        <h2>Data Persistence</h2>
        <p>
          <strong>Your data, your control:</strong>
          Data is stored using your browser's local storage mechanisms. You can clear this data at any time through your
          browser settings, and it's not accessible to anyone else using your device.
        </p>

        <h2>Open Source Transparency</h2>
        <p>
          <strong>Code you can inspect:</strong>
          Spinder is open source, meaning you can review the code to understand exactly how your data is handled and
          ensure there are no hidden data collection practices.
        </p>

        <p>
          If you have any concerns about privacy or security, please review the source code or contact the developer
          directly.
        </p>
      </main>
      <spinder-footer></spinder-footer>
    `;
  }
}
