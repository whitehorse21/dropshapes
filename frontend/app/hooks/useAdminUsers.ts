'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '@/app/apimodule/utils/apiService';
import endpoints from '@/app/apimodule/endpoints/ApiEndpoints';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  ai_requests: number;
  last_active: string | null;
  created_at: string;
  profile_picture?: string | null;
}

export function useAdminUsers(limit = 20) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const fetchUsers = useCallback(
    async (query: string, pageNum: number) => {
      try {
        setLoading(true);
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        const offset = (pageNum - 1) * limit;

        if (query.trim()) {
          const res = await apiService.get(endpoints.adminUsersSearch, {
            params: { search_term: query, limit, offset },
            signal: abortRef.current.signal,
          });
          setUsers(Array.isArray(res.data) ? res.data : []);
        } else {
          const res = await apiService.get(endpoints.adminUsers, {
            params: { limit, offset },
            signal: abortRef.current.signal,
          });
          setUsers(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setUsers([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  const fetchCount = useCallback(async () => {
    try {
      const res = await apiService.get(endpoints.adminUsersCount);
      const count = (res.data as { total_users?: number })?.total_users ?? 0;
      setTotalUsers(count);
    } catch {
      setTotalUsers(0);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers(debouncedSearch, page);
  }, [debouncedSearch, page, fetchUsers]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  const totalPages = Math.ceil(totalUsers / limit) || 1;

  return {
    users,
    loading,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    totalUsers,
    totalPages,
  };
}

export default useAdminUsers;
