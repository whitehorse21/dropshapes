import { useState, useEffect, useCallback, useRef } from "react";

export default function useAdminUsers(limit = 20) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // ✅ New
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const abortControllerRef = useRef(null);

  // 🔹 Fetch Users
  const fetchUsers = useCallback(
    async (query = "", pageNumber = 1) => {
      try {
        setLoading(true);

        // Abort previous request if running
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const token = localStorage.getItem("access");
        const offset = (pageNumber - 1) * limit;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;

        const endpoint = query
          ? `${baseUrl}admin/users/search?search_term=${query}&limit=${limit}&offset=${offset}`
          : `${baseUrl}admin/users?limit=${limit}&offset=${offset}`;

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();
        setUsers(data.users || data || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching users:", error);
        }
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  // 🔹 Fetch Total Users
  const fetchUsersCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("access");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}admin/users/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch users count");

      const data = await res.json();
      setTotalUsers(data.total_users || data.count || 0);
    } catch (error) {
      console.error("Error fetching user count:", error);
    }
  }, []);

  // 🔹 Debounce the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new search
    }, 600);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 🔹 Fetch when debounced search changes
  useEffect(() => {
    fetchUsers(debouncedSearch, page);
  }, [debouncedSearch, page, fetchUsers]);

  // 🔹 Fetch total users on mount
  useEffect(() => {
    fetchUsersCount();
  }, [fetchUsersCount]);

  const totalPages = Math.ceil(totalUsers / limit);

  return {
    users,
    loading,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    totalUsers,
    totalPages,
    fetchUsers,
    fetchUsersCount,
  };
}
