import { Box, Button, Typography, Paper } from '@mui/material';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PublishIcon from '@mui/icons-material/Publish';

export default function SaveBar() {
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'sticky',
        bottom: 0,
        zIndex: 1100,
        borderTop: 1,
        borderColor: 'divider',
        borderRadius: 0,
        px: 3,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CloudDoneIcon sx={{ fontSize: 18, color: 'success.main' }} />
        <Typography variant="caption" color="text.secondary">
          Changes saved
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" size="small" startIcon={<VisibilityIcon />}>
          Preview
        </Button>
        <Button variant="contained" size="small" startIcon={<PublishIcon />}>
          Publish
        </Button>
      </Box>
    </Paper>
  );
}
