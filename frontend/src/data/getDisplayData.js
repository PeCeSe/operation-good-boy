/**
 * Resolve visual display data for a player.
 * If the player has a skinId and that skin exists, its name/headshot/stunned/image/backstory
 * override the character's — but only when they're non-null. Null skin images fall back
 * to the character's artwork so unfinished skins still look reasonable in-game.
 *
 * @param {object} player      - player object from lobby or game state
 * @param {array}  SKINS       - skin definitions (from skins.js)
 * @param {array}  CHARACTERS  - character definitions (from characters.js)
 * @returns {object|null}      - display data with at minimum: name, headshot, stunned, image
 */
export function getDisplayData(player, SKINS, CHARACTERS) {
  const char = CHARACTERS.find(
    (c) => c.id === (player?.characterId ?? player?.character?.id)
  ) ?? null;

  if (player?.skinId) {
    const skin = SKINS.find((s) => s.id === player.skinId);
    if (skin) {
      return {
        ...char,
        name:      skin.name,
        backstory: skin.backstory,
        // Only override images when the skin actually has them
        ...(skin.headshot != null && { headshot: skin.headshot }),
        ...(skin.stunned  != null && { stunned:  skin.stunned  }),
        ...(skin.image    != null && { image:    skin.image    }),
      };
    }
  }

  return char;
}
