export class UpdateBucketFilterEvent extends Event {
  static readonly eventName = "update-bucket-filter";

  constructor(
    public filterText: string,
    public name: string,
  ) {
    super(UpdateBucketFilterEvent.eventName, { bubbles: true, composed: true });
  }
}
