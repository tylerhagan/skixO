// Derived view of src/data/releases.js for the cover build script
// (scripts/build-covers.mjs) and anything still reading VIDEOS.
// Add releases in releases.js, not here.
import { releases } from './releases.js';

export const VIDEOS = releases.map(r => ({
  id: r.youtubeId,
  title: r.titleZh ? `${r.titleZh} ${r.title}` : r.title,
  artist: r.artist || (r.feat ? `skixO ft. ${r.feat}` : 'skixO'),
  type: r.type,
  slug: r.slug,
  ...(r.feat && !r.artist ? { feat: r.feat } : {}),
  ...(r.cover ? { cover: r.cover } : {}),
}));
