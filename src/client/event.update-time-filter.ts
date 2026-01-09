export class UpdateTimeFilterEvent extends Event {
  static readonly eventName = "update-time-filter";

  constructor(
    public startDate: Date | undefined,
    public endDate: Date | undefined,
    public label: string,
  ) {
    super(UpdateTimeFilterEvent.eventName, { bubbles: true, composed: true });
  }
}
