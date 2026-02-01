import z from "zod";
import { ModelSubmitEventData } from "./event.modal-submit.js";
import { NavigationEventData } from "./event.navigation.js";
import { ScrollToEventData } from "./event.scroll-to.js";
import { WarningEventData } from "./event.warning.js";
import { SuccessEventData } from "./event.success.js";
import { SaveEventData } from "./event.save.js";
import { ModelClosingEventData } from "./event.modal-closing.js";
import { ModelOpeningEventData } from "./event.modal-opening.js";
import { UpdateLabelFilterEventData } from "./event.update-label-filter.js";

export const SpinderEvent = z.union([
  ModelSubmitEventData,
  ModelOpeningEventData,
  ModelClosingEventData,
  NavigationEventData,
  ScrollToEventData,
  WarningEventData,
  SuccessEventData,
  SaveEventData,
  UpdateLabelFilterEventData,
]);
export type SpinderEvent = z.infer<typeof SpinderEvent>;

export const stopProp = (event: Event): void => {
  event.stopPropagation();
};

export const dispatch = (element: HTMLElement, event: SpinderEvent): void => {
  element.dispatchEvent(
    new CustomEvent(event.name, {
      detail: event.detail,
      bubbles: true,
      composed: true,
    }),
  );
};
