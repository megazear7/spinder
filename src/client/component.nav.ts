import { html, css, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { globalStyles } from "./styles.global.js";

@customElement("spinder-nav")
export class SpinderNav extends LitElement {
  static override styles = [
    globalStyles,
    css`
      nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--size-medium) var(--size-large);
        background: var(--color-overlay-light);
        border-bottom: 1px solid var(--color-overlay-strong);
      }

      .nav-brand {
        display: flex;
        align-items: center;
        gap: var(--size-small);
        text-decoration: none;
      }

      .nav-brand img {
        height: 28px;
      }

      .nav-links {
        display: flex;
        gap: var(--size-medium);
        align-items: center;
      }

      .nav-link {
        padding: var(--size-small) var(--size-medium);
        border-radius: var(--border-radius-medium);
        font-size: var(--font-small);
        font-weight: var(--font-weight-semibold);
        color: var(--color-primary-text-muted);
        text-decoration: none;
        transition: var(--transition-all);
        letter-spacing: var(--letter-spacing-wide);
        text-transform: var(--text-transform-uppercase);
        display: inline-flex;
        align-items: center;
        gap: var(--size-small);
      }

      .nav-link:hover {
        color: var(--color-primary-text);
        background: var(--color-overlay-medium);
      }

      .nav-link.active {
        color: var(--color-accent);
        background: var(--color-accent-light);
      }

      @media (max-width: 768px) {
        nav {
          padding: var(--size-small) var(--size-medium);
        }

        .nav-brand img {
          height: 22px;
        }

        .nav-link {
          padding: var(--size-tiny) var(--size-small);
          font-size: 11px;
        }
      }
    `,
  ];

  private isActive(path: string): boolean {
    return window.location.pathname === path;
  }

  override render(): TemplateResult {
    return html`
      <nav>
        <a href="/" class="nav-brand">
          <img src="/logo/logo-text.png" alt="Spinder" />
        </a>
        <div class="nav-links">
          <a href="/" class="nav-link ${this.isActive("/") ? "active" : ""}">Home</a>
          <a href="/insights" class="nav-link ${this.isActive("/insights") ? "active" : ""}">Insights</a>
        </div>
      </nav>
    `;
  }
}
