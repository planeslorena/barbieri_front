'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Menu } from '@/app/components/Navbar/navbar';
import { AgendaAdminPanel } from '@/app/components/admin/AgendaAdminPanel';
import { BloqueosPanel } from '@/app/components/admin/BloqueosPanel';
import { ClientesPanel } from '@/app/components/admin/ClientesPanel';
import { ProfesionalesPanel } from '@/app/components/admin/ProfesionalesPanel';
import { ServiciosPanel } from '@/app/components/admin/ServiciosPanel';
import { adminApi } from '@/app/services/admin';
import type { CategoriaServicioAdmin, ClienteAdmin, ProfesionalAdmin, ServicioAdmin } from '@/app/types/admin';
import './page.css';

export default function Admin() {
    const [activeTab, setActiveTab] = useState('agenda');
    const [loading, setLoading] = useState(true);
    const [profesionales, setProfesionales] = useState<ProfesionalAdmin[]>([]);
    const [servicios, setServicios] = useState<ServicioAdmin[]>([]);
    const [categorias, setCategorias] = useState<CategoriaServicioAdmin[]>([]);
    const [clientes, setClientes] = useState<ClienteAdmin[]>([]);

    const reloadAll = useCallback(async () => {
        const [profesionalesResp, serviciosResp, categoriasResp, clientesResp] = await Promise.all([
            adminApi.getProfesionales(),
            adminApi.getServicios(),
            adminApi.getCategorias(),
            adminApi.getClientes(),
        ]);

        setProfesionales(profesionalesResp);
        setServicios(serviciosResp);
        setCategorias(categoriasResp);
        setClientes(clientesResp);
    }, []);

    useEffect(() => {
        reloadAll()
            .catch(() => Swal.fire('Error', 'No se pudieron cargar los datos del administrador.', 'error'))
            .finally(() => setLoading(false));
    }, [reloadAll]);

    const commonProps = {
        profesionales,
        servicios,
        categorias,
        clientes,
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
                        <button type="button" className="btn-style admin-primary-btn" onClick={reloadAll}>
                            Actualizar
                        </button>
                    </div>

                    <div className="admin-tabs" role="tablist" aria-label="Secciones admin">
                        {[
                            ['agenda', 'Agenda'],
                            ['profesionales', 'Profesionales'],
                            ['servicios', 'Servicios'],
                            ['clientes', 'Clientes'],
                            ['bloqueos', 'Bloqueos'],
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

                    {loading && <div className="admin-loading">Cargando datos...</div>}

                    {!loading && activeTab === 'agenda' && <AgendaAdminPanel {...commonProps} />}
                    {!loading && activeTab === 'profesionales' && <ProfesionalesPanel {...commonProps} />}
                    {!loading && activeTab === 'servicios' && <ServiciosPanel {...commonProps} />}
                    {!loading && activeTab === 'clientes' && <ClientesPanel {...commonProps} />}
                    {!loading && activeTab === 'bloqueos' && <BloqueosPanel {...commonProps} />}
                </section>
            </main>
        </>
    )
}
