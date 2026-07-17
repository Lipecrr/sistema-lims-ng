/**
 * Compara um texto com um filtro de busca, com o `*` funcionando como "contém"/curinga.
 * - Vazio ou "*": casa com tudo.
 * - Sem "*": tratado como "contém" (substring). Ex.: "alfa" casa com "Química Alfa".
 * - Com "*": cada trecho separado por "*" deve aparecer, na ordem (sem âncora).
 *   Ex.: "*ambiental" contém ambiental; "delta*ltda" tem "delta" antes de "ltda".
 */
export function matchFiltro(texto: string | null | undefined, filtro: string | null | undefined): boolean {
  const alvo = (texto ?? '').toLowerCase();
  const f = (filtro ?? '').trim().toLowerCase();
  if (!f || f === '*') return true;

  if (!f.includes('*')) {
    return alvo.includes(f);
  }

  const fragmentos = f.split('*').filter((x) => x.length > 0);
  let pos = 0;
  for (const frag of fragmentos) {
    const idx = alvo.indexOf(frag, pos);
    if (idx === -1) return false;
    pos = idx + frag.length;
  }
  return true;
}
