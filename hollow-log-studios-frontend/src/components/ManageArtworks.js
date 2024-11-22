import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManageArtworks = () => {
  const [artworks, setArtworks] = useState([]);

  const fetchArtworks = async () => {
    try {
      const response = await axios.get('/api/artworks');
      setArtworks(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteArtwork = async (id) => {
    try {
      await axios.delete(`/api/artworks/${id}`);
      alert('Artwork deleted!');
      fetchArtworks();
    } catch (error) {
      console.error(error);
      alert('Failed to delete artwork.');
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  return (
    <div>
      <h2>Manage Artworks</h2>
      {artworks.map((artwork) => (
        <div key={artwork._id}>
          <h3>{artwork.title}</h3>
          <p>{artwork.description}</p>
          <button onClick={() => deleteArtwork(artwork._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default ManageArtworks;
