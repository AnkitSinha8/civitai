import dynamic from 'next/dynamic';
import React from 'react';
import { ContainerProvider } from '~/components/ContainerProvider/ContainerProvider';
import { GenerationSidebar } from '~/components/ImageGeneration/GenerationSidebar';
import { MetaPWA } from '~/components/Meta/MetaPWA';
import { onboardingSteps } from '~/components/Onboarding/onboarding.utils';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { useIsClient } from '~/providers/IsClientProvider';
import { Flags } from '~/shared/utils';

const UserBanned = dynamic(() => import('~/components/User/UserBanned'));
const OnboardingWizard = dynamic(() => import('~/components/Onboarding/OnboardingWizard'));

export function BaseLayout({ children }: { children: React.ReactNode }) {
  const currentUser = useCurrentUser();
  const isBanned = currentUser?.bannedAt ?? false;
  const shouldOnboard =
    !!currentUser && !onboardingSteps.every((step) => Flags.hasFlag(currentUser.onboarding, step));

  // const isClient = useIsClient();

  return (
    <>
      <MetaPWA />
      <div
        className={`flex flex-1 overflow-hidden`}
        // style={{ opacity: isClient ? 1 : 0 }}
      >
        {!isBanned && !shouldOnboard && <GenerationSidebar />}
        <ContainerProvider id="main" containerName="main" className="flex-1">
          {isBanned ? (
            <UserBanned />
          ) : shouldOnboard ? (
            <OnboardingWizard
              onComplete={() => {
                return;
              }}
            />
          ) : (
            children
          )}
        </ContainerProvider>
      </div>
      {/* <div className="h-[100px] w-full bg-red-300"></div> */}
    </>
  );
}
