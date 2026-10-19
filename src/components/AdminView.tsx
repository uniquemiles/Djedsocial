import { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, Database, Terminal } from 'lucide-react';
import type { Report, AuditLog } from '../types/index.js';

export function AdminView() {
  const [reports, setReports] = useState<Report[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'reports' | 'audit' | 'telemetry'>('reports');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsRes, logsRes] = await Promise.all([
        fetch('/api/v1/admin/reports'),
        fetch('/api/v1/admin/audit-logs'),
      ]);

      if (reportsRes.ok) {
        const rData = await reportsRes.json();
        setReports(rData.reports || []);
      }
      if (logsRes.ok) {
        const lData = await logsRes.json();
        setAuditLogs(lData.auditLogs || []);
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      const res = await fetch(`/api/v1/admin/reports/${reportId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setActionMessage(`Report marked as ${status}.`);
        setTimeout(() => setActionMessage(null), 3000);
        loadData();
      }
    } catch (err) {
      console.error('Failed to update report', err);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-bronze-subtle">
        <div>
          <h1 className="font-cinzel text-xl md:text-2xl font-bold text-gold flex items-center gap-2">
            <ShieldCheck size={24} />
            <span>Hall of Ma’at (Sovereign Administration)</span>
          </h1>
          <p className="text-xs md:text-sm text-muted-bronze mt-1">
            Ensuring harmony, reviewing reports, auditing interventions, and verifying database integrity.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3 py-1.5 rounded-lg btn-secondary-bronze text-xs cursor-pointer hover:text-gold"
        >
          Refresh Docket
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-lg bg-[#1a2b1f] border border-[#69B88A]/50 text-xs text-[#69B88A]">
          {actionMessage}
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-6 border-b border-bronze-subtle text-xs font-semibold">
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-2.5 cursor-pointer ${
            activeTab === 'reports' ? 'text-gold border-b-2 border-gold' : 'text-muted-bronze'
          }`}
        >
          Reports Docket ({reports.filter((r) => r.status === 'pending').length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2.5 cursor-pointer ${
            activeTab === 'audit' ? 'text-gold border-b-2 border-gold' : 'text-muted-bronze'
          }`}
        >
          Immutable Audit Log ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`pb-2.5 cursor-pointer ${
            activeTab === 'telemetry' ? 'text-gold border-b-2 border-gold' : 'text-muted-bronze'
          }`}
        >
          Architecture & Datastore Status
        </button>
      </div>

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-bronze">
              Reading balance scales...
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#15100D] border border-bronze-subtle text-center text-xs text-muted-bronze">
              All scales are in balance. No pending violations.
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-xl bg-[#15100D] border border-bronze-subtle flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        report.status === 'pending'
                          ? 'bg-[#E8B65B]/20 text-[#E8B65B] border border-[#E8B65B]/40'
                          : 'bg-[#69B88A]/20 text-[#69B88A]'
                      }`}
                    >
                      {report.status}
                    </span>
                    <span className="text-xs text-muted-bronze">
                      Target: <strong className="text-ivory">{report.targetType}</strong> ({report.targetId})
                    </span>
                    <span className="text-xs text-muted-bronze">·</span>
                    <span className="text-xs text-muted-bronze">
                      Filed by <strong className="text-gold">{report.reporterName}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-ivory font-semibold mb-1">Reason: {report.reason}</p>
                  {report.details && (
                    <p className="text-xs text-muted-bronze italic">"{report.details}"</p>
                  )}
                  <span className="text-[10px] text-muted-bronze mt-1 block">
                    Recorded {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>

                {report.status === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleResolve(report.id, 'dismissed')}
                      className="px-3 py-1.5 rounded-lg btn-secondary-bronze text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <X size={13} />
                      <span>Dismiss</span>
                    </button>
                    <button
                      onClick={() => handleResolve(report.id, 'resolved')}
                      className="px-3 py-1.5 rounded-lg btn-primary-bronze text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={13} />
                      <span>Enforce Ma’at (Resolve)</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="p-4 rounded-xl bg-[#15100D] border border-bronze-subtle">
          <div className="space-y-3 font-mono text-xs">
            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-bronze">
                No administrative interventions logged yet.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded bg-[#0c0907] border border-bronze-subtle/40 flex flex-col md:flex-row md:items-center justify-between gap-2"
                >
                  <div>
                    <span className="text-gold font-bold">[{log.action}]</span>{' '}
                    <span className="text-ivory">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-muted-bronze shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Architecture & Telemetry Tab */}
      {activeTab === 'telemetry' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-[#15100D] border border-bronze-subtle space-y-3">
            <div className="flex items-center gap-2 text-gold">
              <Database size={18} />
              <h3 className="font-cinzel text-sm font-bold">PostgreSQL Engine Specification</h3>
            </div>
            <div className="space-y-2 text-xs text-muted-bronze">
              <div className="flex justify-between">
                <span>Database Engine:</span>
                <span className="text-ivory font-semibold">Neon PostgreSQL 16+</span>
              </div>
              <div className="flex justify-between">
                <span>Schema Migrations:</span>
                <span className="text-gold font-semibold">0000_initial.sql (Applied)</span>
              </div>
              <div className="flex justify-between">
                <span>Connection Pool:</span>
                <span className="text-ivory font-semibold">Isolated Dev / Neon Branch</span>
              </div>
              <div className="flex justify-between">
                <span>Persistence Mode:</span>
                <span className="text-ivory font-semibold">Encrypted local journal + PostgreSQL</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#15100D] border border-bronze-subtle space-y-3">
            <div className="flex items-center gap-2 text-gold">
              <Terminal size={18} />
              <h3 className="font-cinzel text-sm font-bold">Real-time WebSocket Pillar</h3>
            </div>
            <div className="space-y-2 text-xs text-muted-bronze">
              <div className="flex justify-between">
                <span>WS Endpoint:</span>
                <span className="text-ivory font-mono">/ws</span>
              </div>
              <div className="flex justify-between">
                <span>Origin Check:</span>
                <span className="text-[#69B88A] font-semibold">Enforced</span>
              </div>
              <div className="flex justify-between">
                <span>Token Authentication:</span>
                <span className="text-[#69B88A] font-semibold">Session Token</span>
              </div>
              <div className="flex justify-between">
                <span>Latency Threshold:</span>
                <span className="text-ivory font-semibold">&lt; 30ms</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
