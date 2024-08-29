import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Beers.css';

const Beers = () => {
  const [beers, setBeers] = useState([]);

  useEffect(() => {
    // Realiza una solicitud GET a la API para obtener todas las cervezas
    axios.get('/api/beers')
      .then(response => {
        setBeers(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the beers!', error);
      });
  }, []);

  return (
    <div className="beers-container">
      <h1>All Beers</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Brand</th>
            <th>Style</th>
            <th>Hop</th>
            <th>Yeast</th>
            <th>Malts</th>
            <th>IBU</th>
            <th>Alcohol</th>
            <th>BLG</th>
            <th>Avg Rating</th>
          </tr>
        </thead>
        <tbody>
          {beers.map(beer => (
            <tr key={beer.id}>
              <td>{beer.name}</td>
              <td>{beer.beer_type}</td>
              <td>{beer.brand ? beer.brand.name : 'N/A'}</td>
              <td>{beer.style}</td>
              <td>{beer.hop}</td>
              <td>{beer.yeast}</td>
              <td>{beer.malts}</td>
              <td>{beer.ibu}</td>
              <td>{beer.alcohol}</td>
              <td>{beer.blg}</td>
              <td>{beer.avg_rating}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Beers;