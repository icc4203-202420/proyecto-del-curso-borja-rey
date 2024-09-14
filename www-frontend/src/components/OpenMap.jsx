import { Loader } from '@googlemaps/js-api-loader';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { useEffect, useRef, useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper } from '@mui/material';
import BeerLogo from '../assets/beerLogo.png';

function OpenMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const markersSearch = useRef([]);
  const [bars, setBars] = useState([]);
  const [filteredBars, setFilteredBars] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const current_user = JSON.parse(localStorage.getItem('current_user'));

  useEffect(() => {
    const fetchBars = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/v1/bars`);
        const data = await response.json();
        setBars(data.bars || []);
        setFilteredBars(data.bars || []);
      } catch (error) {
      }
    };

    fetchBars();
  }, []);

  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
      version: 'weekly',
    });
    loader
      .importLibrary('maps')
      .then((lib) => {
        const { Map } = lib;
        const defaultCenter = { lat: -33.449537186363884, lng: -70.70400615902521 };
        const center = markersSearch.current.length > 0 
          ? markersSearch.current[0].position 
          : defaultCenter;

        const map = new Map(mapRef.current, {
          mapId: 'DEMO_MAP_ID',
          center: center,
          zoom: 5,
          gestureHandling: "greedy"
        });
        mapInstance.current = map;
        return map;
      })
      .then((map) => {
        loader.importLibrary('marker').then((lib) => {
          const { AdvancedMarkerElement, PinElement } = lib;
          const markers = filteredBars.map((bar, i) => {
            const position = { lat: bar.latitude, lng: bar.longitude };
            const marker = new AdvancedMarkerElement({
              position,
            });

            marker.addListener('click', () => {
              mapInstance.current.panTo(marker.position);
            });
            markersRef.current.push(marker); 
            return marker;
          });
          new MarkerClusterer({ map, markers });
        });
      });
  }, [filteredBars]);

  const handleSearch = () => {
    markersSearch.current = [];
  
    const filtered = bars.filter(bar => 
      bar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bar.address.line1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bar.address.line2.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bar.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bar.address.country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filtered.length === bars.length) {
      markersSearch.current = [];
    } else if (filtered.length > 0 && mapInstance.current) {
  
      filtered.forEach(bar => {
        const marker = markersRef.current.find(marker => 
          marker.position.lat === bar.latitude && 
          marker.position.lng === bar.longitude
        );
        if (marker) {
          markersSearch.current.push(marker);
        }
      });
    }
  
    setFilteredBars(filtered);
  };

  return (
    current_user ? (
      <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100vw', height: '80vh' }}>
        <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '80vw', height: '80vh', padding: '20px', overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
            <TextField
              label="Search for a bar"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="contained" onClick={handleSearch} sx={{ backgroundColor: "#AF8F6F", fontFamily: "Belwe", marginLeft: "10px" }}>Search</Button>
          </Box>
          <div ref={mapRef} style={{ height: '100%', width: '80vw' }} />
        </Paper>
      </Container>
    ) : (
      <Container sx={{ height: '100vh', overflowY: 'auto', marginTop: '30%' }}>
        <div className="imageContainer">
          <img src={BeerLogo} alt="Beer Logo" />
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

export default OpenMap;