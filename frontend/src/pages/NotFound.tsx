import { Box, Button, Typography, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFoundWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  textAlign: 'center',
}));

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <NotFoundWrapper>
      <Typography
        variant="h1"
        component="h1"
        color="primary"
        sx={{
          fontSize: { xs: '6rem', sm: '8rem' },
          fontWeight: 'bold',
          marginBottom: 2,
        }}
      >
        404
      </Typography>
      <Typography
        variant="h4"
        component="h2"
        gutterBottom
        sx={{ marginBottom: 3 }}
      >
        Page Not Found
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ marginBottom: 4, maxWidth: 500 }}
      >
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<HomeIcon />}
        onClick={() => navigate('/')}
      >
        Back to Home
      </Button>
    </NotFoundWrapper>
  );
};

export default NotFound; 