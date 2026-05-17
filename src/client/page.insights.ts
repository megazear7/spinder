import { css, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { globalStyles } from "./styles.global.js";
import { SpinderAppProvider } from "./provider.app.js";
import "./component.filters.js";
import "./component.footer.js";
import "./component.nav.js";
import "./component.time-series-chart.js";

@customElement("spinder-insights-page")
export class SpinderInsightsPage extends SpinderAppProvider {
  static override styles = [
    globalStyles,
    css`
      main {
        text-align: center;
      }

      h1 {
        margin-top: 0;
      }
    `,
  ];

  override render(): TemplateResult {
    return html`
      <spinder-nav></spinder-nav>
      <main>
        <h1>Insights</h1>
        <spinder-filters></spinder-filters>
        <spinder-time-series-chart></spinder-time-series-chart>
      </main>
      <spinder-footer></spinder-footer>
    `;
  }
}
