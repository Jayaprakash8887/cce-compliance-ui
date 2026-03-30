import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiGet, ApiError } from '../../api/client';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('apiGet', () => {
  it('returns parsed JSON on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: '1', name: 'test' }),
    });

    const result = await apiGet<{ id: string; name: string }>('/test');
    expect(result).toEqual({ id: '1', name: 'test' });
  });

  it('throws ApiError on 404', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({
        status: 404,
        error: 'Not Found',
        message: 'Patient not found',
        path: '/test',
        timestamp: '2026-03-30T00:00:00Z',
        fieldErrors: null,
      }),
    });

    await expect(apiGet('/test')).rejects.toThrow(ApiError);
    try {
      await apiGet('/test');
    } catch (e) {
      // second call for the same mock
    }
  });

  it('throws ApiError on 500', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({
        status: 500,
        error: 'Internal Server Error',
        message: 'Something went wrong',
        path: '/test',
        timestamp: '2026-03-30T00:00:00Z',
        fieldErrors: null,
      }),
    });

    try {
      await apiGet('/test');
      expect.fail('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(500);
    }
  });

  it('handles network error (non-JSON response)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: () => Promise.reject(new Error('not json')),
    });

    try {
      await apiGet('/test');
      expect.fail('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(502);
      expect((e as ApiError).message).toBe('HTTP 502');
    }
  });

  it('appends query params when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await apiGet('/test', { page: '0', size: '10' });
    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain('page=0');
    expect(calledUrl).toContain('size=10');
  });
});
