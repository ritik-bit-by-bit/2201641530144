import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { urlShortenerApi } from '../services/api';
import type { UrlFormData, ShortenedUrlResult, ApiError } from '../types';

interface UrlShortenerProps {
  onUrlsCreated: (results: ShortenedUrlResult[]) => void;
}

const UrlShortener: React.FC<UrlShortenerProps> = ({ onUrlsCreated }) => {
  const [urls, setUrls] = useState<UrlFormData[]>([
    { url: '', validity: 30, shortcode: '' }
  ]);
  const [results, setResults] = useState<ShortenedUrlResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addUrlField = () => {
    if (urls.length < 5) {
      setUrls([...urls, { url: '', validity: 30, shortcode: '' }]);
    }
  };

  const removeUrlField = (index: number) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
    }
  };

  const updateUrlField = (index: number, field: keyof UrlFormData, value: string | number) => {
    const newUrls = [...urls];
    newUrls[index] = { ...newUrls[index], [field]: value };
    setUrls(newUrls);
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    urls.forEach((urlData, index) => {
      if (!urlData.url.trim()) {
        errors.push(`URL ${index + 1}: URL is required`);
      } else if (!validateUrl(urlData.url)) {
        errors.push(`URL ${index + 1}: Invalid URL format`);
      }
      
      if (urlData.validity < 1 || urlData.validity > 525600) {
        errors.push(`URL ${index + 1}: Validity must be between 1 and 525600 minutes`);
      }
      
      if (urlData.shortcode && !/^[a-zA-Z0-9]{3,20}$/.test(urlData.shortcode)) {
        errors.push(`URL ${index + 1}: Shortcode must be 3-20 alphanumeric characters`);
      }
    });

    return { isValid: errors.length === 0, errors };
  };

  const handleSubmit = async () => {
    setError(null);
    setResults([]);
    
    const validation = validateForm();
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    setLoading(true);
    
    try {
      const promises = urls
        .filter(urlData => urlData.url.trim())
        .map(async (urlData) => {
          const requestData = {
            url: urlData.url.trim(),
            validity: urlData.validity,
            shortcode: urlData.shortcode.trim() || undefined,
          };
          
          const response = await urlShortenerApi.createShortUrl(requestData);
          return {
            originalUrl: urlData.url,
            shortLink: response.shortLink,
            expiry: response.expiry,
            shortcode: response.shortLink.split('/').pop() || '',
          };
        });

      const newResults = await Promise.all(promises);
      setResults(newResults);
      onUrlsCreated(newResults);
      
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to create short URLs');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          mb: 2,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800
        }}>
          Create Short URLs
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Transform long URLs into short, shareable links with custom validity periods and tracking capabilities.
        </Typography>
      </Box>

      <Card sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {urls.map((urlData, index) => (
            <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <TextField
                    fullWidth
                    label="Original URL"
                    value={urlData.url}
                    onChange={(e) => updateUrlField(index, 'url', e.target.value)}
                    placeholder="https://example.com/very-long-url"
                    error={!!(urlData.url && !validateUrl(urlData.url))}
                    helperText={urlData.url && !validateUrl(urlData.url) ? 'Invalid URL format' : ''}
                  />
                </Box>
                
                <Box sx={{ width: { xs: '100%', sm: '120px' } }}>
                  <TextField
                    fullWidth
                    label="Validity (minutes)"
                    type="number"
                    value={urlData.validity}
                    onChange={(e) => updateUrlField(index, 'validity', parseInt(e.target.value) || 30)}
                    inputProps={{ min: 1, max: 525600 }}
                  />
                </Box>
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <TextField
                    fullWidth
                    label="Custom Shortcode (optional)"
                    value={urlData.shortcode}
                    onChange={(e) => updateUrlField(index, 'shortcode', e.target.value)}
                    placeholder="mycode123"
                    error={!!(urlData.shortcode && !/^[a-zA-Z0-9]{3,20}$/.test(urlData.shortcode))}
                    helperText={urlData.shortcode && !/^[a-zA-Z0-9]{3,20}$/.test(urlData.shortcode) ? '3-20 alphanumeric characters' : ''}
                  />
                </Box>
                
                <Box sx={{ alignSelf: 'center' }}>
                  {urls.length > 1 && (
                    <Tooltip title="Remove URL">
                      <IconButton
                        color="error"
                        onClick={() => removeUrlField(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </Card>
          ))}

          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mt: 2, 
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addUrlField}
              disabled={urls.length >= 5}
            >
              Add URL ({urls.length}/5)
            </Button>
            
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || urls.every(u => !u.url.trim())}
              startIcon={loading ? <CircularProgress size={20} /> : <LinkIcon />}
            >
              {loading ? 'Creating...' : 'Create Short URLs'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card sx={{ maxWidth: 800, mx: 'auto' }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h6" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'primary.main',
              fontWeight: 600
            }}>
              <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Created Short URLs
            </Typography>
            
            {results.map((result, index) => (
              <Box key={index}>
                <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Original URL:
                        </Typography>
                        <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                          {result.originalUrl}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Short URL:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ wordBreak: 'break-all', flex: 1 }}>
                            {result.shortLink}
                          </Typography>
                          <Tooltip title="Copy to clipboard">
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(result.shortLink)}
                            >
                              <CopyIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Shortcode:
                        </Typography>
                        <Chip label={result.shortcode} variant="outlined" />
                      </Box>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Expires:
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(result.expiry)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Card>
                
                {index < results.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default UrlShortener;
