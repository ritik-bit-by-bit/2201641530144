import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Link as LinkIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  Language as LanguageIcon,
  ContentCopy as CopyIcon,
  History as HistoryIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { urlShortenerApi } from '../services/api';
import type { ShortUrlStats, ShortenedUrlResult, ApiError } from '../types';

interface UrlStatisticsProps {
  createdUrls: ShortenedUrlResult[];
}

const UrlStatistics: React.FC<UrlStatisticsProps> = ({ createdUrls }) => {
  const [stats, setStats] = useState<Map<string, ShortUrlStats>>(new Map());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'history' | 'detailed'>('detailed');
  const [selectedUrlIndex, setSelectedUrlIndex] = useState<number | null>(null);

  const fetchStats = async (shortcode: string) => {
    if (loading.has(shortcode) || stats.has(shortcode)) return;

    setLoading(prev => new Set(prev).add(shortcode));
    setError(null);

    try {
      const statsData = await urlShortenerApi.getStats(shortcode);
      setStats(prev => new Map(prev).set(shortcode, statsData));
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch statistics');
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(shortcode);
        return newSet;
      });
    }
  };

  const refreshAllStats = async () => {
    setError(null);
    const promises = createdUrls.map(url => fetchStats(url.shortcode));
    await Promise.all(promises);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const getStatusChip = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const isExpired = now > expiry;
    
    if (isExpired) {
      return (
        <Chip
          label="Expired"
          color="error"
          size="small"
          sx={{
            fontWeight: 600,
            '& .MuiChip-label': {
              fontSize: '0.75rem'
            }
          }}
        />
      );
    } else {
      const timeLeft = expiry.getTime() - now.getTime();
      const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));
      
      if (hoursLeft <= 1) {
        return (
          <Chip
            label="Expires Soon"
            size="small"
            sx={{
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              color: '#f59e0b',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              fontWeight: 600,
              '& .MuiChip-label': {
                fontSize: '0.75rem'
              }
            }}
          />
        );
      } else {
        return (
          <Chip
            label="Active"
            color="success"
            size="small"
            sx={{
              fontWeight: 600,
              '& .MuiChip-label': {
                fontSize: '0.75rem'
              }
            }}
          />
        );
      }
    }
  };

  useEffect(() => {
    if (createdUrls.length > 0) {
      refreshAllStats();
    }
  }, [createdUrls]);

  // Auto-select first URL when switching to detailed view
  useEffect(() => {
    if (activeSection === 'detailed' && createdUrls.length > 0 && selectedUrlIndex === null) {
      setSelectedUrlIndex(0);
    }
  }, [activeSection, createdUrls.length, selectedUrlIndex]);

  if (createdUrls.length === 0) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          <TrendingUpIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          URL Statistics
        </Typography>
        
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <TrendingUpIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No URLs Created Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create some short URLs to view their statistics here.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 3 } }}>

      {/* Navigation Buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        gap: 2,
        mb: 4,
        maxWidth: 800,
        mx: 'auto'
      }}>
        <Button
          variant={activeSection === 'history' ? 'contained' : 'outlined'}
          onClick={() => setActiveSection('history')}
          startIcon={<HistoryIcon />}
          sx={{ minWidth: 160 }}
        >
          URL History
        </Button>
        <Button
          variant={activeSection === 'detailed' ? 'contained' : 'outlined'}
          onClick={() => setActiveSection('detailed')}
          startIcon={<AnalyticsIcon />}
          sx={{ minWidth: 160 }}
        >
          Detailed Stats
        </Button>
      </Box>

      {/* Conditional Content Based on Active Section */}
      {activeSection === 'history' && createdUrls.length > 0 && (
        <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ 
            color: 'primary.main',
            fontWeight: 600,
            mb: 3,
            textAlign: 'center'
          }}>
            📊 URL History
          </Typography>
          
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: 'text.primary',
                fontWeight: 600,
                mb: 2
              }}>
                Recent URLs ({createdUrls.length})
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(300px, 1fr))' },
                gap: 2
              }}>
                {createdUrls.map((url, index) => {
                  const urlStats = stats.get(url.shortcode);
                  const isLoading = loading.has(url.shortcode);
                  
                  return (
                    <Card 
                      key={index} 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => {
                        // Scroll to the detailed accordion
                        const accordionElement = document.getElementById(`accordion-${index}`);
                        if (accordionElement) {
                          accordionElement.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <LinkIcon color="primary" sx={{ fontSize: '1.2rem' }} />
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600,
                            color: 'primary.main',
                            wordBreak: 'break-all'
                          }}>
                            {url.shortLink}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          mb: 2,
                          wordBreak: 'break-all',
                          fontSize: '0.8rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {url.originalUrl}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            {getStatusChip(url.expiry)}
                            {isLoading && <CircularProgress size={16} />}
                            {urlStats && (
                              <Chip
                                icon={<TrendingUpIcon />}
                                label={`${urlStats.totalClicks} clicks`}
                                variant="outlined"
                                color="primary"
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  '& .MuiChip-label': {
                                    fontSize: '0.7rem'
                                  }
                                }}
                              />
                            )}
                          </Box>
                          
                          <Typography variant="caption" color="text.secondary">
                            {urlStats ? formatRelativeTime(urlStats.createdAt) : 'Loading...'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
              
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  💡 Click on any URL card above to view detailed statistics
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {activeSection === 'detailed' && (
        <Box sx={{ 
          display: 'flex', 
          gap: 3, 
          maxWidth: 1400, 
          mx: 'auto',
          flexDirection: { xs: 'column', lg: 'row' }
        }}>
          {/* Quick Access Sidebar */}
          <Box sx={{ 
            width: { xs: '100%', lg: '350px' },
            flexShrink: 0
          }}>
            <Typography variant="h5" gutterBottom sx={{ 
              color: 'primary.main',
              fontWeight: 600,
              mb: 3,
              textAlign: { xs: 'center', lg: 'left' }
            }}>
              📈 Quick Access
            </Typography>
            
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: 'text.primary',
                  fontWeight: 600,
                  mb: 2,
                  fontSize: '1rem'
                }}>
                  Select URL to View Details
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 1.5,
                  maxHeight: '70vh',
                  overflowY: 'auto'
                }}>
                  {createdUrls.map((url, index) => {
                    const urlStats = stats.get(url.shortcode);
                    const isLoading = loading.has(url.shortcode);
                    
                    return (
                      <Card 
                        key={index} 
                        variant="outlined" 
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          border: selectedUrlIndex === index ? '2px solid' : '1px solid',
                          borderColor: selectedUrlIndex === index ? 'primary.main' : 'divider',
                          backgroundColor: selectedUrlIndex === index ? 'rgba(99, 102, 241, 0.04)' : 'background.paper',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)',
                            borderColor: 'primary.main'
                          }
                        }}
                        onClick={() => setSelectedUrlIndex(index)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LinkIcon color="primary" sx={{ fontSize: '1rem' }} />
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600,
                              color: 'primary.main',
                              wordBreak: 'break-all',
                              fontSize: '0.8rem'
                            }}>
                              {url.shortLink}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            mb: 1.5,
                            wordBreak: 'break-all',
                            fontSize: '0.75rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {url.originalUrl}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                              {getStatusChip(url.expiry)}
                              {isLoading && <CircularProgress size={12} />}
                              {urlStats && (
                                <Chip
                                  icon={<TrendingUpIcon />}
                                  label={`${urlStats.totalClicks}`}
                                  variant="outlined"
                                  color="primary"
                                  size="small"
                                  sx={{
                                    fontWeight: 600,
                                    '& .MuiChip-label': {
                                      fontSize: '0.65rem'
                                    },
                                    '& .MuiChip-icon': {
                                      fontSize: '0.7rem'
                                    }
                                  }}
                                />
                              )}
                            </Box>
                            
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                              {urlStats ? formatRelativeTime(urlStats.createdAt) : 'Loading...'}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Main Content Area */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {selectedUrlIndex !== null && createdUrls[selectedUrlIndex] ? (
              <Box>
                
                {(() => {
                  const url = createdUrls[selectedUrlIndex];
                  const urlStats = stats.get(url.shortcode);
                  const isLoading = loading.has(url.shortcode);

                  return (
                    <Box>
                      {/* URL Header */}
                      <Card sx={{ mb: 3 }}>
                        <CardContent>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2, 
                            flexWrap: 'wrap',
                            justifyContent: 'space-between'
                          }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <LinkIcon color="primary" />
                                <Typography variant="h6" sx={{ 
                                  wordBreak: 'break-all',
                                  fontWeight: 600
                                }}>
                                  {url.shortLink}
                                </Typography>
                                <Tooltip title="Copy short URL">
                                  <IconButton
                                    size="small"
                                    onClick={() => copyToClipboard(url.shortLink)}
                                  >
                                    <CopyIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ 
                                wordBreak: 'break-all',
                                fontSize: '0.875rem'
                              }}>
                                {url.originalUrl}
                              </Typography>
                            </Box>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              flexWrap: 'wrap'
                            }}>
                              {getStatusChip(url.expiry)}
                              {isLoading && <CircularProgress size={20} />}
                              {urlStats && (
                                <Chip
                                  icon={<TrendingUpIcon />}
                                  label={`${urlStats.totalClicks} clicks`}
                                  variant="outlined"
                                  color="primary"
                                  size="small"
                                  sx={{
                                    fontWeight: 600,
                                    '& .MuiChip-label': {
                                      fontSize: '0.75rem'
                                    }
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>

                      {/* Statistics Content */}
                      {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                          <CircularProgress size={40} />
                        </Box>
                      ) : urlStats ? (
                        <Box>
                          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
                            <Box sx={{ flex: 1 }}>
                              <Card variant="outlined" sx={{ height: '100%' }}>
                                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                  <Typography variant="h6" gutterBottom>
                                    <LinkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    URL Details
                                  </Typography>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                      Original URL:
                                    </Typography>
                                    <Typography variant="body1" sx={{ wordBreak: 'break-all', mb: 2 }}>
                                      {urlStats.originalUrl}
                                    </Typography>
                                    
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                      Shortcode:
                                    </Typography>
                                    <Chip label={urlStats.shortcode} variant="outlined" sx={{ mb: 2 }} />
                                    
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                      Created:
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                      {formatDate(urlStats.createdAt)}
                                    </Typography>
                                    
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                      Expires:
                                    </Typography>
                                    <Typography variant="body1">
                                      {formatDate(urlStats.expiresAt)}
                                    </Typography>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Box>
                            
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                              <Card variant="outlined" sx={{ flex: 1 }}>
                                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6">
                                      <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                      Click Statistics
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <Tooltip title="Test click (simulate a click)">
                                        <IconButton
                                          size="small"
                                          onClick={() => {
                                            // Simulate a click by opening the short URL in a new tab
                                            window.open(url.shortLink, '_blank');
                                            // Refresh stats after a short delay
                                            setTimeout(() => fetchStats(url.shortcode), 1000);
                                          }}
                                          sx={{
                                            color: 'secondary.main',
                                            '&:hover': {
                                              backgroundColor: 'rgba(236, 72, 153, 0.1)'
                                            }
                                          }}
                                        >
                                          <LinkIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Refresh click data">
                                        <IconButton
                                          size="small"
                                          onClick={() => fetchStats(url.shortcode)}
                                          disabled={loading.has(url.shortcode)}
                                          sx={{
                                            color: 'primary.main',
                                            '&:hover': {
                                              backgroundColor: 'rgba(99, 102, 241, 0.1)'
                                            }
                                          }}
                                        >
                                          <RefreshIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </Box>
                                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <Typography variant="h3" color="primary" gutterBottom>
                                      {urlStats.totalClicks}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Total Clicks
                                    </Typography>
                                    
                                    {urlStats.totalClicks > 0 && (
                                      <>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                          Last Click:
                                        </Typography>
                                        <Typography variant="body1">
                                          {formatRelativeTime(urlStats.clicks[urlStats.clicks.length - 1]?.timestamp || '')}
                                        </Typography>
                                      </>
                                    )}
                                    
                                    {loading.has(url.shortcode) && (
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                                        <CircularProgress size={20} sx={{ mr: 1 }} />
                                        <Typography variant="caption" color="text.secondary">
                                          Updating...
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                </CardContent>
                              </Card>
                              
                              <Card variant="outlined" sx={{ flex: 1 }}>
                                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                  <Typography variant="h6" gutterBottom>
                                    <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    Click Details
                                  </Typography>
                                  
                                  <Box sx={{ flex: 1, overflow: 'auto' }}>
                                    {urlStats.clicks.length > 0 ? (
                                      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: '100%' }}>
                                        <Table size="small">
                                          <TableHead>
                                            <TableRow>
                                              <TableCell>Timestamp</TableCell>
                                              <TableCell>Referrer</TableCell>
                                              <TableCell>Location</TableCell>
                                              <TableCell>User Agent</TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {urlStats.clicks.map((click, clickIndex) => (
                                              <TableRow key={clickIndex}>
                                                <TableCell>
                                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <AccessTimeIcon fontSize="small" color="action" />
                                                    {formatDate(click.timestamp)}
                                                  </Box>
                                                </TableCell>
                                                <TableCell>
                                                  {click.referrer ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                      <LanguageIcon fontSize="small" color="action" />
                                                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                                        {click.referrer}
                                                      </Typography>
                                                    </Box>
                                                  ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                      Direct
                                                    </Typography>
                                                  )}
                                                </TableCell>
                                                <TableCell>
                                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <LocationIcon fontSize="small" color="action" />
                                                    <Typography variant="body2">
                                                      {click.city || 'Unknown'}, {click.country || 'Unknown'}
                                                    </Typography>
                                                  </Box>
                                                </TableCell>
                                                <TableCell>
                                                  <Tooltip title={click.userAgent || 'Unknown'}>
                                                    <Typography variant="body2" sx={{ 
                                                      maxWidth: 200, 
                                                      overflow: 'hidden', 
                                                      textOverflow: 'ellipsis',
                                                      whiteSpace: 'nowrap'
                                                    }}>
                                                      {click.userAgent || 'Unknown'}
                                                    </Typography>
                                                  </Tooltip>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </TableContainer>
                                    ) : (
                                      <Box sx={{ textAlign: 'center', py: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <Typography variant="body1" color="text.secondary" gutterBottom>
                                          No clicks recorded yet
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          Click details will appear here once the URL is accessed
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                </CardContent>
                              </Card>
                            </Box>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <Typography variant="body1" color="text.secondary" gutterBottom>
                            No statistics available
                          </Typography>
                          <Button
                            variant="outlined"
                            onClick={() => fetchStats(url.shortcode)}
                            startIcon={<RefreshIcon />}
                          >
                            Load Statistics
                          </Button>
                        </Box>
                      )}
                    </Box>
                  );
                })()}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Select a URL from the sidebar
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose any URL from the quick access panel to view its detailed statistics
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UrlStatistics;
