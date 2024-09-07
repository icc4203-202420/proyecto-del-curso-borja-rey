import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Button, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import './BarShow.css';


function BeerShow() {
  const { id } = useParams();
  const [beer, setBeer] = useState(null);
  const [bars, setBars] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleViewClick = (id) => {
    navigate(`/bars/${id}`);
  };
  
  useEffect(() => {
    const fetchBeer = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/v1/beers/${id}`);
        const data = await response.json();
        setBeer(data);
      } catch (error) {
        console.error('Error fetching beer:', error);
      } 
    };
    const fetchBars = async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/v1/beers/${id}/bars`);
          const data = await response.json();
          setBars(data.bars);
        } catch (error) {
          console.error('Error fetching bars:', error);
        }
      };

    fetchBeer();
    fetchBars();
    setLoading(false);
  }, [id]);


  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  if (!beer) {
    return <Typography variant="h6">Beer not found.</Typography>;
  }

  return (
    <Container maxWidth={false} disableGutters sx={{ height: '100vh', width: isSmallScreen ? '100%' : '100vh', width: isMediumScreen ? "100%" : "100vh", display: 'flex', flexDirection: 'column' , fontFamily: 'Belwe', marginTop: isSmallScreen ? '30%' : '0', marginTop: isMediumScreen ? "30%" : "0" }}>
      <Container maxWidth={false} disableGutters sx={{ width: isSmallScreen ? '100%' : '85%', width: isMediumScreen ? "100%" : "85%", marginBottom: '10px' }}>
        <Paper elevation={4} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ padding: 1 }}>
            <Typography variant="h5" sx={{ fontFamily: 'Belwe' }}>
              {beer.name}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {beer.brewery || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ position: 'relative' }}>
            <img 
              src={beer.image_url || "https://via.placeholder.com/400"} // Use the beer image URL or a placeholder
              alt={beer.name}
              style={{ width: '100%', height: 'auto', maxHeight: '40vh', objectFit: 'cover' }}
            />
          </Box>
          <Box sx={{ padding: 1 }}>
            <Typography variant="body2" color="textSecondary">
              {beer.description || 'No description available.'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Alcohol: {beer.alcohol} | IBU: {beer.ibu}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Malts: {beer.malts} | Hop: {beer.hop} | Yeast: {beer.yeast}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Brand: {beer.brand.name} | Brewery: {beer.brand.brewery.name}
            </Typography>
          </Box>
          <Box sx={{ padding: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Button variant="contained" color="primary" onClick={() => console.log('Favorite clicked')}>
                <FavoriteBorderIcon /> Favorite
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
      <Container maxWidth={false} disableGutters sx={{ width: isSmallScreen ? '90%' : '70%', width: isMediumScreen ? "90%" : "70%" }}>
        <Paper elevation={4} sx={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: "5px" }}>
          <Box sx={{ padding: 1, overflowY: 'auto', flex: 1 }}>
            <Typography variant="h6" sx={{ fontFamily: 'Belwe' }}>Where to drink?</Typography>
            {bars.length > 0 ? (
              bars.map(bar => (
                <Box key={bar.id} sx={{ padding: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1">{bar.name}</Typography>
                  </Box>
                  <Button variant="contained" className="buttonView" onClick={() => handleViewClick(bar.id)}>
                    View
                  </Button>
                </Box>
              ))
            ) : (
              <Typography sx={{ padding: 1 }}>No events found.</Typography>
            )}
          </Box>
      </Paper>
      </Container>
    </Container>
  );
}

export default BeerShow;