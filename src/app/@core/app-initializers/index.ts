import { concat } from 'rxjs';
import { AuthAppInitiazer } from './authenticate';

export function AppInitializer() {
  return concat(AuthAppInitiazer());
}
