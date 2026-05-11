import { css, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { RouteConfig, RouteName } from "../shared/type.routes.js";
import { parseRouteParams } from "../shared/util.route-params.js";
import { routes } from "../shared/service.client.js";
import { SpinderAbstractProvider } from "./provider.abstract.js";
import { SpinderToast } from "./component.toast.js";
import { SpinderSaveIndicator } from "./component.save-indicator.js";
import { SaveEventName } from "./event.save.js";
import { NavigationEventName } from "./event.navigation.js";
import { SuccessEventName } from "./event.success.js";
import { WarningEventName } from "./event.warning.js";
import "./page.home.js";
import "./page.csv-help.js";
import "./page.security.js";
import "./page.not-found.js";
import "./component.toast.js";
import "./component.save-indicator.js";

if ("serviceWorker" in navigator && window.location.hostname !== "localhost") {
  navigator.serviceWorker
    .register("/sw.js")
    .then(function (reg) {
      console.debug("Registration succeeded. Scope is " + reg.scope);
    })
    .catch(function (error) {
      console.debug("Registration failed with " + error);
    });
}

@customElement("spinder-app")
export class SpinderApp extends LitElement {
  static override styles = [
    css`
      .app-bar {
        border-top: 3px solid transparent;
        border-image: linear-gradient(to right, var(--color-1) 10%, var(--color-2) 90%) 2;
        position: fixed;
        width: 100%;
        top: 0;
        left: 0;
        z-index: 999;
      }
    `,
  ];
  routes: RouteConfig[] = routes;

  @property({ type: String })
  currentRoute: RouteConfig | null = this.determineRouteName();

  @property({ type: String }) toastMessage = "";
  @property({ type: String }) toastType: "error" | "warning" | "success" | "info" = "info";
  @property({ type: Boolean }) toastVisible = false;
  @query("spinder-toast") toast!: SpinderToast;
  @query("spinder-save-indicator") saveIndicator!: SpinderSaveIndicator;

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("click", this.navigate.bind(this));
    document.addEventListener(WarningEventName.value, (event: Event) => {
      const customEvent = event as CustomEvent;
      this.toast.show(customEvent.detail.message, "warning");
    });
    document.addEventListener(SuccessEventName.value, (event: Event) => {
      const customEvent = event as CustomEvent;
      this.toast.show(customEvent.detail.message, "success");
    });
    document.addEventListener(NavigationEventName.value, (event: Event) => {
      const customEvent = event as CustomEvent;
      window.history.pushState({}, "", customEvent.detail.path);
      this.currentRoute = this.determineRouteName();
      this.requestUpdate();
    });

    this.addEventListener(SaveEventName.value, this.handleSaveEvent);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener(SaveEventName.value, this.handleSaveEvent);
  }

  override render(): TemplateResult {
    const pageContent = this.currentRoute
      ? ((): TemplateResult => {
          switch (this.currentRoute!.name) {
            case RouteName.enum.home:
              return html`
                <div class="app-bar"></div>
                <spinder-home-page></spinder-home-page>
              `;
            case RouteName.enum.csv_help:
              return html`
                <div class="app-bar"></div>
                <spinder-csv-help-page></spinder-csv-help-page>
              `;
            case RouteName.enum.security:
              return html`
                <div class="app-bar"></div>
                <spinder-security-page></spinder-security-page>
              `;
            default:
              return html`
                <div class="app-bar"></div>
                <spinder-not-found-page></spinder-not-found-page>
              `;
          }
        })()
      : html`
          <spinder-not-found-page></spinder-not-found-page>
        `;

    return html`
      ${pageContent}
      <spinder-toast
        .message="${this.toastMessage}"
        .type="${this.toastType}"
        .visible="${this.toastVisible}"
        @close=${this.handleToastClose}></spinder-toast>
      <spinder-save-indicator></spinder-save-indicator>
      <spinder-notification-manager></spinder-notification-manager>
    `;
  }

  determineRouteName(): RouteConfig | null {
    const pathname = window.location.pathname;

    for (const route of this.routes) {
      try {
        const params = parseRouteParams(route.path, pathname);
        if (params !== null) {
          return route;
        }
      } catch {
        // Ignore parsing errors and continue to next route
      }
    }

    return null;
  }

  async navigate(event: Event): Promise<void> {
    let target: HTMLAnchorElement | null = null;
    for (const el of event.composedPath()) {
      if (el instanceof HTMLElement && el.tagName === "A") {
        target = el as HTMLAnchorElement;
        break;
      }
    }

    if (
      target &&
      target.href &&
      !target.hasAttribute("download") &&
      target.target !== "_blank" &&
      target.origin === window.location.origin
    ) {
      event.preventDefault();
      sessionStorage.setItem("previousUrl", "");
      const url = new URL(target.href);
      const path = url.pathname;
      window.history.pushState({}, "", path);
      this.currentRoute = this.determineRouteName();
      this.requestUpdate();
    }
  }

  protected override update(changedProperties: PropertyValues): void {
    super.update(changedProperties);
    if (this.currentRoute != null && changedProperties.has("currentRoute")) {
      const tagName = `spinder-${this.currentRoute.name.replace(/_/g, "-")}-page`;
      const pageElement = this.shadowRoot?.querySelector(tagName);
      const provider = pageElement as SpinderAbstractProvider;
      provider.load().then(() => provider.requestUpdate());
    }
  }

  private handleToastClose(): void {
    this.toastVisible = false;
    this.requestUpdate();
  }

  private handleSaveEvent(): void {
    this.saveIndicator.show();
  }
}
