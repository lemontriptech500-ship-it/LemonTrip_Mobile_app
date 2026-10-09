import { useSyncExternalStore } from 'react';
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
// Static web exports cannot know runtime destination IDs. Use the same initial
// shell on server and client, then resolve the destination after hydration.
export function useClientReady() { return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot); }
