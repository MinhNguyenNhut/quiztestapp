import { Box } from '@mui/material';
import LandingHeader from '../components/landing/LandingHeader';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import UseCasesSection from '../components/landing/UseCasesSection';
import PublicQuizSection from '../components/landing/PublicQuizSection';
import FaqSection from '../components/landing/FaqSection';
import CtaBanner from '../components/landing/CtaBanner';
import LandingFooter from '../components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', color: 'text.primary', bgcolor: 'background.default' }}>
      <LandingHeader />
      <Box component="main" sx={{ flex: 1 }}>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <UseCasesSection />
        <PublicQuizSection />
        <FaqSection />
        <CtaBanner />
      </Box>
      <LandingFooter />
    </Box>
  );
}
