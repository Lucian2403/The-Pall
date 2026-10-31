import {dev} from '$app/environment';
import {error} from '@sveltejs/kit';

// No public fixture: this is only accessible from the Vite dev server.
export function load(){
  if(!dev)throw error(404,'Not found');
}
