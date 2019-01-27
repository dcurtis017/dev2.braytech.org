// Bungie API access convenience methods
import { Globals } from './globals';

async function apiRequest(path) {
  const options = { headers: { 'X-API-Key': Globals.key.bungie } };

  const request = await fetch(`https://www.bungie.net${path}`, options)
    .then(r => r.json())
    .catch(error => {
      console.log(error);
    });

  // need a .catch()
  // if input is 'lol', then user deletes 'lol', playerSearch() is fired anyway, 
  // and the bent response is HTML. page explodes. probably an error that should 
  // be avoided anyway. i've added an if statement in ProfileSearch.js to check 
  // if displayName is defined

  if (request.ErrorCode !== 1) {
    throw new Error(`Error retrieving ${path} from Bungie: (${request.ErrorStatus} code ${request.ErrorCode}) ${request.Message}`);
  }

  return request.Response;
}

export const manifestIndex = async () => apiRequest('/Platform/Destiny2/Manifest/');

export const settings = async () => apiRequest(`/Platform/Settings/`);

export const milestones = async () => apiRequest('/Platform/Destiny2/Milestones/');

export const manifest = async version => fetch(`https://www.bungie.net${version}`).then(a => a.json());

export const memberProfile = async (membershipType, membershipId, components) => apiRequest(`/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=${components}`);

export const memberGroups = async (membershipType, membershipId) => apiRequest(`/Platform/GroupV2/User/${membershipType}/${membershipId}/0/1/`);

export const playerSearch = async (membershipType, displayName) => apiRequest(`/Platform/Destiny2/SearchDestinyPlayer/${membershipType}/${encodeURIComponent(displayName)}/`);
