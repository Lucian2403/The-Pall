/** Exact browser projection of the server-owned Stitcher ward state. */
import type {StitcherState} from '../../../api/src/stitcher-work.js';
export type StitcherWardSnapshot={
  stage:number;
  tutorialStatus:string;
  state:StitcherState;
  started:boolean;
  availableActions:string[];
};
