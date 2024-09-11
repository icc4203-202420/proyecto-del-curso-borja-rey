import { Loader } from '@googlemaps/js-api-loader';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { useEffect, useRef, useState } from 'react';
import { Box, Container, Typography, TextField, Button } from '@mui/material';
import BeerLogo from '../assets/beerLogo.png';

function OpenMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [bars, setBars] = useState([]);
  const [filteredBars, setFilteredBars] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const current_user = JSON.parse(localStorage.getItem('current_user'));

  useEffect(() => {
    const fetchBars = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/v1/bars`);
        const data = await response.json();
        console.log('Bars:', data.bars);
        setBars(data.bars || []);
        setFilteredBars(data.bars || []);
      } catch (error) {
        console.error('Error fetching bars:', error);
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
        const map = new Map(mapRef.current, {
          mapId: 'DEMO_MAP_ID',
          center: { lat: -33.449537186363884, lng: -70.70400615902521 },
          zoom: 10,
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
            return marker;
          });
          new MarkerClusterer({ map, markers });
        });
      });
  }, [filteredBars]);

  const handleSearch = () => {
    const filtered = bars.filter(bar => 
      bar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bar.address.line1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bar.address.line2.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bar.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bar.address.country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      const position = { lat: filtered[0].latitude, lng: filtered[0].longitude };
      mapInstance.current.panTo(position);
    }
    console.log('Filtered:', filtered);
    setFilteredBars(filtered);
  };

  return (
    current_user ? (
      <Container sx={{ display: 'flex', flexDirection: 'column', justifyContent: "center", alignItems: 'center', width: '100vw', height: '80vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
          <TextField
            label="Search for a bar"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="contained" onClick={handleSearch}>Buscar</Button>
        </Box>
        <div ref={mapRef} style={{ height: '100%', width: '80vw' }} />
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