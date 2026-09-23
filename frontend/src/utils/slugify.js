export const slugify = (value, fallback = 'unknown') => {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
};

export const listingUrl = (business, origin = '') => {
  const category = slugify(business?.category, 'uncategorized');
  const city = slugify(business?.city, 'unknown');
  return `${origin}/listing/${category}/${business.slug}/${city}`;
};
