import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/**
 * On-device storage for persisted stores. Holds the user's own data so it can be viewed
 * offline; anything shared with the server is re-validated there.
 */
export const deviceStorage = createJSONStorage(() => AsyncStorage);

let counter = 0;
/** Local id for things created on the device (cart lines). */
export function localId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}
