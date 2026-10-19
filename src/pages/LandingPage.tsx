import { useAppSelector } from '../features/store.ts';
import { getPublicQuizzes } from '../features/quiz/quizSlice.ts';
import { Box } from '@mui/material';
import LandingHeader from '../components/landing/LandingHeader';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import PublicQuizSection from '../components/landing/PublicQuizSection';
import LandingFooter from '../components/landing/LandingFooter';

export default function LandingPage() {
  const quizzes = useAppSelector(getPublicQuizzes);
  const quizListKey = quizzes.length; // Change key when quiz list changes to reset page

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', color: 'text.primary' }}>
      <LandingHeader />
      <Box component="main" sx={{ flex: 1 }}>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PublicQuizSection key={quizListKey} />
      </Box>
      <LandingFooter />
    </Box>
  );
}