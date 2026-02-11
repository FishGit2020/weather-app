import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomeGraphQL from '@/pages/HomeGraphQL';
import CityWeatherGraphQL from '@/pages/CityWeatherGraphQL';
import NotFound from '@/pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomeGraphQL />} />
        <Route path="weather/:coords" element={<CityWeatherGraphQL />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
