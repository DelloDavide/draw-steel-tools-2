import z from "zod";

export const MinionGroupZod = z.object({
  type: z.literal("MINION"),
  id: z.string(),
  name: z.string(),
  nameTagsEnabled: z.boolean(),
  currentStamina: z.number(),
  individualStamina: z.number(),
  statblock: z.string().optional(),
  resourceId: z.string().optional(),
  gmOnly: z.boolean().optional(),
});

export type MinionGroup = z.infer<typeof MinionGroupZod>;
