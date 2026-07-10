import { Box, Tooltip } from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FlagIcon from '@mui/icons-material/Flag';
import type { PaletteStatus } from './QuestionPalette';

interface PaletteCellProps {
  index: number;
  status: PaletteStatus;
  tooltip: string;
  flagged: boolean;
  isCurrent: boolean;
  onClick: () => void;
}

const bgForStatus: Record<PaletteStatus, string> = {
  unanswered: '#e2e8f0',
  current: '#3b82f6',
  answered: '#22c55e',
  flagged: '#f97316',
  required_unanswered: '#ef4444',
};

const colorForStatus: Record<PaletteStatus, string> = {
  unanswered: '#475569',
  current: '#ffffff',
  answered: '#ffffff',
  flagged: '#ffffff',
  required_unanswered: '#ffffff',
};

export const PaletteCell = ({
  index,
  status,
  tooltip,
  flagged,
  isCurrent,
  onClick,
}: PaletteCellProps) => {
  const bg = isCurrent ? '#3b82f6' : bgForStatus[status];
  const fg = isCurrent ? '#fff' : colorForStatus[status];
  return (
    <Tooltip title={tooltip} arrow placement="top">
      <Box
        component="button"
        type="button"
        onClick={onClick}
        aria-label={`Go to question ${index + 1}${flagged ? ' (flagged)' : ''}`}
        aria-current={isCurrent ? 'true' : undefined}
        sx={{
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: 1.5,
          backgroundColor: bg,
          color: fg,
          border: isCurrent ? '2px solid #1d4ed8' : '1px solid transparent',
          boxShadow: isCurrent ? '0 0 0 3px rgba(59,130,246,0.25)' : 'none',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 14,
          fontFamily: 'inherit',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px -2px rgba(0,0,0,0.15)',
          },
          '&:focus-visible': {
            outline: '2px solid #6366f1',
            outlineOffset: 2,
          },
        }}
      >
        {index + 1}
        {flagged && (
          <Box
            component="span"
            sx={{
              position: 'absolute',
              top: -4,
              right: -4,
              color: '#f97316',
              backgroundColor: '#fff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 16,
              height: 16,
            }}
          >
            <FlagIcon sx={{ fontSize: 12 }} />
          </Box>
        )}
        {status === 'answered' && !flagged && (
          <Box
            component="span"
            sx={{
              position: 'absolute',
              top: -4,
              right: -4,
              color: '#22c55e',
              backgroundColor: '#fff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 16,
              height: 16,
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            ✓
          </Box>
        )}
        {status === 'flagged' && !flagged && (
          <BookmarkIcon
            sx={{ position: 'absolute', top: -6, right: -6, fontSize: 14, color: '#f97316' }}
          />
        )}
      </Box>
    </Tooltip>
  );
};
