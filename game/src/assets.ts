import { Assets } from 'pixi.js';


export enum TextureId {
  BlockOpaqueWhite,
  BlockOpaqueColor,
  BlockHalfOpaqueColor,
  BlockTransparentBlack,
  BlockTransparentWhite,
};

export const textureMap = new Map<number, string>([
  // Blocks
  [TextureId.BlockOpaqueWhite, "block_opaque_white"],
  [TextureId.BlockOpaqueColor, "block_opaque_coloured"],
  [TextureId.BlockHalfOpaqueColor, "block_half_opaque_coloured"],
  [TextureId.BlockTransparentBlack, "block_empty_black"],
  [TextureId.BlockTransparentWhite, "block_empty_white"],
]);


export const loadAssets = async () => {
  const manifest = {
    bundles: [
      {
        name: 'players',
        assets: [
          { name: 'player_bunny', srcs: 'assets/bunny.png' },
        ]
      },
      {
        name: 'map',
        assets: [
          { name: 'block_empty_black', srcs: 'assets/block_empty_black.png' },
          { name: 'block_empty_white', srcs: 'assets/block_empty_white.png' },
          { name: 'block_opaque_coloured', srcs: 'assets/block_opaque_coloured.png' },
          { name: 'block_opaque_white', srcs: 'assets/block_opaque_white.png' },
          { name: 'block_half_opaque_coloured', srcs: 'assets/block_half_opaque_coloured.png' },
        ]
      }
    ]
  };

  await Assets.init({ manifest });

  await Promise.all([
    Assets.loadBundle('players'),
    Assets.loadBundle('map')
  ]);
};

export const assetsReady = loadAssets();
