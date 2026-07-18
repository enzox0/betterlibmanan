import { useState, useEffect } from "react";
import type { ContentRecord } from "../types/admin.types";

export function useContentFilter(
  records: ContentRecord[],
  searchTerm: string,
  statusFilter: "all" | "published" | "draft",
): ContentRecord[] {
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  return records.filter((record) => {
    const matchesSearch = record.title
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
}
