import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MapPage from './components/MapPage';
import AddDataPage from './components/AddDataPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/add-data-boengkoes" element={<AddDataPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;