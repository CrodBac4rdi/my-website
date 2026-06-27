/**
 * Einheitlicher Rückgabetyp für Server Actions.
 *
 * Actions werfen keine Fehler an den Client, sondern liefern ein
 * diskriminiertes Ergebnis zurück. Die Client-Komponente entscheidet dann
 * über Toast / State-Update.
 */
export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });
export const fail = (error: string): ActionResult<never> => ({ ok: false, error });
