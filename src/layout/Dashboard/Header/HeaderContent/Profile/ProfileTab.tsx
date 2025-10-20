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
  Chip,
  Box,
  CircularProgress,
  useTheme,
  Autocomplete
} from '@mui/material';
import { EditOutlined, LogoutOutlined } from '@ant-design/icons';
import useAuth from 'hooks/useAuth';
import { getStations } from 'api/maps-api';
import axiosServices from 'utils/axios';

interface Props {
  handleLogout: () => void;
}

interface Station {
  id: string;
  name: string;
}

const ProfileTab = ({ handleLogout }: Props) => {
  const { user } = useAuth(); // assuming updateUser updates context
  const theme = useTheme();

  const [stations, setStations] = useState<Station[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedStations, setSelectedStations] = useState<string[]>([]);

  // fetch stations + populate user info
  useEffect(() => {
    const fetchData = async () => {
      try {
        const stationsData = await getStations();
        setStations(stationsData);

        if (user) {
          setName(user.displayName || '');
          setEmail(user.email || '');
          setSelectedStations(user.reportStations || []);
        }
      } catch (err: any) {
        console.error(err.message || 'Failed to load stations');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        displayName: name,
        reportStations: selectedStations
      };

      const response = await axiosServices.patch(`/api/v1/users/${user.id}`, payload);
      // updateUser?.(response.data); // refresh user context if available
      setOpen(false);
    } catch (err: any) {
      console.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
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
                disabled
              />

              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  options={stations}
                  getOptionLabel={(option) => option.name}
                  value={stations.filter((s) => selectedStations.includes(s.id))}
                  onChange={(_, newValue) =>
                    setSelectedStations(newValue.map((s) => s.id))
                  }
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option.name}
                        {...getTagProps({ index })}
                        key={option.id}
                        sx={{ borderRadius: 1 }}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Report Stations"
                      placeholder="Select stations..."
                      margin="normal"
                    />
                  )}
                />
              </FormControl>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2 }}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileTab;
