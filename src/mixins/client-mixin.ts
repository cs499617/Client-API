/**
 * Global mixins to use across files
 */
import { Component, Prop, Vue } from 'vue-property-decorator';
// The base url
const HOME_API = 'http://localhost:3004';
// The url for the queen
export const QUEEN_API = `${HOME_API}/queens`;
// The url for runways
export const RUNWAY_API = `${HOME_API}/runways`;
// Te url for logins
export const LOGIN_API = `${HOME_API}/login`;
// The url for changing name
export const PROFILE_API = `${HOME_API}/users/name`;
// The url to get account info
export const REGISTER_API = `${HOME_API}/users`;
// Const for access level
export const ACCESS_LEVEL = localStorage.getItem('accessLevel');
// Const for token
export const TOKEN = localStorage.getItem('token');
export const API_HEADERS:any = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
};

@Component
export default class GlobalMixin extends Vue {

}
