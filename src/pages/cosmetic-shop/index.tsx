import {
  Badge,
  Button,
  Card,
  Center,
  Chip,
  Container,
  Divider,
  Group,
  Image,
  Loader,
  MantineColor,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
  createStyles,
  HoverCard,
  Box,
  Grid,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconBrandSpeedtest,
  IconCircleCheck,
  IconPencilMinus,
} from '@tabler/icons-react';
import { IconCheck } from '@tabler/icons-react';
import { IconArrowUpRight } from '@tabler/icons-react';
import { useState } from 'react';
import { ContentClamp } from '~/components/ContentClamp/ContentClamp';
import { DaysFromNow } from '~/components/Dates/DaysFromNow';
import { Meta } from '~/components/Meta/Meta';
import { NoContent } from '~/components/NoContent/NoContent';
import { UserAvatar } from '~/components/UserAvatar/UserAvatar';
import { BuildBudget, BuildFeatures } from '~/server/schema/build-guide.schema';
import { trpc } from '~/utils/trpc';
import { env } from '~/env/client.mjs';
import dayjs from 'dayjs';
import { createServerSideProps } from '~/server/utils/server-side-helpers';
import { useQueryShop } from '~/components/CosmeticShop/cosmetic-shop.util';
import { ImageCSSAspectRatioWrap } from '~/components/Profile/ImageCSSAspectRatioWrap';
import { constants } from '~/server/common/constants';
import { ImageGuard2 } from '~/components/ImageGuard/ImageGuard2';
import { MediaHash } from '~/components/ImageHash/ImageHash';
import { ImagePreview } from '~/components/ImagePreview/ImagePreview';
import { containerQuery } from '~/utils/mantine-css-helpers';
import { useIsMobile } from '~/hooks/useIsMobile';
import { RenderHtml } from '~/components/RenderHtml/RenderHtml';
import { CosmeticShopItemGetById } from '~/types/router';
import { CurrencyBadge } from '~/components/Currency/CurrencyBadge';
import { Currency } from '@prisma/client';
import { CosmeticSample } from '~/pages/moderator/cosmetic-store/cosmetics';
import { triggerRoutedDialog } from '~/components/Dialog/RoutedDialogProvider';
import { dialogStore } from '~/components/Dialog/dialogStore';
import { CosmeticShopItemPreviewModal } from '~/components/CosmeticShop/CosmeticShopItemPreviewModal';
import { EdgeMedia } from '~/components/EdgeMedia/EdgeMedia';
import { CosmeticShopSectionMeta } from '~/server/schema/cosmetic-shop.schema';
import { openUserProfileEditModal } from '~/components/Modals/UserProfileEditModal';
import { getEdgeUrl } from '~/client-utils/cf-images-utils';
import { formatDate } from '~/utils/date-helpers';

const IMAGE_SECTION_WIDTH = 1288;

const useStyles = createStyles((theme) => ({
  section: {
    overflow: 'hidden',
    position: 'relative',

    [theme.fn.smallerThan('sm')]: {
      padding: theme.spacing.md,
    },
  },

  sectionHeaderContainer: {
    overflow: 'hidden',
    position: 'relative',
    height: 250,

    [theme.fn.smallerThan('sm')]: {
      marginLeft: -theme.spacing.md,
      marginRight: -theme.spacing.md,
    },
  },

  sectionHeaderContainerWithBackground: {
    background: 'transparent',
    borderRadius: theme.radius.md,
  },

  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.4,
    zIndex: -1,
  },

  sectionHeaderContentWrap: {
    position: 'absolute',
    zIndex: 1,
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },

  sectionTitle: {
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    width: '100%',
    padding: theme.spacing.lg,
    textShadow: '2px 2px 2px rgba(0,0,0,0.5)',
    // [theme.fn.smallerThan('sm')]: {
    //   fontSize: 18,
    // },
  },

  hideMobile: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },
  hideDesktop: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },
  card: {
    height: '100%',
    background: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  cardHeader: {
    background: theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2],
    margin: -theme.spacing.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    height: 250,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  availability: {
    position: 'absolute',
    top: '-2px',
    right: '-5px',
  },
}));

export const getServerSideProps = createServerSideProps({
  useSSG: true,
  useSession: true,
  resolver: async ({ ssg, features }) => {
    if (!features?.cosmeticShop) return { notFound: true };

    await ssg?.cosmeticShop.getShop.prefetch();
  },
});

