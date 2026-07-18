import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAdminStore } from "../store/adminStore";
import { TableSkeletonRows, Pagination } from "@/shared/ui";
import {
  fetchAuditLogs,
  type AuditLog,
  type AuditAction,
  type AuditQueryParams,
} from "../services/audit.api";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const ACTION_META: Record<AuditAction, { label: string; classes: string }> = {
  LOGIN: {
    label: "Login",
    classes: "bg-green-50 text-green-700 ring-1 ring-green-200",
  },
  LOGOUT: {
    label: "Logout",
    classes: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
  },
  LOGOUT_ALL: {
    label: "Logout All",
    classes: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
  },
  CREATE: {
    label: "Create",
    classes: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  },
  READ: {
    label: "Read",
    classes: "bg-slate-50 text-slate-600 ring-1 ring-slate-200",
  },
  UPDATE: {
    label: "Update",
    classes: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  },
  DELETE: {
    label: "Delete",
    classes: "bg-red-50 text-red-700 ring-1 ring-red-200",
  },
  ACTIVATE: {
    label: "Activate",
    classes: "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
  },
  DEACTIVATE: {
    label: "Deactivate",
    classes: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  },
};

function ActionBadge({ action }: { action: AuditAction }) {
  const meta = ACTION_META[action] ?? {
    label: action,
    classes: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${meta.classes}`}
    >
      {meta.label}
    </span>
  );
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function AuditLogsPage() {
  const accessToken = useAdminStore((s) => s.accessToken);

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
  });
  const [filters, setFilters] = useState<AuditQueryParams>({
    page: 1,
    limit: 20,
  });

  const loadLogs = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setApiError(null);
    try {
      const result = await fetchAuditLogs(filters, accessToken);
      setLogs(result.logs);
      setPagination(result.pagination);
    } catch (err: any) {
      setApiError(err?.response?.data?.message || "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, filters]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  function setFilter(
    key: keyof AuditQueryParams,
    value: string | number | undefined,
  ) {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-0.5 text-sm text-gray-400">
          A complete record of all admin actions performed in the system.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.action ?? ""}
            onChange={(e) => setFilter("action", e.target.value as AuditAction)}
            aria-label="Filter by action"
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          >
            <option value="">All Actions</option>
            {(Object.keys(ACTION_META) as AuditAction[]).map((a) => (
              <option key={a} value={a}>
                {ACTION_META[a].label}
              </option>
            ))}
          </select>
          <select
            value={filters.module ?? ""}
            onChange={(e) => setFilter("module", e.target.value)}
            aria-label="Filter by module"
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          >
            <option value="">All Modules</option>
            <option value="Auth">Auth</option>
            <option value="AccountManagement">Account Management</option>
          </select>
          <input
            type="date"
            value={filters.fromDate ?? ""}
            onChange={(e) => setFilter("fromDate", e.target.value)}
            aria-label="From date"
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <input
            type="date"
            value={filters.toDate ?? ""}
            onChange={(e) => setFilter("toDate", e.target.value)}
            aria-label="To date"
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <button
            type="button"
            onClick={() => setFilters({ page: 1, limit: 20 })}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
          >
            Clear
          </button>
        </div>
      </div>

      {apiError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {apiError}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Timestamp
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                  User
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Role
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Action
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Module
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Description
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                  IP Address
                </th>
              </tr>
            </thead>

            {loading ? (
              <tbody>
                <TableSkeletonRows rows={10} cols={7} />
              </tbody>
            ) : (
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-sm text-gray-400"
                    >
                      No audit logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log._id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-800">
                          {log.adminDisplayName}
                        </p>
                        <p className="text-xs text-gray-400">
                          @{log.adminUsername}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 capitalize">
                        {log.adminRole === "superadmin"
                          ? "Super Admin"
                          : "Admin"}
                      </td>
                      <td className="px-5 py-3.5">
                        <ActionBadge action={log.action} />
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">
                        {log.module}
                      </td>
                      <td
                        className="px-5 py-3.5 text-xs text-gray-600 max-w-xs truncate"
                        title={log.description}
                      >
                        {log.description}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">
                        {log.ipAddress ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={pagination.page}
          totalPages={pagination.pages}
          total={pagination.total}
          pageSize={pagination.limit}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
        />
      </div>
    </motion.div>
  );
}
