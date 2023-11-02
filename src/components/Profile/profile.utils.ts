import { ProfileSectionSchema, ProfileSectionType } from '~/server/schema/user-profile.schema';

// Used to determine which sections are enabled by default when the user does not have them
// on the profile items' list. This is used such that when we add a new section, if we want to enforce
// all users to have it before they update their profile, we can.
export const defaultProfileSectionStatus: Record<ProfileSectionType, boolean> = {
  showcase: true,
  popularModels: true,
  popularArticles: true,
  recent: true,
  modelsOverview: false,
  imagesOverview: false,
  recentReviews: false,
} as const;

export const profileSectionLabels: Record<ProfileSectionType, string> = {
  showcase: 'Showcase',
  popularModels: 'Most popular models',
  popularArticles: 'Most popular articles',
  recent: 'My recent activity',
  modelsOverview: 'Models overview',
  imagesOverview: 'Images overview',
  recentReviews: 'Recent reviews',
} as const;
export const getAllAvailableProfileSections = (userSections: ProfileSectionSchema[] = []) => {
  console.log({ userSections });
  const sections: ProfileSectionSchema[] = [
    ...userSections,
    ...Object.keys(defaultProfileSectionStatus)
      .filter((k) => !userSections.find((u) => u.key === k))
      .map((k) => ({
        key: k as ProfileSectionSchema['key'],
        enabled: defaultProfileSectionStatus[k as ProfileSectionSchema['key']],
      })),
  ];
  console.log({ sections });

  return sections;
};