export const CosmeticShopItem = ({ item }: { item: CosmeticShopItemGetById }) => {
  const cosmetic = item.cosmetic;
  const { classes } = useStyles();
  const isAvailable =
    (item.availableQuantity ?? null) === null || (item.availableQuantity ?? 0) > 0;

  const availableFrom = item.availableFrom ? formatDate(item.availableFrom) : null;
  const availableTo = item.availableTo ? formatDate(item.availableTo) : null;

  return (
    <Paper className={classes.card}>
      {availableTo && (
        <Badge variant="solid" color="yellow.8" className={classes.availability}>
          Available until {availableTo}
        </Badge>
      )}
      <Stack h="100%">
        <Stack spacing="md">
          <Box className={classes.cardHeader}>
            <CosmeticSample cosmetic={cosmetic} size="lg" />
          </Box>
          <Stack spacing={4} align="flex-start">
            <CurrencyBadge
              currency={Currency.BUZZ}
              unitAmount={item.unitAmount}
              // @ts-ignore
              variant="transparent"
              px={0}
            />
            <Title order={3}>{item.title}</Title>
          </Stack>
          {!!item.description && (
            <ContentClamp maxHeight={200}>
              <RenderHtml html={item.description} />
            </ContentClamp>
          )}
        </Stack>
        <Stack mt="auto" spacing={4}>
          {(item.availableQuantity ?? null) !== null && (
            <>
              {(item.availableQuantity ?? 0) > 0 ? (
                <Group mx="auto">
                  <Text size="xs" align="center" color="yellow.7">
                    {item.availableQuantity} remaining
                  </Text>
                </Group>
              ) : (
                <Text size="xs" align="center" color="red">
                  Out of stock
                </Text>
              )}
            </>
          )}
          <Button
            color="gray"
            radius="xl"
            onClick={() => {
              dialogStore.trigger({
                component: CosmeticShopItemPreviewModal,
                props: { shopItem: item },
              });
            }}
            disabled={!isAvailable}
          >
            Preview
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default function CosmeticShopMain() {
  const { classes, cx } = useStyles();
  const { cosmeticShopSections, isLoading } = useQueryShop();
  const isMobile = useIsMobile();

  return (
    <>
      <Meta
        title="Civitai Cosmetic Shop | Created with Love & AI"
        description="Civitai Cosmetic Shop is a place where you can find the best cosmetic products to really express youself."
        links={[{ href: `${env.NEXT_PUBLIC_BASE_URL}/builds`, rel: 'canonical' }]}
      />
      <Container size="xl">
        <Stack spacing="xl">
          <Stack spacing={0}>
            <Group noWrap position="apart">
              <Title>Civitai Cosmetic Shop</Title>
              <Button
                leftIcon={<IconPencilMinus size={16} />}
                onClick={() => {
                  openUserProfileEditModal({});
                }}
                sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}
                radius="xl"
                compact
              >
                Edit profile
              </Button>
            </Group>
            <Text size="sm" color="dimmed" mb="sm">
              Any cosmetic purchases directly contributes to Civitai ❤️
            </Text>
          </Stack>
          {isLoading ? (
            <Center p="xl">
              <Loader />
            </Center>
          ) : cosmeticShopSections?.length > 0 ? (
            cosmeticShopSections.map((section) => {
              const { image, items } = section;
              const meta = section.meta as CosmeticShopSectionMeta;
              const backgroundImageUrl = image
                ? getEdgeUrl(image.url, { width: IMAGE_SECTION_WIDTH, optimized: true })
                : undefined;

              return (
                <Stack key={section.id} className={classes.section}>
                  <Box
                    className={cx(classes.sectionHeaderContainer, {
                      [classes.sectionHeaderContainerWithBackground]: !!image,
                    })}
                  >
                    <Box
                      className={cx({ [classes.sectionHeaderContentWrap]: !!image })}
                      style={
                        backgroundImageUrl
                          ? {
                              backgroundImage: `url(${backgroundImageUrl})`,
                              backgroundPosition: 'left center',
                            }
                          : undefined
                      }
                    >
                      {!meta?.hideTitle && (
                        <Stack mih="100%" justify="center" style={{ flexGrow: 1 }}>
                          <Title order={2} className={classes.sectionTitle} align="center">
                            {section.title}
                          </Title>
                        </Stack>
                      )}
                    </Box>
                  </Box>

                  <Stack>
                    {section.description && (
                      <ContentClamp maxHeight={200}>
                        <RenderHtml html={section.description} />
                      </ContentClamp>
                    )}
                  </Stack>

                  <Grid>
                    {items.map((item) => {
                      const { shopItem } = item;
                      return (
                        <Grid.Col span={6} md={3} key={shopItem.id}>
                          <CosmeticShopItem item={shopItem} />
                        </Grid.Col>
                      );
                    })}
                  </Grid>
                </Stack>
              );
            })
          ) : (
            <NoContent message="It looks like we're still working on some changes. Please come back later." />
          )}
        </Stack>
      </Container>
    </>
  );
}
