import z from "zod";

export const UpdateLabelFilterEventName = z.literal("UpdateLabelFilter");
export type UpdateLabelFilterEventName = z.infer<typeof UpdateLabelFilterEventName>;

export const UpdateLabelFilterEventDetail = z.object({
  labelId: z.string().optional(),
  labelName: z.string().optional(),
});
export type UpdateLabelFilterEventDetail = z.infer<typeof UpdateLabelFilterEventDetail>;

export const UpdateLabelFilterEventData = z.object({
  name: UpdateLabelFilterEventName,
  detail: UpdateLabelFilterEventDetail,
});
export type UpdateLabelFilterEventData = z.infer<typeof UpdateLabelFilterEventData>;

export const createUpdateLabelFilterEvent = (labelId?: string, labelName?: string): UpdateLabelFilterEventData => ({
  name: UpdateLabelFilterEventName.value,
  detail: { labelId, labelName },
});

export class UpdateLabelFilterEvent extends CustomEvent<UpdateLabelFilterEventDetail> {
  static eventName = UpdateLabelFilterEventName.value;

  constructor(labelId?: string, labelName?: string) {
    super(UpdateLabelFilterEvent.eventName, {
      detail: { labelId, labelName },
      bubbles: true,
      composed: true,
    });
  }
}
