/**
 * Resolve visual display data for a player.
 * If the player has a skinId and that skin exists, its name/headshot/stunned/image/backstory
 * override the character's. Gameplay data (cards, mechanics) is unaffected.
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
        headshot:  skin.headshot,
        stunned:   skin.stunned,
        image:     skin.image,
        backstory: skin.backstory,
      };
    }
  }

  return char;
}
