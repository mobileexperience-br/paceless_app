import { privacyDataSections } from './privacyData';
import { privacyRightsSections } from './privacyRights';
import type { LegalContent } from './types';

export const privacy: LegalContent = {
  title: 'Política de privacidade',
  updatedAt: '[DATA]',
  sections: [...privacyDataSections, ...privacyRightsSections],
};
