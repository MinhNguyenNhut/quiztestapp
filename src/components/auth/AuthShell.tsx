import type { ReactNode } from 'react';
import {
  Box,
  Stack,
  Typography,
} from '@mui/material';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
const BRAND_GRADIENT = 'linear-gradient(150deg, #4F46E5 0%, #7C3AED 55%, #A855F7 100%)';

interface AuthShellProps {
  /** Icon rendered inside the gradient chip above the form heading. */
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}

/**
 * Split-screen auth layout:
 * - Left: decorative brand panel (hidden below `md`).
 * - Right: centered form area with heading + children.
 */
export default function AuthShell({ icon, title, subtitle, children }: AuthShellProps) {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {/* ── Brand panel (desktop only) ─────────────────────────────── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          background: BRAND_GRADIENT,
        }}
      >
        {/* Decorative blurred circles */}
        <Box
          sx={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            top: -120,
            right: -120,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.06)',
            bottom: -80,
            left: -60,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 110,
            height: 110,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.10)',
            top: 140,
            right: 100,
          }}
        />

        {/* Logo row */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', position: 'relative' }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <ArrowBack onClick={() => navigate('/')} sx={{ color: '#fff' }} />
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor: 'rgba(255, 255, 255, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(6px)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <QuizOutlinedIcon sx={{ color: '#fff' }} />
          </Box>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, letterSpacing: 0.5 }}>
            QuizTest
          </Typography>
        </Stack>

        {/* Central glass emblem */}
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            display: 'grid',
            placeItems: 'center',
            my: 6,
          }}
        >
          <Box
            sx={{
              width: 190,
              height: 190,
              borderRadius: '50%',
              border: '2px dashed rgba(255, 255, 255, 0.35)',
              display: 'grid',
              placeItems: 'center',
              '@keyframes auth-spin': {
                from: { transform: 'rotate(0deg)' },
                to: { transform: 'rotate(360deg)' },
              },
              animation: 'auth-spin 45s linear infinite',
            }}
          >
            <Box
              sx={{
                width: 132,
                height: 132,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(8px)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <QuizOutlinedIcon sx={{ fontSize: 64, color: '#fff' }} />
            </Box>
          </Box>
        </Box>

        {/* Feature icon strip */}
        <Stack direction="row" spacing={2} sx={{ position: 'relative' }}>
          {[GroupOutlinedIcon, EmojiEventsOutlinedIcon, AutoAwesomeOutlinedIcon].map((Icon, index) => (
            <Box
              key={index}
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                bgcolor: 'rgba(255, 255, 255, 0.14)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(6px)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Icon sx={{ color: '#fff' }} />
            </Box>
          ))}
        </Stack>
      </Box>

      {/* ── Form panel ─────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2.5, sm: 4 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 460 }}>
          {/* Mobile logo (brand panel is hidden on small screens) */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', justifyContent: 'center', mb: 3 }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                background: BRAND_GRADIENT,
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)',
              }}
            >
              <QuizOutlinedIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              QuizTest
            </Typography>
          </Stack>

          {/* Heading */}
          <Stack spacing={1} sx={{ mb: 3.5 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                background: BRAND_GRADIENT,
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 10px 24px rgba(99, 102, 241, 0.35)',
                mb: 1,
              }}
            >
              {icon}
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
              {title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          </Stack>

          {children}
        </Box>
      </Box>
    </Box>
  );
}

