/**
 * Narrow export just for `app/store/rootReducer.ts`. Kept separate from the
 * feature's main `index.ts` (which also exports the page component) so the
 * store — loaded eagerly at boot — doesn't pull the lazily-loaded page into
 * the main bundle along with it.
 */
export { assetsUiReducer } from './assetsUiSlice'
