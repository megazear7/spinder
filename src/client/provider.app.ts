import { provide } from "@lit/context";
import { property } from "lit/decorators.js";
import {
  TransactionContext,
  transactionContext,
  BucketFilterContext,
  bucketFilterContext,
  TimeFilterContext,
  timeFilterContext,
} from "./context.js";
import { LoadingStatus } from "../shared/type.loading.js";
import { SpinderAbstractProvider } from "./provider.abstract.js";
import { loadTransactions } from "./util.transaction.js";
import { UpdateTransactionsEvent } from "./event.update-transactions.js";
import { UpdateBucketFilterEvent } from "./event.update-bucket-filter.js";
import { UpdateTimeFilterEvent } from "./event.update-time-filter.js";

export abstract class SpinderAppProvider extends SpinderAbstractProvider {
  @provide({ context: transactionContext })
  @property({ attribute: false })
  transactionContext: TransactionContext = {
    status: LoadingStatus.enum.idle,
  };

  @provide({ context: bucketFilterContext })
  @property({ attribute: false })
  bucketFilterContext: BucketFilterContext = {
    name: "",
    filterText: "",
  };

  @provide({ context: timeFilterContext })
  @property({ attribute: false })
  timeFilterContext: TimeFilterContext = (() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return {
      startDate: sevenDaysAgo,
      endDate: today,
      label: "Last 7 days",
    };
  })();

  override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    this.load();
    this.addEventListener(UpdateTransactionsEvent.eventName, this.handleUpdateTransactionsEvent);
    this.addEventListener(UpdateBucketFilterEvent.eventName, this.handleUpdateBucketFilterEvent);
    this.addEventListener(UpdateTimeFilterEvent.eventName, this.handleUpdateTimeFilterEvent);
  }

  async load(): Promise<void> {
    this.transactionContext = {
      transactions: loadTransactions(),
      status: LoadingStatus.enum.success,
    };
  }

  private handleUpdateTransactionsEvent = (event: Event): void => {
    const updateEvent = event as UpdateTransactionsEvent;
    this.transactionContext = {
      transactions: updateEvent.detail.transactions,
      status: LoadingStatus.enum.success,
    };
  };

  private handleUpdateBucketFilterEvent = (event: Event): void => {
    const updateEvent = event as UpdateBucketFilterEvent;
    this.bucketFilterContext = {
      name: updateEvent.name,
      filterText: updateEvent.filterText,
    };
  };

  private handleUpdateTimeFilterEvent = (event: Event): void => {
    const updateEvent = event as UpdateTimeFilterEvent;
    this.timeFilterContext = {
      startDate: updateEvent.startDate,
      endDate: updateEvent.endDate,
      label: updateEvent.label,
    };
  };
}
