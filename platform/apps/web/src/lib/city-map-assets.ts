/** Swap these paths/flags after the final asset pack is supplied. */
export const cityMapAssets={
 map:'/locations/city/map.webp',
 fallbackMap:'/locations/city/map-placeholder.svg',
 useFinalMap:false,
 useFinalIcons:false,
 cityAmbience:'/audio/city/city-ambience.mp3',
 walkingAmbience:'/audio/city/walking-ambience.mp3',
 enableAmbience:false,
 fadeMs:450,
 zoomMin:1,zoomMax:4,zoomStep:1.25
} as const;
