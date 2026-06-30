import CandidateInfoPage from './CandidateInfoPage';
import type { QuizOverview, CandidateFieldsConfig, CandidateFormValues } from '../types/candidate';

// Sample quiz overview configuration
const sampleQuizOverview: QuizOverview = {
  id: 'quiz-001',
  title: 'Introduction to Computer Science',
  description:
    'This quiz tests your knowledge of fundamental computer science concepts including algorithms, data structures, and programming basics. Please ensure you have a stable internet connection before starting.',
  coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
  estimatedTime: 45,
  questionCount: 25,
  passingScore: 70,
  difficulty: 'medium',
  createdBy: 'Dr. Sarah Johnson',
  createdAt: '2024-01-15T10:00:00Z',
};

// Sample fields configuration - this would typically come from the quiz owner
const sampleFieldsConfig: CandidateFieldsConfig = {
  sections: [
    { id: 'personal', title: 'Personal Information', order: 1 },
    { id: 'academic', title: 'Academic Details', order: 2 },
  ],
  fields: [
    // Personal Information Section
    {
      id: 'firstname',
      type: 'text',
      label: 'First Name',
      placeholder: 'Enter your first name',
      required: true,
      order: 1,
      section: 'personal',
    },
    {
      id: 'lastname',
      type: 'text',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      required: true,
      order: 2,
      section: 'personal',
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      required: true,
      order: 3,
      section: 'personal',
    },
    {
      id: 'phone',
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+1 (555) 123-4567',
      required: false,
      order: 4,
      section: 'personal',
    },
    {
      id: 'birthday',
      type: 'date',
      label: 'Date of Birth',
      required: false,
      order: 5,
      section: 'personal',
    },
    {
      id: 'gender',
      type: 'radio',
      label: 'Gender',
      required: false,
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Other', value: 'other' },
        { label: 'Prefer not to say', value: 'undisclosed' },
      ],
      order: 6,
      section: 'personal',
    },
    {
      id: 'address',
      type: 'textarea',
      label: 'Address',
      placeholder: 'Enter your full address',
      required: false,
      validation: {
        maxLength: 200,
      },
      order: 7,
      section: 'personal',
    },

    // Academic Details Section
    {
      id: 'studentId',
      type: 'text',
      label: 'Student ID',
      placeholder: 'Enter your student ID',
      required: true,
      order: 1,
      section: 'academic',
      validation: {
        minLength: 6,
        maxLength: 12,
      },
    },
    {
      id: 'department',
      type: 'select',
      label: 'Department',
      required: true,
      options: [
        { label: 'Computer Science', value: 'cs' },
        { label: 'Information Technology', value: 'it' },
        { label: 'Business', value: 'business' },
        { label: 'Finance', value: 'finance' },
        { label: 'Engineering', value: 'engineering' },
        { label: 'Mathematics', value: 'math' },
      ],
      order: 2,
      section: 'academic',
    },
    {
      id: 'year',
      type: 'select',
      label: 'Year of Study',
      required: true,
      options: [
        { label: 'First Year', value: '1' },
        { label: 'Second Year', value: '2' },
        { label: 'Third Year', value: '3' },
        { label: 'Fourth Year', value: '4' },
        { label: 'Graduate', value: 'graduate' },
      ],
      order: 3,
      section: 'academic',
    },
    {
      id: 'agreeTerms',
      type: 'checkbox',
      label: 'I agree to the quiz terms and conditions',
      required: true,
      order: 4,
      section: 'academic',
    },
  ],
};

/**
 * Demo page showing the CandidateInfoPage with sample configuration
 */
export default function CandidateInfoDemoPage() {
  const handleStartQuiz = (candidateData: CandidateFormValues) => {
    // In a real application, you would:
    // 1. Send the candidate data to your backend
    // 2. Get a session token
    // 3. Navigate to the actual quiz page
    console.log('Candidate Data:', candidateData);
    alert('Starting quiz with candidate data!\nCheck console for data.');
    // Navigate to quiz (for demo purposes)
    // navigate(`/quiz/${sampleQuizOverview.id}/start`, { state: { candidateData } });
  };

  return (
    <CandidateInfoPage
      quiz={sampleQuizOverview}
      fieldsConfig={sampleFieldsConfig}
      onStartQuiz={handleStartQuiz}
    />
  );
}