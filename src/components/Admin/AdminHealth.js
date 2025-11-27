import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from './AdminLayout';
import {
  fetchHealth,
  fetchAdminStats,
  fetchInactiveUsers,
  fetchOrphanedContent,
  runCleanup,
  fetchUserStats,
  fetchTranslationStatus,
  fetchMissingTranslations,
} from '../../services/healthService';

function formatUptime(seconds) {
  if (!seconds && seconds !== 0) return '–';
  const s = Math.floor(seconds);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(' ');
}

function formatDateTime(value) {
  if (!value) return '–';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '–';
    return d.toLocaleString();
  } catch {
    return '–';
  }
}

function StatusPill({ status }) {
  let label = 'Unknown';
  let bg = '#e5e7eb';
  let color = '#374151';

  if (status === 'healthy') {
    label = 'Healthy';
    bg = '#dcfce7';
    color = '#166534';
  } else if (status === 'degraded') {
    label = 'Degraded';
    bg = '#fef9c3';
    color = '#854d0e';
  } else if (status === 'down') {
    label = 'Down';
    bg = '#fee2e2';
    color = '#991b1b';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: bg,
        color,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
        }}
      />
      {label}
    </span>
  );
}

function Card({ title, children, right }) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        background: '#fff',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        boxShadow: '0 1px 3px rgba(15,23,42,0.08)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: '#4b5563',
          }}
        >
          {title}
        </h3>
        {right}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function AdminHealth() {
  const { token } = useAuth();

  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState('');

  const [adminStats, setAdminStats] = useState(null);
  const [adminStatsLoading, setAdminStatsLoading] = useState(false);
  const [adminStatsError, setAdminStatsError] = useState('');

  const [userStats, setUserStats] = useState(null);
  const [userStatsLoading, setUserStatsLoading] = useState(false);
  const [userStatsError, setUserStatsError] = useState('');

  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [inactiveLoading, setInactiveLoading] = useState(false);
  const [inactiveError, setInactiveError] = useState('');

  const [orphaned, setOrphaned] = useState(null);
  const [orphanedLoading, setOrphanedLoading] = useState(false);
  const [orphanedError, setOrphanedError] = useState('');

  const [cleanupRunning, setCleanupRunning] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState('');

  const [translationStatus, setTranslationStatus] = useState(null);
  const [translationStatusLoading, setTranslationStatusLoading] = useState(false);
  const [translationStatusError, setTranslationStatusError] = useState('');

  const [missingTranslations, setMissingTranslations] = useState([]);
  const [missingLoading, setMissingLoading] = useState(false);
  const [missingError, setMissingError] = useState('');

  const loadHealth = useCallback(async () => {
    try {
      setHealthLoading(true);
      setHealthError('');
      const data = await fetchHealth(token);
      setHealth(data);
    } catch (e) {
      setHealthError(e.message || 'Failed to load health status');
    } finally {
      setHealthLoading(false);
    }
  }, [token]);

  const loadAdminStats = useCallback(async () => {
    try {
      setAdminStatsLoading(true);
      setAdminStatsError('');
      const data = await fetchAdminStats(token);
      setAdminStats(data);
    } catch (e) {
      setAdminStatsError(e.message || 'Failed to load system stats');
    } finally {
      setAdminStatsLoading(false);
    }
  }, [token]);

  const loadUserStats = useCallback(async () => {
    try {
      setUserStatsLoading(true);
      setUserStatsError('');
      const data = await fetchUserStats(token);
      setUserStats(data);
    } catch (e) {
      setUserStatsError(e.message || 'Failed to load user stats');
    } finally {
      setUserStatsLoading(false);
    }
  }, [token]);

  const loadTranslationStatus = useCallback(async () => {
    try {
      setTranslationStatusLoading(true);
      setTranslationStatusError('');
      const data = await fetchTranslationStatus(token);
      setTranslationStatus(data);
    } catch (e) {
      setTranslationStatusError(e.message || 'Failed to load translation status');
    } finally {
      setTranslationStatusLoading(false);
    }
  }, [token]);

  const loadInactiveUsers = useCallback(async () => {
    try {
      setInactiveLoading(true);
      setInactiveError('');
      const data = await fetchInactiveUsers(token);
      setInactiveUsers(data?.users || []);
    } catch (e) {
      setInactiveError(e.message || 'Failed to load inactive users');
    } finally {
      setInactiveLoading(false);
    }
  }, [token]);

  const loadOrphaned = useCallback(async () => {
    try {
      setOrphanedLoading(true);
      setOrphanedError('');
      const data = await fetchOrphanedContent(token);
      setOrphaned(data?.orphanedContent || null);
    } catch (e) {
      setOrphanedError(e.message || 'Failed to load orphaned content');
    } finally {
      setOrphanedLoading(false);
    }
  }, [token]);

  const loadMissingTranslations = useCallback(async () => {
    try {
      setMissingLoading(true);
      setMissingError('');
      const data = await fetchMissingTranslations(token);
      setMissingTranslations(Array.isArray(data) ? data : []);
    } catch (e) {
      setMissingError(e.message || 'Failed to load missing translations');
    } finally {
      setMissingLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      await Promise.all([
        loadHealth(),
        loadAdminStats(),
        loadUserStats(),
        loadTranslationStatus(),
        loadInactiveUsers(),
        loadOrphaned(),
        loadMissingTranslations(),
      ]);
    };

    init();

    const intervalId = setInterval(() => {
      if (cancelled) return;
      loadHealth();
      loadAdminStats();
      loadUserStats();
      loadTranslationStatus();
    }, 30000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [
    loadHealth,
    loadAdminStats,
    loadUserStats,
    loadTranslationStatus,
    loadInactiveUsers,
    loadOrphaned,
    loadMissingTranslations,
  ]);

  const overallStatus = useMemo(() => {
    if (!health) return 'unknown';
    if (health.ok && health.db?.ok) return 'healthy';
    if (!health.ok || health.db?.ok === false) return 'degraded';
    return 'unknown';
  }, [health]);

  const articleStats = adminStats?.stats?.articles;
  const userRoleBreakdown = adminStats?.stats?.users?.roles || {};
  const orphanedCounts = adminStats?.stats?.orphanedContent || {};

  async function handleRunCleanup() {
    if (!window.confirm('This will clean up orphaned data. Continue?')) return;
    try {
      setCleanupRunning(true);
      setCleanupMessage('');
      const res = await runCleanup(token);
      setCleanupMessage(res?.message || 'Cleanup completed');
      await Promise.all([loadOrphaned(), loadAdminStats()]);
    } catch (e) {
      setCleanupMessage(e.message || 'Cleanup failed');
    } finally {
      setCleanupRunning(false);
    }
  }

  return (
    <AdminLayout>
      <div
        style={{
          maxWidth: 1200,
          margin: '24px auto',
          padding: '0 24px 32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 700,
                color: '#111827',
              }}
            >
              Health & System Status
            </h1>
            <p
              style={{
                margin: '4px 0 0 0',
                color: '#6b7280',
                fontSize: 14,
              }}
            >
              Monitor backend health, content integrity, and localization coverage.
            </p>
          </div>
          <button
            onClick={() => {
              loadHealth();
              loadAdminStats();
              loadUserStats();
              loadTranslationStatus();
              loadInactiveUsers();
              loadOrphaned();
              loadMissingTranslations();
            }}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Refresh All
          </button>
        </div>

        {/* Top row: summary cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <Card
            title="Core Health"
            right={
              <StatusPill
                status={
                  overallStatus === 'healthy'
                    ? 'healthy'
                    : overallStatus === 'degraded'
                    ? 'degraded'
                    : 'down'
                }
              />
            }
          >
            {healthLoading && <div style={{ color: '#6b7280' }}>Checking…</div>}
            {healthError && (
              <div style={{ color: '#b91c1c', fontSize: 13 }}>{healthError}</div>
            )}
            {!healthLoading && !healthError && health && (
              <div style={{ fontSize: 13, color: '#4b5563' }}>
                <div style={{ marginBottom: 4 }}>
                  <strong>Uptime:</strong> {formatUptime(health.uptimeSec)}
                </div>
                <div style={{ marginBottom: 4 }}>
                  <strong>Latency:</strong> {health.latencyMs ?? '–'} ms
                </div>
                <div style={{ marginBottom: 4 }}>
                  <strong>DB:</strong>{' '}
                  <span
                    style={{
                      color: health.db?.ok ? '#15803d' : '#b91c1c',
                      fontWeight: 600,
                    }}
                  >
                    {health.db?.ok ? 'Healthy' : 'Unhealthy'}
                  </span>
                  {!health.db?.ok && health.db?.error && (
                    <span style={{ marginLeft: 6 }}>({health.db.error})</span>
                  )}
                </div>
                <div>
                  <strong>Last checked:</strong> {formatDateTime(health.time)}
                </div>
              </div>
            )}
          </Card>

          <Card title="System Stats">
            {adminStatsLoading && <div style={{ color: '#6b7280' }}>Loading…</div>}
            {adminStatsError && (
              <div style={{ color: '#b91c1c', fontSize: 13 }}>{adminStatsError}</div>
            )}
            {!adminStatsLoading && !adminStatsError && articleStats && (
              <div style={{ fontSize: 13, color: '#4b5563' }}>
                <div style={{ marginBottom: 4 }}>
                  <strong>Total Articles:</strong> {articleStats.total}
                </div>
                <div style={{ marginBottom: 4 }}>
                  <strong>Published:</strong> {articleStats.published} ·{' '}
                  <strong>Drafts:</strong> {articleStats.drafts} ·{' '}
                  <strong>Hidden:</strong> {articleStats.hidden}
                </div>
                <div>
                  <strong>Orphaned Items:</strong>{' '}
                  {Object.values(orphanedCounts).reduce(
                    (sum, v) => sum + (typeof v === 'number' ? v : 0),
                    0,
                  )}
                </div>
              </div>
            )}
          </Card>

          <Card title="User Health">
            {userStatsLoading && <div style={{ color: '#6b7280' }}>Loading…</div>}
            {userStatsError && (
              <div style={{ color: '#b91c1c', fontSize: 13 }}>{userStatsError}</div>
            )}
            {!userStatsLoading && !userStatsError && userStats?.stats && (
              <div style={{ fontSize: 13, color: '#4b5563' }}>
                <div style={{ marginBottom: 4 }}>
                  <strong>Total:</strong> {userStats.stats.totalUsers}
                </div>
                <div style={{ marginBottom: 4 }}>
                  <strong>Active:</strong> {userStats.stats.activeUsers}
                </div>
                <div>
                  <strong>Roles:</strong>{' '}
                  {userStats.stats.usersByRole
                    .map((r) => `${r.role}: ${r.count}`)
                    .join(' · ')}
                </div>
              </div>
            )}
          </Card>

          <Card title="Localization Coverage">
            {translationStatusLoading && (
              <div style={{ color: '#6b7280' }}>Loading…</div>
            )}
            {translationStatusError && (
              <div style={{ color: '#b91c1c', fontSize: 13 }}>
                {translationStatusError}
              </div>
            )}
            {!translationStatusLoading &&
              !translationStatusError &&
              translationStatus && (
                <div style={{ fontSize: 13, color: '#4b5563' }}>
                  <div style={{ marginBottom: 4 }}>
                    <strong>Articles:</strong> {translationStatus.total_articles}
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <strong>Fully translated:</strong> {translationStatus.fully_translated}
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <strong>Partially translated:</strong>{' '}
                    {translationStatus.partially_translated}
                  </div>
                  <div>
                    <strong>Not translated:</strong> {translationStatus.not_translated}
                  </div>
                </div>
              )}
          </Card>
        </div>

        {/* Middle row: tables */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <Card
            title="Inactive Users"
            right={
              <button
                onClick={loadInactiveUsers}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#2563eb',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Refresh
              </button>
            }
          >
            {inactiveLoading && <div style={{ color: '#6b7280' }}>Loading…</div>}
            {inactiveError && (
              <div style={{ color: '#b91c1c', fontSize: 13 }}>{inactiveError}</div>
            )}
            {!inactiveLoading && !inactiveError && (
              <div style={{ maxHeight: 260, overflow: 'auto' }}>
                {inactiveUsers.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#6b7280' }}>
                    No inactive users detected.
                  </div>
                ) : (
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 13,
                    }}
                  >
                    <thead>
                      <tr style={{ textAlign: 'left', background: '#f9fafb' }}>
                        <th style={{ padding: '6px 8px', color: '#6b7280' }}>Email</th>
                        <th style={{ padding: '6px 8px', color: '#6b7280' }}>Name</th>
                        <th style={{ padding: '6px 8px', color: '#6b7280' }}>Role</th>
                        <th style={{ padding: '6px 8px', color: '#6b7280' }}>
                          Last Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {inactiveUsers.map((u) => (
                        <tr key={u.id}>
                          <td
                            style={{
                              padding: '6px 8px',
                              borderTop: '1px solid #e5e7eb',
                            }}
                          >
                            {u.email}
                          </td>
                          <td
                            style={{
                              padding: '6px 8px',
                              borderTop: '1px solid #e5e7eb',
                            }}
                          >
                            {u.displayName}
                          </td>
                          <td
                            style={{
                              padding: '6px 8px',
                              borderTop: '1px solid #e5e7eb',
                              textTransform: 'capitalize',
                            }}
                          >
                            {u.role}
                          </td>
                          <td
                            style={{
                              padding: '6px 8px',
                              borderTop: '1px solid #e5e7eb',
                            }}
                          >
                            {formatDateTime(u.updatedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </Card>

          <Card
            title="Data Integrity (Orphaned Content)"
            right={
              <button
                onClick={loadOrphaned}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#2563eb',
                  fontSize: 12,
                  cursor: 'pointer',
                  marginRight: 8,
                }}
              >
                Refresh
              </button>
            }
          >
            {orphanedLoading && <div style={{ color: '#6b7280' }}>Loading…</div>}
            {orphanedError && (
              <div style={{ color: '#b91c1c', fontSize: 13 }}>{orphanedError}</div>
            )}
            {!orphanedLoading && !orphanedError && (
              <div style={{ fontSize: 13, color: '#4b5563' }}>
                {orphaned ? (
                  <>
                    <ul style={{ paddingLeft: 18, marginTop: 0, marginBottom: 8 }}>
                      <li>
                        Articles without translations:{' '}
                        {orphaned.articlesWithoutTranslations?.length ?? 0}
                      </li>
                      <li>
                        Translations without articles:{' '}
                        {orphaned.translationsWithoutArticles?.length ?? 0}
                      </li>
                      <li>
                        Tags without articles:{' '}
                        {orphaned.tagsWithoutArticles?.length ?? 0}
                      </li>
                      <li>
                        Categories without articles:{' '}
                        {orphaned.categoriesWithoutArticles?.length ?? 0}
                      </li>
                    </ul>
                    <button
                      onClick={handleRunCleanup}
                      disabled={cleanupRunning}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: '#dc2626',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: cleanupRunning ? 'default' : 'pointer',
                      }}
                    >
                      {cleanupRunning ? 'Running Cleanup…' : 'Run Cleanup'}
                    </button>
                    {cleanupMessage && (
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 12,
                          color: '#6b7280',
                        }}
                      >
                        {cleanupMessage}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ color: '#6b7280' }}>
                    No orphaned content information available.
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Bottom row: localization health */}
        <Card
          title="Localization Health & Missing Translations"
          right={
            <button
              onClick={() => {
                loadTranslationStatus();
                loadMissingTranslations();
              }}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#2563eb',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Refresh
            </button>
          }
        >
          {translationStatusLoading || missingLoading ? (
            <div style={{ color: '#6b7280' }}>Loading…</div>
          ) : null}
          {translationStatusError && (
            <div style={{ color: '#b91c1c', fontSize: 13, marginBottom: 4 }}>
              {translationStatusError}
            </div>
          )}
          {missingError && (
            <div style={{ color: '#b91c1c', fontSize: 13, marginBottom: 4 }}>
              {missingError}
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)',
              gap: 16,
            }}
          >
            <div style={{ fontSize: 13, color: '#4b5563' }}>
              {translationStatus && translationStatus.language_breakdown && (
                <>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    Per-language coverage
                  </div>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {Object.entries(translationStatus.language_breakdown).map(
                      ([lang, info]) => (
                        <li key={lang}>
                          <strong>{lang}</strong>: {info.translated_articles} articles (
                          {info.completion_percentage}%)
                        </li>
                      ),
                    )}
                  </ul>
                </>
              )}
            </div>

            <div style={{ fontSize: 13, color: '#4b5563' }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                Missing translations ({missingTranslations.length})
              </div>
              <div style={{ maxHeight: 220, overflow: 'auto' }}>
                {missingTranslations.length === 0 ? (
                  <div style={{ color: '#6b7280' }}>
                    No missing translations detected.
                  </div>
                ) : (
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 12,
                    }}
                  >
                    <thead>
                      <tr style={{ textAlign: 'left', background: '#f9fafb' }}>
                        <th style={{ padding: '6px 8px', color: '#6b7280' }}>
                          Article ID
                        </th>
                        <th style={{ padding: '6px 8px', color: '#6b7280' }}>
                          Missing Languages
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {missingTranslations.map((row) => (
                        <tr key={row.article_id}>
                          <td
                            style={{
                              padding: '6px 8px',
                              borderTop: '1px solid #e5e7eb',
                              fontFamily: 'monospace',
                            }}
                          >
                            {row.article_id}
                          </td>
                          <td
                            style={{
                              padding: '6px 8px',
                              borderTop: '1px solid #e5e7eb',
                            }}
                          >
                            {Array.isArray(row.missing_languages)
                              ? row.missing_languages.join(', ')
                              : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}