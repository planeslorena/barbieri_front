'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Menu } from '@/app/components/Navbar/navbar';
import { AgendaAdminPanel } from '@/app/components/admin/AgendaAdminPanel';
import { AdministradoresPanel } from '@/app/components/admin/AdministradoresPanel';
import { BloqueosPanel } from '@/app/components/admin/BloqueosPanel';
import { ClientesPanel } from '@/app/components/admin/ClientesPanel';
import { ProfesionalesPanel } from '@/app/components/admin/ProfesionalesPanel';
import { ServiciosPanel } from '@/app/components/admin/ServiciosPanel';
import { adminApi } from '@/app/services/admin';
import type { CategoriaServicioAdmin, ClienteAdmin, ProfesionalAdmin, ServicioAdmin, UsuarioAdmin } from '@/app/types/admin';
import './page.css';

const loadAdminResource = async <T,>(label: string, request: () => Promise<T>) => {
    try {
        return await request();
    } catch (error: any) {
        const status = error?.response?.status;
        const detail = status ? `${label} (${status})` : label;
        throw new Error(`No se pudieron cargar: ${detail}`);
    }
};

export default function Admin() {
    const [activeTab, setActiveTab] = useState('agenda');
    const [loading, setLoading] = useState(true);
    const [profesionales, setProfesionales] = useState<ProfesionalAdmin[]>([]);
    const [servicios, setServicios] = useState<ServicioAdmin[]>([]);
    const [categorias, setCategorias] = useState<CategoriaServicioAdmin[]>([]);
    const [clientes, setClientes] = useState<ClienteAdmin[]>([]);
    const [administradores, setAdministradores] = useState<UsuarioAdmin[]>([]);

    const reloadAll = useCallback(async () => {
        const [profesionalesResp, serviciosResp, categoriasResp, clientesResp, administradoresResp] = await Promise.all([
            loadAdminResource('profesionales', adminApi.getProfesionales),
            loadAdminResource('servicios', adminApi.getServicios),
            loadAdminResource('categorias', adminApi.getCategorias),
            loadAdminResource('pacientes', adminApi.getClientes),
            loadAdminResource('administradores', adminApi.getAdministradores),
        ]);

        setProfesionales(profesionalesResp);
        setServicios(serviciosResp);
        setCategorias(categoriasResp);
        setClientes(clientesResp);
        setAdministradores(administradoresResp);
    }, []);

    useEffect(() => {
        reloadAll()
            .catch((error) => Swal.fire('Error', error.message || 'No se pudieron cargar los datos del administrador.', 'error'))
            .finally(() => setLoading(false));
    }, [reloadAll]);

    const commonProps = {
        profesionales,
        servicios,
        categorias,
        clientes,
        administradores,
        reloadAll,
    };

    return (
        <>
            <Menu />
            <main className="admin-page">
                <section className="admin-shell">
                    <div className="admin-header">
                        <div>
                            <span className="admin-eyebrow">Gestion interna - Panel administrador</span>
                        </div>
                    </div>

                    <div className="admin-tabs-row">
                        <div className="admin-tabs" role="tablist" aria-label="Secciones admin">
                            {[
                                ['agenda', 'Agenda'],
                                ['clientes', 'Pacientes'],
                                ['profesionales', 'Profesionales'],
                                ['servicios', 'Servicios'],
                                ['bloqueos', 'Bloqueos'],
                                ['administradores', 'Administradores'],
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
                            className="admin-icon-btn admin-refresh-btn"
                            onClick={reloadAll}
                            aria-label="Actualizar datos"
                            title="Actualizar datos"
                        >
                            <i className="bi bi-arrow-clockwise" />
                        </button>
                    </div>

                    {loading && <div className="admin-loading">Cargando datos...</div>}

                    {!loading && activeTab === 'agenda' && <AgendaAdminPanel {...commonProps} />}
                    {!loading && activeTab === 'profesionales' && <ProfesionalesPanel {...commonProps} />}
                    {!loading && activeTab === 'servicios' && <ServiciosPanel {...commonProps} />}
                    {!loading && activeTab === 'clientes' && <ClientesPanel {...commonProps} />}
                    {!loading && activeTab === 'bloqueos' && <BloqueosPanel {...commonProps} />}
                    {!loading && activeTab === 'administradores' && <AdministradoresPanel {...commonProps} />}
                </section>
            </main>
        </>
    )
}
