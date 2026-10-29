// The YouTube catalogue. Shared by MusicSection.jsx and
// scripts/build-covers.mjs, which builds each card's covers under
// public/covers/ — add a video here, then run `npm run covers`.
//
// Optional per entry:
//   feat:  'Taer'  — credit line on a designed cover ("ft. Taer")
//   cover: { scene, treatment } — design the cover from a scene in
//          image-src/scenes/ instead of using the YouTube thumbnail.
//          treatment 'duotone' (ink/bone) or 'scene' (its own colours).
export const VIDEOS = [
  // Eastern Remixes
  { id: 'a2sSj_aiDhY', title: 'LIGHTS IN YOUR EYES', artist: 'Gummy B', type: 'eastern' },
  { id: '7lnSVhn_RyY', title: '夜曲 NOCTURNE', artist: '周杰倫 Jay Chou', type: 'eastern' },
  { id: 'RfXKNRE-59w', title: '模特 MODEL', artist: '李榮浩 Ronghao Li', type: 'eastern' },
  { id: 'kKq-jU_WJ7s', title: 'WHO 誰', artist: '廖俊澧 ft. 岑寧兒', type: 'eastern' },
  { id: 'AU42eLgyLPY', title: '只有咒語才能解除咒語', artist: '柏林角落 Berlin the Corner', type: 'eastern' },
  { id: '5zdidTaZf3M', title: '愛情你比我想的還較偉大', artist: '茄子蛋 EggPlantEgg', type: 'eastern' },
  { id: 'hei62d71fuA', title: '床 LIE', artist: '草東沒有派對 No Party for Cao Dong', type: 'eastern' },
  { id: '3bVGE5g3ibM', title: '我若是有來生我想欲變成你', artist: '茄子蛋 EggPlantEgg ft. YVV', type: 'eastern' },
  { id: 'zvRfal00Wmg', title: '日常 EVERYDAY LIFE', artist: '茄子蛋 EggPlantEgg', type: 'eastern' },
  // Other Remixes
  { id: 'XyQpKZ9WxKc', title: 'MILA 米拉', artist: 'Xu Bin 徐濱', type: 'remix' },
  { id: 'BLhdjHB2Zbo', title: 'THE WINNER IS (2012)', artist: 'DeVotchKa', type: 'remix' },
  { id: '2ZLQmdZGyIk', title: 'THE WINNER IS', artist: 'DeVotchKa', type: 'remix' },
  // Originals
  { id: 'YKsIuaGSStQ', title: 'DUEN', artist: 'skixO', type: 'original',
    cover: { scene: 'wistful-night-coastline', treatment: 'duotone' } },
  { id: 'AlprPVhKRu4', title: 'MIDNIGHT', artist: 'skixO', type: 'original',
    cover: { scene: 'wistful-night-cityskyline', treatment: 'duotone' } },
  { id: 'YQy7s0y5Kuc', title: 'OH GOD', artist: 'skixO', type: 'original',
    cover: { scene: 'surreal-night-eclipse', treatment: 'duotone' } },
  { id: '2dQapfiJrpw', title: 'NEED', artist: 'skixO', type: 'original',
    cover: { scene: 'wistful-night-rain-window', treatment: 'duotone' } },
  { id: 'vSeMjPox2H4', title: '1:48', artist: 'skixO', type: 'original',
    cover: { scene: 'wistful-night-asiancityl', treatment: 'duotone' } },
];
