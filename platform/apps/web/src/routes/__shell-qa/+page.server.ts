import {dev} from '$app/environment';
import {error} from '@sveltejs/kit';

// Synthetic shell-layout fixture, inaccessible in production.
export function load(){
  if(!dev)throw error(404,'Not found');
}
