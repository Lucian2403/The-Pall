import type {CityOverviewSnapshot} from '@the-pall/game-core';
import {HOME_ID} from './shared-home-state.js';

/** Only verified destinations are exposed. Extend after owner approval. */
export const CITY_OVERVIEW:CityOverviewSnapshot={
  cityId:'grand-cylinder-city',
  name:'Grand Cylinder City',
  pointsOfInterest:[
    {id:HOME_ID,name:'Rented room',availability:'available',destination:'rented-room'}
  ]
};
