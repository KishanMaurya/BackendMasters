import { articleSchema, tagSchema, toFieldErrors } from './schemas';

const VALID = {
  slug: 'a-title',
  title: 'A title',
  description: '',
  content: '',
  coverImageUrl: null,
  categoryId: '11111111-1111-4111-8111-111111111111',
  difficulty: null,
  seoTitle: null,
  seoDescription: null,
  isFeatured: false,
  tagIds: [],
};

describe('articleSchema', () => {
  it('accepts a minimal draft', () => {
    expect(articleSchema.safeParse(VALID).success).toBe(true);
  });

  it('turns blank optional fields into null', () => {
    const parsed = articleSchema.parse({ ...VALID, seoTitle: '  ', difficulty: '' });
    expect(parsed.seoTitle).toBeNull();
    expect(parsed.difficulty).toBeNull();
  });

  it.each([
    ['slug', 'slugs'],
    ['slug', 'Has Spaces'],
    ['slug', 'double--hyphen'],
    ['title', '   '],
    ['categoryId', ''],
    ['difficulty', 'impossible'],
    ['coverImageUrl', 'not a url'],
  ])('rejects %s = %j', (field, value) => {
    const result = articleSchema.safeParse({ ...VALID, [field]: value });
    expect(result.success).toBe(false);
    if (!result.success) expect(toFieldErrors(result.error)).toHaveProperty(field);
  });
});

describe('tagSchema', () => {
  it('requires a usable slug, which a non-Latin name would not produce', () => {
    expect(tagSchema.safeParse({ name: 'हिन्दी', slug: '' }).success).toBe(false);
  });
});
