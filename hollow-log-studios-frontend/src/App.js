import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AddArtwork from './components/AddArtwork';
import ManageArtworks from './components/ManageArtworks';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/add-artwork" element={<AddArtwork />} />
        <Route path="/manage-artworks" element={<ManageArtworks />} />
      </Routes>
    </Router>
  );
}

export default App;
