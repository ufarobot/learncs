export const materialDuplicatePairs = [
  ['telegram-141', 'kak-vyrastit-itshnika'],
  ['telegram-145', 'kak-vyrastit-itshnika'],
  ['telegram-146', 'kak-vyrastit-itshnika'],
  ['series-tekhnologicheskoe-predprinimatelstvo', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-212', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-213', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-214', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-215', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-216', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-217', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-218', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-219', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-220', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-221', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-222', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-223', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-224', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-225', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-226', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-227', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-228', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-230', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-231', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-232', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-233', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-234', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-235', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-236', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-237', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-239', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-246', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-247', 'zachem-izuchat-programmirovanie-v-shkole'],
  ['telegram-248', 'zachem-izuchat-programmirovanie-v-shkole'],
];

export const materialDuplicateTargets = new Map(materialDuplicatePairs);

export const hiddenMaterialSlugs = new Set([
  'telegram-32',
  'telegram-145',
  'telegram-146',
  'telegram-158',
  'telegram-160',
  'telegram-163',
  'telegram-165',
  'telegram-175',
  'telegram-176',
  'telegram-181',
  'telegram-182',
  'telegram-183',
  'telegram-186',
  'telegram-189',
  'telegram-198',
  'telegram-199',
  'telegram-204',
  'telegram-210',
  'telegram-211',
  'telegram-215',
  'telegram-217',
  'telegram-219',
  'telegram-222',
  'telegram-224',
  'telegram-226',
  'telegram-228',
  'telegram-231',
  'telegram-233',
  'telegram-234',
  'telegram-237',
  'telegram-242',
  'telegram-244',
  'telegram-254',
  'telegram-259',
  'telegram-267',
  'telegram-268',
  'telegram-282',
  'telegram-304',
]);

export function canonicalMaterialSlug(slug) {
  return materialDuplicateTargets.get(slug) ?? slug;
}

export function isDuplicateMaterialSlug(slug) {
  return materialDuplicateTargets.has(slug);
}

export function isHiddenMaterialSlug(slug) {
  return hiddenMaterialSlugs.has(slug);
}
