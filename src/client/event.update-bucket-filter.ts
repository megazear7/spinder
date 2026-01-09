export class UpdateBucketFilterEvent extends Event {
  static readonly eventName = "update-bucket-filter";

  constructor(
    public filterTexts: string[],
    public name: string,
  ) {
    super(UpdateBucketFilterEvent.eventName, { bubbles: true, composed: true });
  }
}
