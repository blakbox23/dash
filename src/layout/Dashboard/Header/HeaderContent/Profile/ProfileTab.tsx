import { useState, useEffect } from 'react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  CircularProgress,
  useTheme,
  Autocomplete
} from '@mui/material';
import { EditOutlined, LogoutOutlined } from '@ant-design/icons';

interface Props {
  handleLogout: () => void;
}

interface Station {
  id: string;
  name: string;
}

const ProfileTab = ({ handleLogout }: Props) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStations, setSelectedStations] = useState<string[]>([]);

  useEffect(() => {
    // Simulate fetching user data
    setTimeout(() => {
      setName('John Doe');
      setEmail('john.doe@example.com');
      setStations([
        { id: '1', name: 'Kibera Station' },
        { id: '2', name: 'Industrial Area Station' },
        { id: '3', name: 'CBD Station' },
        { id: '4', name: 'Westlands Station' }
      ]);
      setSelectedStations(['2', '4']);
      setLoading(false);
    }, 800);
  }, []);

  const handleSave = () => {
    // TODO: send updated data to backend
    console.log({ name, email, selectedStations });
    setOpen(false);
  };

  return (
    <>
      <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
        <ListItemButton onClick={() => setOpen(true)}>
          <ListItemIcon>
            <EditOutlined />
          </ListItemIcon>
          <ListItemText primary="Edit Profile" />
        </ListItemButton>

        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <LogoutOutlined />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            bgcolor: theme.palette.background.paper
          }
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: '1.25rem',
            textAlign: 'center',
            pb: 0
          }}
        >
          Edit Profile
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                margin="normal"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  options={stations}
                  getOptionLabel={(option) => option.name}
                  value={stations.filter((s) => selectedStations.includes(s.id))}
                  onChange={(_, newValue) => setSelectedStations(newValue.map((s) => s.id))}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip label={option.name} {...getTagProps({ index })} key={option.id} sx={{ borderRadius: 1 }} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Report Stations" placeholder="Add station..." margin="normal" />
                  )}
                  fullWidth
                />
              </FormControl>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary" sx={{ borderRadius: 2 }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileTab;
