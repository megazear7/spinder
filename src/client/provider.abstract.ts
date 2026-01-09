import { LitElement } from "lit";

export abstract class SpinderAbstractProvider extends LitElement {
  abstract load(): Promise<void>;
}
