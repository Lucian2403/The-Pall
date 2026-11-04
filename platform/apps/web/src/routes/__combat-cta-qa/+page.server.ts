import {dev} from '$app/environment';
import {error} from '@sveltejs/kit';

// Synthetic UI-only integration fixture, inaccessible in production.
export function load(){
  if(!dev)throw error(404,'Not found');
}
