/**
 * Default candidate-info field config used when a quiz has no owner-
 * customized `candidateFieldsConfig`. Mirrors the layout that previously
 * lived inline in `CandidateInfoDemoPage` (Personal Information section
 * with first name, last name, and email).
 */
import type { CandidateFieldsConfig } from '../../types/candidate';

export const DEFAULT_CANDIDATE_FIELDS_CONFIG: CandidateFieldsConfig = {
  sections: [
    {
      id: 'personal',
      title: 'Personal Information',
      order: 1,
    },
  ],
  fields: [
    {
      id: 'firstname',
      type: 'text',
      label: 'First Name',
      required: true,
      order: 1,
      section: 'personal',
    },
    {
      id: 'lastname',
      type: 'text',
      label: 'Last Name',
      required: true,
      order: 2,
      section: 'personal',
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email',
      required: true,
      order: 3,
      section: 'personal',
    },
  ],
};
