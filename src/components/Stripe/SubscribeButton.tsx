import { useIsMutating } from '@tanstack/react-query';
import { cloneElement, useCallback, useEffect } from 'react';
import { LoginPopover } from '~/components/LoginPopover/LoginPopover';
import { getClientStripe } from '~/utils/get-client-stripe';
import { trpc } from '~/utils/trpc';
import Router from 'next/router';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { Button, Stack, Text } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { showErrorNotification } from '~/utils/notifications';
import { usePaddle } from '~/providers/PaddleProvider';
import { usePaymentProvider } from '~/components/Payments/usePaymentProvider';
import { PaymentProvider } from '@prisma/client';
import { CheckoutEventsData } from '@paddle/paddle-js';
import { useActiveSubscription } from '~/components/Stripe/memberships.util';

function StripeSubscribeButton({ children, priceId, onSuccess, disabled }: Props) {
  const queryUtils = trpc.useUtils();
  const currentUser = useCurrentUser();
  const mutateCount = useIsMutating();

  const { mutate: stripeCreateSubscriptionSession, isLoading } =
    trpc.stripe.createSubscriptionSession.useMutation({
      async onSuccess({ sessionId, url }) {
        await currentUser?.refresh();
        await queryUtils.subscriptions.getUserSubscription.reset();
        onSuccess?.();
        if (url) Router.push(url);
        else if (sessionId) {
          const stripe = await getClientStripe();
          if (!stripe) {
            return;
          }
          await stripe.redirectToCheckout({ sessionId });
        }
      },
      async onError(error) {
        showErrorNotification({
          title: 'Sorry, there was an error while trying to subscribe. Please try again later',
          error: new Error(error.message),
        });
      },
    });

  const handleClick = () => {
    stripeCreateSubscriptionSession({ priceId });
  };

  return (
    <LoginPopover>
      {typeof children === 'function'
        ? children({
            onClick: handleClick,
            loading: isLoading,
            disabled: (!isLoading && mutateCount > 0) || disabled,
          })
        : cloneElement(children, {
            onClick: handleClick,
            loading: isLoading,
            disabled: (!isLoading && mutateCount > 0) || disabled,
          })}
    </LoginPopover>
  );
}

function PaddleSubscribeButton({ children, priceId, onSuccess, disabled }: Props) {
  const queryUtils = trpc.useUtils();
  const currentUser = useCurrentUser();
  const mutateCount = useIsMutating();
  const { subscription, subscriptionLoading } = useActiveSubscription();
  const { paddle, emitter } = usePaddle();

  const { mutate: paddleUpdateSubscription, isLoading } =
    trpc.paddle.updateSubscription.useMutation({
      async onSuccess() {
        await currentUser?.refresh();
        await queryUtils.subscriptions.getUserSubscription.reset();
        onSuccess?.();
        return Router.push('/user/membership?updated=true');
      },
      async onError(error) {
        showErrorNotification({
          title: 'Sorry, there was an error while trying to subscribe. Please try again later',
          error: new Error(error.message),
        });
      },
    });

  const handleClick = () => {
    if (subscription) {
      paddleUpdateSubscription({ priceId });
    } else {
      paddle?.Checkout.open({
        items: [
          {
            priceId,
            quantity: 1,
          },
        ],
        customer: {
          email: currentUser?.email as string,
        },
        settings: {
          showAddDiscounts: false,
          theme: 'dark',
        },
      });
    }
  };

  const trackCheckout = useCallback(
    async (data?: CheckoutEventsData) => {
      if (data?.items.some((item) => item.price_id === priceId)) {
        // This price was purchased...:
        await currentUser?.refresh();
        onSuccess?.();
      }
    },
    [priceId, currentUser, onSuccess]
  );

  useEffect(() => {
    if (emitter) {
      emitter.on('checkout.completed', trackCheckout);
    }
    return () => {
      emitter?.off('checkout.completed', trackCheckout);
    };
  }, [emitter, trackCheckout]);

  return (
    <LoginPopover>
      {typeof children === 'function'
        ? children({
            onClick: handleClick,
            loading: isLoading,
            disabled: (!isLoading && mutateCount > 0) || subscriptionLoading || disabled,
          })
        : cloneElement(children, {
            onClick: handleClick,
            loading: isLoading,
            disabled: (!isLoading && mutateCount > 0) || subscriptionLoading || disabled,
          })}
    </LoginPopover>
  );
}

export function SubscribeButton({ children, priceId, onSuccess, disabled }: Props) {
  const currentUser = useCurrentUser();
  const paymentProvider = usePaymentProvider();
  const { subscriptionPaymentProvider } = useActiveSubscription();

  const provider = subscriptionPaymentProvider ?? paymentProvider;

  const handleAddEmail = () => {
    openContextModal({
      modal: 'onboarding',
      title: 'Your Account',
      withCloseButton: false,
      closeOnClickOutside: false,
      closeOnEscape: false,
      innerProps: {},
    });
  };

  if (currentUser && !currentUser.email)
    return (
      <Button onClick={handleAddEmail} sx={{ height: 50 }}>
        <Stack align="center" spacing={0}>
          <Text align="center" sx={{ lineHeight: 1.1 }}>
            Subscribe
          </Text>
          <Text align="center" size="xs" sx={{ color: 'rgba(255,255,255,.7)' }}>
            *Email Required. Click here to set it.
          </Text>
        </Stack>
      </Button>
    );

  if (provider === PaymentProvider.Stripe) {
    return (
      <StripeSubscribeButton priceId={priceId} onSuccess={onSuccess} disabled={disabled}>
        {children}
      </StripeSubscribeButton>
    );
  }

  if (provider === PaymentProvider.Paddle) {
    // Default to Paddle:
    return (
      <PaddleSubscribeButton priceId={priceId} onSuccess={onSuccess} disabled={disabled}>
        {children}
      </PaddleSubscribeButton>
    );
  }

  return null;
}

type Props = {
  children:
    | React.ReactElement
    | ((props: {
        onClick: () => void;
        disabled?: boolean;
        loading: boolean;
      }) => React.ReactElement);
  priceId: string;
  onSuccess?: () => void;
  disabled?: boolean;
};
