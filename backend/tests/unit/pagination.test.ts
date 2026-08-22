import { buildPaginationMeta, parsePagination, toSkipTake } from '@/utils/pagination';

describe('parsePagination', () => {
  it('defaults to page 1 and limit 20 when nothing is provided', () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 20 });
  });

  it('parses valid page/limit values', () => {
    expect(parsePagination({ page: '3', limit: '10' })).toEqual({ page: 3, limit: 10 });
  });

  it('clamps limit to the maximum of 100', () => {
    expect(parsePagination({ limit: '500' })).toEqual({ page: 1, limit: 100 });
  });

  it('falls back to defaults for invalid values', () => {
    expect(parsePagination({ page: '-5', limit: 'abc' })).toEqual({ page: 1, limit: 20 });
  });
});

describe('toSkipTake', () => {
  it('computes skip/take from page and limit', () => {
    expect(toSkipTake({ page: 3, limit: 10 })).toEqual({ skip: 20, take: 10 });
    expect(toSkipTake({ page: 1, limit: 20 })).toEqual({ skip: 0, take: 20 });
  });
});

describe('buildPaginationMeta', () => {
  it('computes totalPages by rounding up', () => {
    expect(buildPaginationMeta({ page: 1, limit: 10 }, 25)).toEqual({
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
    });
  });

  it('returns at least 1 total page when there are no results', () => {
    expect(buildPaginationMeta({ page: 1, limit: 10 }, 0).totalPages).toBe(1);
  });
});
