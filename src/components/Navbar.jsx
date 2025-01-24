import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Tooltip from '@mui/material/Tooltip';
import GitHubIcon from '@mui/icons-material/GitHub';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeContext } from '../context/ThemeContext';

function ResponsiveAppBar() {
  const { isDarkMode, toggleTheme } = useThemeContext();

  const ThemeToggleIcon = () => {
    return isDarkMode ? (
      <Brightness7Icon sx={{ fontSize: 30 }} onClick={toggleTheme} />
    ) : (
      <Brightness4Icon sx={{ fontSize: 30 }} onClick={toggleTheme} />
    );
  };

  return (
    <AppBar position="sticky" sx={{mb: 0}}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo Icon */}
          <Box
            component="img"
            src="/WCALogoSVG.svg" 
            alt="App Logo"
            onClick={() => window.location.reload()}
            title='WhatsApp Chat Analyzer.'
            sx={{
              height: { xs: 40, md: 50 },
              width: { xs: 40, md: 50 },
              mr: 2,
              cursor: 'pointer', // Add cursor pointer
            }}
          />
          <Typography
            variant="h6"
            noWrap
            component="a"
            onClick={() => window.location.reload()}
            title='WhatsApp Chat Analyzer.'
            sx={{
              mr: 2,
              fontFamily: 'monospace',
              fontWeight: {xs: 100, md: 700},
              letterSpacing: '.2rem',
              color: 'inherit',
              textDecoration: 'none',
              cursor: 'pointer', // Add cursor pointer
            }}
          >
              <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                WhatsApp Chat Analyzer
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
                WhatsApp Chat Analyzer
              </Box>
            </Typography>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Theme Toggle Icon */}
          <Tooltip title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
            <IconButton sx={{ p: 0, mr: 2 }}>
              <ThemeToggleIcon />
            </IconButton>
          </Tooltip>

          {/* GitHub Icon */}
          <Tooltip title="GitHub">
            <IconButton sx={{ p: 0, mr: 2 }} onClick={() => window.open("#", "_blank")}>
              <GitHubIcon sx={{ fontSize: 40, color: (theme) => theme.palette.mode === 'dark' ? 'grey' : 'black'}} />
            </IconButton>
          </Tooltip>

        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;

