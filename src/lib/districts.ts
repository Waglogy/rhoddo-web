/** Sikkim's six districts, offered when hosts and admins add venues and events. */
export const SIKKIM_DISTRICTS = ['Gangtok', 'Mangan', 'Namchi', 'Gyalshing', 'Pakyong', 'Soreng'];

/** The districts to offer, plus a saved older place name (e.g. "Pelling") so editing keeps it. */
export function districtOptions(current?: string | null): string[] {
  return current && !SIKKIM_DISTRICTS.includes(current) ? [current, ...SIKKIM_DISTRICTS] : SIKKIM_DISTRICTS;
}
