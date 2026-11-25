/** A destination is a page, not a travel action. */
export type CityPointOfInterest = Readonly<{id:string;name:string} & (
  {availability:'available';destination:'rented-room'} |
  {availability:'unavailable'}
)>;
export type CityOverviewSnapshot = Readonly<{
  cityId:'grand-cylinder-city';
  name:string;
  pointsOfInterest:readonly CityPointOfInterest[];
}>;
