import { css, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { globalStyles } from "./styles.global.js";
import { SpinderAppProvider } from "./provider.app.js";
import "./component.csv-upload.js";
import "./component.pagination-table.js";
import "./component.buckets.js";
import "./component.filters.js";
import "./component.footer.js";
import "./component.time-series-chart.js";

@customElement("spinder-home-page")
export class SpinderHomePage extends SpinderAppProvider {
  static override styles = [
    globalStyles,
    css`
      main {
        text-align: center;
      }

      h1 img {
        height: 100px;
      }
    `,
  ];

  override render(): TemplateResult {
    return html`
      <main>
        <h1 title="Spinder"><img src="logo/logo-text.png" /></h1>
        <spinder-filters></spinder-filters>
        <spinder-csv-upload></spinder-csv-upload>
        <spinder-buckets></spinder-buckets>
        <spinder-time-series-chart></spinder-time-series-chart>
        <spinder-pagination-table></spinder-pagination-table>
      </main>
      <spinder-footer></spinder-footer>
    `;
  }
}
