import type { CandidateFieldsConfig } from '../../types/candidate';

type SupportedLang = 'en' | 'vi';

const LABELS: Record<SupportedLang, {
  sectionPersonal: string;
  firstName: string;
  lastName: string;
  email: string;
}> = {
  en: {
    sectionPersonal: 'Personal Information',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
  },
  vi: {
    sectionPersonal: 'Thông tin cá nhân',
    firstName: 'Tên',
    lastName: 'Họ',
    email: 'Email',
  },
};

export function getDefaultCandidateFieldsConfig(
  lang: string
): CandidateFieldsConfig {
  const l = LABELS[lang as SupportedLang] ?? LABELS.en;

  return {
    sections: [
      { id: 'personal', title: l.sectionPersonal, order: 1 },
    ],
    fields: [
      { id: 'firstname', type: 'text', label: l.firstName, required: true, order: 1, section: 'personal' },
      { id: 'lastname', type: 'text', label: l.lastName, required: true, order: 2, section: 'personal' },
      { id: 'email', type: 'email', label: l.email, required: true, order: 3, section: 'personal' },
    ],
  };
}
