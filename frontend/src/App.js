import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HotelsView from './views/HotelsView';
import RoomTypesView from './views/RoomTypesView';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<HotelsView />} />
          <Route path="/room-types" element={<RoomTypesView />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
