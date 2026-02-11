import React from 'react';
import { getWeatherIconUrl } from '@/utils/weatherHelpers';

interface Props {
  code: string;
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = {
  small: 'w-12 h-12',
  medium: 'w-16 h-16',
  large: 'w-24 h-24'
};

export default function WeatherIcon({ code, size = 'medium' }: Props) {
  return (
    <img
      src={getWeatherIconUrl(code)}
      alt="Weather icon"
      className={`${sizeMap[size]} mx-auto`}
    />
  );
}
