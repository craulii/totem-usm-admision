// Read-only helper for the in-game "HIGH SCORES" pill. Same localStorage format
// (`totem_lb_<gameId>`, sorted descending) that Leaderboard.jsx writes — kept as a
// separate reader here instead of importing Leaderboard.jsx's internals, so this
// display-only addition can't affect the score-saving flow.
export function getTopScore(gameId) {
  try {
    const scores = JSON.parse(localStorage.getItem(`totem_lb_${gameId}`)) || [];
    return scores[0]?.score ?? 0;
  } catch {
    return 0;
  }
}
