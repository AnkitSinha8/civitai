import { CosmeticEntity } from '@prisma/client';
import { z } from 'zod';
import { paginationSchema } from '~/server/schema/base.schema';

export type GetPaginatedCosmeticsInput = z.infer<typeof getPaginatedCosmeticsSchema>;
export const getPaginatedCosmeticsSchema = paginationSchema.merge(
  z.object({
    limit: z.coerce.number().min(1).max(200).default(60),
  })
);

export type EquipCosmeticInput = z.infer<typeof equipCosmeticSchema>;
export const equipCosmeticSchema = z.object({
  cosmeticId: z.number(),
  equippedToId: z.number(),
  equippedToType: z.nativeEnum(CosmeticEntity),
});
