export const unpublishReasons = {
  'no-posts': {
    optionLabel: 'Missing images',
    notificationMessage: 'Your model does not include example images, or the provided images were removed for violating our Terms of Service. Please upload new example images that adhere to our guidelines.',
  },
  'no-versions': {
    optionLabel: 'Missing version',
    notificationMessage: 'Your model currently has no published versions. Please publish a version to make it available to site users.',
  },
  'no-files': {
    optionLabel: 'Missing files',
    notificationMessage: 'Your model does not include any valid files. Please ensure you have uploaded a valid resource.',
  },
  'mature-real-person': {
    optionLabel: 'Real person(s) displayed in a mature context',
    notificationMessage:
      'Resources designed to depict real people in sexualized or suggestive clothing, poses, or situations are prohibited under our content guidelines.',
  },
  'mature-underage': {
    optionLabel: 'Minors displayed in a mature context',
    notificationMessage:
      'Resources designed to depict minors in sexualized or suggestive clothing, poses, or situations are prohibited under our content guidelines.',
  },
  'photo-real-underage': {
    optionLabel: 'Photorealistic depiction of a minor',
    notificationMessage:
      'Resources designed to depict photorealistic minors are prohibited under our content guidelines.',
  },
  'hate-speech': {
    optionLabel: 'Promotion of hate-speech or targeted attack',
    notificationMessage:
      'Content that attacks, harasses, or discriminates against an individual or group based on their race, ethnicity, nationality, religion, gender, sexual orientation, disability, or any other characteristic is prohibited under our content guidelines.',
  },
  scat: {
    optionLabel: 'Depiction of "scat" or fecal matter',
    notificationMessage:
      'Resources intended to depict excrement ("scat") or fecal matter are prohibited under our content guidelines.',
  },
  violence: {
    optionLabel: 'Prohibited violent activities',
    notificationMessage: 'Resources intended to depict graphic violence, death, extreme gore, or other forms of extreme content are prohibited under our content guidelines.',
  },
  beastiality: {
    optionLabel: 'Depiction of "bestiality"',
    notificationMessage: 'Resources intended to depict sexual activity with animals or any content involving animals in a sexual context are prohibited under our content guidelines.',
  },
  'non-generated-image': {
    optionLabel: 'Images are not generated by the resource',
    notificationMessage:
      'Example images for a resource must either be generated by the resource itself or serve as an aid in demonstrating its use.',
  },
  'unintenteded-use': {
    optionLabel: 'Unintended site use',
    notificationMessage:
      'Content uploaded to Civitai as a model must be a valid resource intended for use in content generation. Models uploaded solely for testing purposes are prohibited.',
  },
  'insufficient-description': {
    optionLabel: 'Insufficient description',
    notificationMessage:
      'Your resource lacks a sufficient description. Please provide a clear and descriptive title along with a detailed resource description. Please tag your model appropriately, and consider including usage tips and any additional information that will help users utilize your content.',
  },
  duplicate: {
    optionLabel: 'Duplicate upload',
    notificationMessage:
      'Your resource matches a previously uploaded resource and is considered a duplicate. Uploading duplicate files is prohibited under our content guidelines.',
  },
  spam: {
    optionLabel: 'Spam or advertorial content',
    notificationMessage:
      'Spam, or advertisements disguised as resources, are strictly prohibited under our Terms of Service.',
  },
  other: {
    optionLabel: 'Other',
    notificationMessage: '',
  },
} as const;

export type UnpublishReason = keyof typeof unpublishReasons;
