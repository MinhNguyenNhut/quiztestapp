import { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import { v4 as uuidv4 } from 'uuid';
import type { CandidateFieldSection } from '../../types/candidate';

interface CandidateFieldSectionManagerProps {
  sections: CandidateFieldSection[];
  onChange: (sections: CandidateFieldSection[]) => void;
}

/**
 * Add / rename / reorder sections. Sections are stored in display order;
 * `order` is reassigned on every change so callers don't have to keep it
 * in sync.
 */
export default function CandidateFieldSectionManager({ sections, onChange }: CandidateFieldSectionManagerProps) {
  const [newTitle, setNewTitle] = useState('');

  const normalize = (items: CandidateFieldSection[]): CandidateFieldSection[] =>
    items.map((s, i) => ({ ...s, order: i + 1 }));

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    const next: CandidateFieldSection = { id: uuidv4(), title, order: sections.length + 1 };
    onChange(normalize([...sections, next]));
    setNewTitle('');
  };

  const handleRename = (id: string, title: string) => {
    onChange(normalize(sections.map((s) => (s.id === id ? { ...s, title } : s))));
  };

  const handleDelete = (id: string) => {
    onChange(normalize(sections.filter((s) => s.id !== id)));
  };

  const handleMove = (index: number, dir: -1 | 1) => {
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(normalize(next));
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Sections
      </Typography>
      {sections.length === 0 && (
        <Typography variant="caption" color="text.secondary">
          No sections yet. Add one to group fields on the candidate form.
        </Typography>
      )}
      {sections.map((section, i) => (
        <Box key={section.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            value={section.title}
            onChange={(e) => handleRename(section.id, e.target.value)}
            fullWidth
          />
          <IconButton size="small" onClick={() => handleMove(i, -1)} disabled={i === 0} aria-label="Move up">
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleMove(i, 1)}
            disabled={i === sections.length - 1}
            aria-label="Move down"
          >
            <ArrowDownwardIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(section.id)} aria-label="Delete section" color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          placeholder="New section title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          fullWidth
        />
        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAdd} disabled={!newTitle.trim()}>
          Add
        </Button>
      </Box>
    </Stack>
  );
}
