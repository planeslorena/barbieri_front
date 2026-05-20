'use client';

import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Menu } from '@/app/components/Navbar/navbar';
import { AgendaAdminPanel } from '@/app/components/admin/AgendaAdminPanel';
import { BloqueosPanel } from '@/app/components/admin/BloqueosPanel';
import { apiMessage } from '@/app/components/admin/adminUtils';
import { PacientesProfesionalPanel } from '@/app/components/profesional/PacientesProfesionalPanel';
import { PerfilProfesionalPanel } from '@/app/components/profesional/PerfilProfesionalPanel';
import { ServiciosProfesionalPanel } from '@/app/components/profesional/ServiciosProfesionalPanel';
import { profesionalApi } from '@/app/services/profesional';
import type { ClienteAdmin, ProfesionalAdmin } from '@/app/types/admin';
import '../admin/page.css';

const AUTO_REFRESH_INTERVAL_MS = 15 * 60 * 1000;

function canAutoRefreshPanel() {
  return document.visibilityState === 'visible' && !document.querySelector('.modal.show');
}

export default function ProfesionalPage() {
  const [activeTab, setActiveTab] = useState('agenda');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [profesional, setProfesional] = useState<ProfesionalAdmin | null>(null);
  const [pacientes, setPacientes] = useState<ClienteAdmin[]>([]);

  const reloadAll = useCallback(async () => {
    const [profesionalResp, pacientesResp] = await Promise.all([
      profesionalApi.getMe(),
      profesionalApi.getPacientes(),
    ]);

    setProfesional(profesionalResp);
    setPacientes(pacientesResp);
  }, []);

  useEffect(() => {
    reloadAll()
      .catch((error) => Swal.fire('Error', apiMessage(error), 'error'))
      .finally(() => setLoading(false));
  }, [reloadAll]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);
    try {
      await reloadAll();
      setRefreshKey((current) => current + 1);
    } catch (error) {
      Swal.fire('Error', apiMessage(error), 'error');
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, reloadAll]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (loading || refreshing || !canAutoRefreshPanel()) return;

      void handleRefresh();
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [handleRefresh, loading, refreshing]);

  const servicios = profesional?.servicios || [];
  const profesionales = profesional ? [profesional] : [];
  const commonProps = {
    profesionales,
    servicios,
    categorias: [],
    clientes: pacientes,
    administradores: [],
    reloadAll,
    refreshKey,
  };
  const agendaApi = {
    getTurnos: ({ desde, hasta }: { desde: string; hasta: string; id_profesional?: number }) =>
      profesionalApi.getTurnos({ desde, hasta }),
    getBloqueos: ({ desde, hasta }: { desde?: string; hasta?: string; id_profesional?: number }) =>
      profesionalApi.getBloqueos({ desde, hasta }),
    createTurno: profesionalApi.createTurno,
    cancelarTurno: profesionalApi.cancelarTurno,
    updateReservaPago: profesionalApi.updateReservaPago,
  };
  const bloqueosApi = {
    getBloqueos: ({ desde, hasta }: { desde?: string; hasta?: string; id_profesional?: number }) =>
      profesionalApi.getBloqueos({ desde, hasta }),
    createBloqueo: profesionalApi.createBloqueo,
    deleteBloqueo: profesionalApi.deleteBloqueo,
  };

  return (
    <>
      <Menu />
      <main className="admin-page">
        <section className="admin-shell">
          <div className="admin-header">
            <div>
              <span className="admin-eyebrow">Panel profesional</span>
            </div>
          </div>

          <div className="admin-tabs-row">
            <div className="admin-tabs" role="tablist" aria-label="Secciones profesional">
              {[
                ['agenda', 'Agenda'],
                ['pacientes', 'Pacientes'],
                ['bloqueos', 'Bloqueos'],
                ['servicios', 'Mis servicios'],
                ['perfil', 'Mi perfil'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`admin-tab ${activeTab === key ? 'active' : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={`admin-icon-btn admin-refresh-btn ${refreshing ? 'is-refreshing' : ''}`}
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label="Actualizar datos"
              title={refreshing ? 'Actualizando...' : 'Actualizar datos'}
            >
              <i className="bi bi-arrow-clockwise" />
            </button>
          </div>

          {loading && <div className="admin-loading">Cargando datos...</div>}
          {!loading && !profesional && <div className="admin-loading">No se encontro el profesional asociado a tu usuario.</div>}

          {!loading && profesional && activeTab === 'agenda' && (
            <AgendaAdminPanel {...commonProps} agendaApi={agendaApi} hideProfessionalSelect />
          )}
          {!loading && profesional && activeTab === 'pacientes' && (
            <PacientesProfesionalPanel pacientes={pacientes} profesional={profesional} />
          )}
          {!loading && profesional && activeTab === 'bloqueos' && (
            <BloqueosPanel {...commonProps} bloqueosApi={bloqueosApi} hideProfessionalSelect />
          )}
          {!loading && profesional && activeTab === 'servicios' && <ServiciosProfesionalPanel servicios={servicios} />}
          {!loading && profesional && activeTab === 'perfil' && <PerfilProfesionalPanel profesional={profesional} onSaved={reloadAll} />}
        </section>
      </main>
    </>
  );
}
