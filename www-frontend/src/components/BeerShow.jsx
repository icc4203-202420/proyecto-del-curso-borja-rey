import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Button, IconButton, useTheme, useMediaQuery, Divider } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import './BarShow.css';

function BeerShow() {
  const { id } = useParams();
  const [beer, setBeer] = useState(null);
  const [bars, setBars] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [user_review, setUserReview] = useState(null);
  const current_user = JSON.parse(localStorage.getItem('current_user'));

  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleViewBarClick = (id) => {
    navigate(`/bars/${id}`);
  };

  const handleViewReviewsClick = (id) => {
    navigate(`/beers/${id}/reviews`);
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
        setBars(data.bars || []);
      } catch (error) {
        console.error('Error fetching bars:', error);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/v1/beers/${id}/reviews`);
        const data = await response.json();
        setReviews(data.reviews || []);
        const rate = data.reviews.reduce((acc, review) => acc + parseFloat(review.rating), 0) / data.reviews.length;
        const userReview = data.reviews.find(review => review.user.id === current_user.id);
        setUserReview(userReview);
        setRating(rate);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchBeer();
    fetchBars();
    fetchReviews();
    setLoading(false);
  }, [id]);

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  if (!beer) {
    return <Typography variant="h6">Beer not found.</Typography>;
  }

  return (
    current_user ? (
      <Container maxWidth={false} disableGutters sx={{ height: '100vh', width: isSmallScreen ? '100%' : '100vh', width: isMediumScreen ? "100%" : "100vh", display: 'flex', flexDirection: 'column' , fontFamily: 'Belwe', marginTop: isSmallScreen ? '30%' : '0',  display: 'flex', flexDirection: 'column', fontFamily: 'Belwe', marginTop: isSmallScreen || isMediumScreen ? '30%' : '0' }}>
        <Container maxWidth={false} disableGutters sx={{ width: isSmallScreen || isMediumScreen ? '100%' : '85%', marginBottom: '10px' }}>
          <Paper elevation={4} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ padding: 1 }}>
              <Typography variant="h5" sx={{ fontFamily: 'Belwe' }}>
                {beer.name}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {beer.brewery || 'N/A'} | Rating: {rating.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ position: 'relative' }}>
              <img
                src={beer.image_url || "https://via.placeholder.com/400"}
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
            <Box sx={{ padding: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'right' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Button variant="contained" color="primary" className="buttonFavorite" onClick={() => console.log('Favorite clicked')}>
                  <FavoriteBorderIcon /> Favorite
                </Button>
                <Button variant="contained" color="primary" className="buttonBack" onClick={() => handleViewReviewsClick(beer.id)}>
                  Review
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
        
        {user_review && (
        <Container maxWidth={false} disableGutters sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', marginBottom: "5px" }}>
          <Paper elevation={4} sx={{ flex: 1, display: 'flex', flexDirection: 'column', marginRight: '5px' }}>
            <Box sx={{ padding: 1, overflowY: 'auto', flex: 1 }}>
              <Typography variant="h6" sx={{ fontFamily: 'Belwe' }}>Your Review</Typography>
                <Box sx={{ padding: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '8px' }}>
                  <Box>
                    <Typography variant="body1">
                      Rate: {user_review.rating}; {user_review.text}
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ padding: 1 }}>No review found.</Typography>
            </Box>
          </Paper>
        </Container>
        )}
        <Container maxWidth={false} disableGutters sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
          <Paper elevation={4} sx={{ flex: 1, display: 'flex', flexDirection: 'column', marginRight: '5px' }}>
            <Box sx={{ padding: 1, overflowY: 'auto', flex: 1 }}>
              <Typography variant="h6" sx={{ fontFamily: 'Belwe' }}>Where to drink?</Typography>
              {bars.length > 0 ? (
                bars.map(bar => (
                  <Box key={bar.id} sx={{ padding: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '8px' }}>
                    <Box>
                      <Typography variant="body1">{bar.name}</Typography>
                    </Box>
                    <Button variant="contained" className="buttonView" onClick={() => handleViewBarClick(bar.id)}>
                      View
                    </Button>
                  </Box>
                ))
              ) : (
                <Typography sx={{ padding: 1 }}>No bars found.</Typography>
              )}
            </Box>
          </Paper>
          <Paper elevation={4} sx={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '5px' }}>
            <Box sx={{ padding: 1, overflowY: 'auto', flex: 1 }}>
              <Typography variant="h6" sx={{ fontFamily: 'Belwe' }}>Reviews</Typography>
              {reviews.length > 0 ? (
                reviews.map((review, i) => {
                  return (
                    <React.Fragment key={review.id}>
                      <Box sx={{ padding: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '8px' }}>
                        <Box>
                          <Typography variant="body1">
                            {i + 1}. Rate: {review.rating}; {review.text}
                          </Typography>
                        </Box>
                      </Box>
                      <Divider />
                    </React.Fragment>
                  );
                })
              ) : (
                <Typography sx={{ padding: 1 }}>No reviews found.</Typography>
              )}
            </Box>
          </Paper>
        </Container>
        <Typography sx={{ padding: 1 }}></Typography>
      </Container>
    ) : (
      <Container sx={{ height: '100vh', overflowY: 'auto', marginTop: isSmallScreen || isMediumScreen ? '30%' : '0' }}>
        <div className="imageContainer">
          <img
            src={BeerLogo}
            alt="Beer Logo"
          />
        </div>
        <Box className="boxTodo">
          <Typography variant="h3" sx={{ fontFamily: "Belwe", color: "#000000", padding: "20px", marginTop: "50px" }}>
            Error 401
          </Typography>
        </Box>
      </Container>
    )
  );
}

export default BeerShow;