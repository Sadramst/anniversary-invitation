/** Join names naturally in English: "A", "A & B", "A, B & C" */
export function joinEn(names) {
  const list = names.filter(Boolean);
  if (list.length === 0) return "";
  if (list.length === 1) return list[0];
  return `${list.slice(0, -1).join(", ")} & ${list[list.length - 1]}`;
}

/** Join names naturally in Farsi: "الف"، "الف و ب"، "الف، ب و ج" */
export function joinFa(names) {
  const list = names.filter(Boolean);
  if (list.length === 0) return "";
  if (list.length === 1) return list[0];
  return `${list.slice(0, -1).join("، ")} و ${list[list.length - 1]}`;
}

/** Farsi display name, falling back to the English spelling when not translated yet. */
export function faName(member) {
  return member.farsi_name || member.english_name || null;
}

/**
 * Greeting for a whole party.
 * Members whose name is still unknown are not named, but they are acknowledged
 * with "& family" / "و خانواده" so the invitation still reads correctly.
 */
export function partyGreeting(members) {
  const named = members.filter((m) => m.english_name);
  const unnamedCount = members.length - named.length;

  const en = joinEn(named.map((m) => m.english_name));
  const fa = joinFa(named.map((m) => faName(m)));

  return {
    en: unnamedCount > 0 ? (en ? `${en} & family` : "Friends") : en,
    fa: unnamedCount > 0 ? (fa ? `${fa} و خانواده` : "دوستان عزیز") : fa,
  };
}

/** Greeting for a single person. */
export function individualGreeting(member) {
  return {
    en: member.english_name || "Friend",
    fa: faName(member) || "مهمان عزیز",
  };
}
