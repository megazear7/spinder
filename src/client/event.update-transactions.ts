import { Transaction } from "../shared/type.transaction.js";

export class UpdateTransactionsEvent extends Event {
  static readonly eventName = "update-transactions";

  constructor(public detail: { transactions: Transaction[] }) {
    super(UpdateTransactionsEvent.eventName, { bubbles: true, composed: true });
  }
}
