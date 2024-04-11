import { TRPCClientErrorBase } from '@trpc/client';
import { DefaultErrorShape } from '@trpc/server';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { EquipCosmeticInput, GetPaginatedCosmeticsInput } from '~/server/schema/cosmetic.schema';
import { showErrorNotification } from '~/utils/notifications';
import { trpc } from '~/utils/trpc';

export const useQueryCosmeticsPaged = (
  filters?: Partial<GetPaginatedCosmeticsInput>,
  options?: { keepPreviousData?: boolean; enabled?: boolean }
) => {
  const { data, ...rest } = trpc.cosmetic.getPaged.useQuery({ ...filters }, { ...options });

  if (data) {
    const { items: cosmetics = [], ...pagination } = data;
    return { cosmetics, pagination, ...rest };
  }

  return { cosmetics: [], pagination: null, ...rest };
};

export const useQueryUserCosmetics = () => {
  const currentUser = useCurrentUser();

  return trpc.user.getCosmetics.useQuery(undefined, { enabled: !!currentUser });
};

export const useEquipContentDecoration = () => {
  const queryUtils = trpc.useUtils();

  const sharedMutationOptions = {
    async onSuccess(_: { count: number }, payload: EquipCosmeticInput) {
      const { equippedToType } = payload;

      await queryUtils.user.getCosmetics.invalidate();
      switch (equippedToType) {
        case 'Model':
          await queryUtils.model.getAll.invalidate();
          break;
        case 'Post':
          await queryUtils.post.getInfinite.invalidate();
          break;
        case 'Article':
          await queryUtils.article.getInfinite.invalidate();
          break;
        case 'Image':
          await queryUtils.image.getInfinite.invalidate();
        default:
          break;
      }
    },
    onError(error: TRPCClientErrorBase<DefaultErrorShape>) {
      try {
        // If failed in the FE - TRPC error is a JSON string that contains an array of errors.
        const parsedError = JSON.parse(error.message);
        showErrorNotification({
          title: 'Failed to assign decoration',
          error: parsedError,
        });
      } catch (e) {
        // Report old error as is:
        showErrorNotification({
          title: 'Failed to assign decoration',
          error: new Error(error.message),
        });
      }
    },
  };

  const equipMutation = trpc.cosmetic.equipContentDecoration.useMutation(sharedMutationOptions);
  const unequipMutation = trpc.cosmetic.unequipCosmetic.useMutation(sharedMutationOptions);

  const handleEquipContentDecoration = (data: EquipCosmeticInput) => {
    return equipMutation.mutateAsync(data);
  };

  const handleUnequipContentDecoration = (data: EquipCosmeticInput) => {
    return unequipMutation.mutateAsync(data);
  };

  return {
    equip: handleEquipContentDecoration,
    unequip: handleUnequipContentDecoration,
    isLoading: equipMutation.isLoading || unequipMutation.isLoading,
  };
};
