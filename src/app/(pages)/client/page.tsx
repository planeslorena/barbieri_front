'use client'
import { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Menu } from "@/app/components/Navbar/navbar";
import SeleccionProfesional from "@/app/components/turnos/SeleccionProfesional";
import SeleccionServicio from "@/app/components/turnos/SeleccionServicio";
import CalendarioTurnos from "@/app/components/turnos/CalendarioTurnos";
import HorariosTurnos from "@/app/components/turnos/HorariosTurnos";
import ConfirmarTurno from "@/app/components/turnos/ConfirmarTurno";
import ResumenTurno from "@/app/components/turnos/ResumenTurno";
import MisTurnos from "@/app/components/turnos/MisTurnos";
import {
    cancelarTurno,
    getMisProximosTurnos,
    getProfesionalesConServicios,
    type ProfesionalTurno,
    type ServicioTurno,
    type TurnoCliente
} from "@/app/services/turnos";
import type { PasoTurno, SeleccionTurno } from "@/app/components/turnos/types";
import { UserContext } from "@/app/context/user.context";
import "./page.css";

export default function Client() {
    const { userData } = useContext(UserContext);
    const [vista, setVista] = useState<'mis-turnos' | 'reservar'>('mis-turnos');
    const [paso, setPaso] = useState<PasoTurno>('profesional');
    const [profesionales, setProfesionales] = useState<ProfesionalTurno[]>([]);
    const [misTurnos, setMisTurnos] = useState<TurnoCliente[]>([]);
    const [loadingProfesionales, setLoadingProfesionales] = useState(true);
    const [loadingMisTurnos, setLoadingMisTurnos] = useState(true);
    const [cancelandoTurnoId, setCancelandoTurnoId] = useState<number | null>(null);
    const [errorProfesionales, setErrorProfesionales] = useState('');
    const [errorMisTurnos, setErrorMisTurnos] = useState('');
    const [seleccion, setSeleccion] = useState<SeleccionTurno>({
        profesional: null,
        servicio: null,
        fecha: '',
        hora: '',
    });

    const cargarProfesionales = async () => {
        try {
            setLoadingProfesionales(true);
            setErrorProfesionales('');
            const data = await getProfesionalesConServicios();
            setProfesionales(data);
        } catch {
            setErrorProfesionales('No pudimos cargar los profesionales. Intentá nuevamente.');
        } finally {
            setLoadingProfesionales(false);
        }
    };

    const cargarMisTurnos = async () => {
        try {
            setLoadingMisTurnos(true);
            setErrorMisTurnos('');
            const data = await getMisProximosTurnos();
            setMisTurnos(data);
        } catch {
            setErrorMisTurnos('No pudimos cargar tus próximos turnos. Intentá nuevamente.');
        } finally {
            setLoadingMisTurnos(false);
        }
    };

    useEffect(() => {
        cargarProfesionales();
        cargarMisTurnos();
    }, []);

    const seleccionarProfesional = (profesional: ProfesionalTurno) => {
        setSeleccion({
            profesional,
            servicio: null,
            fecha: '',
            hora: '',
        });
        setPaso('servicio');
    };

    const seleccionarServicio = (servicio: ServicioTurno) => {
        setSeleccion((prev) => ({
            ...prev,
            servicio,
            fecha: '',
            hora: '',
        }));
        setPaso('fecha');
    };

    const seleccionarFecha = (fecha: string) => {
        setSeleccion((prev) => ({
            ...prev,
            fecha,
            hora: '',
        }));
        setPaso('horario');
    };

    const seleccionarHora = (hora: string) => {
        setSeleccion((prev) => ({
            ...prev,
            hora,
        }));
        setPaso('confirmacion');
    };

    const resetTurno = () => {
        setSeleccion({
            profesional: null,
            servicio: null,
            fecha: '',
            hora: '',
        });
        setPaso('profesional');
    };

    const volverAProfesional = () => {
        setSeleccion({
            profesional: null,
            servicio: null,
            fecha: '',
            hora: '',
        });
        setPaso('profesional');
    };

    const volverAServicio = () => {
        setSeleccion((prev) => ({
            ...prev,
            servicio: null,
            fecha: '',
            hora: '',
        }));
        setPaso('servicio');
    };

    const volverAFecha = () => {
        setSeleccion((prev) => ({
            ...prev,
            fecha: '',
            hora: '',
        }));
        setPaso('fecha');
    };

    const volverAHorario = () => {
        setSeleccion((prev) => ({
            ...prev,
            hora: '',
        }));
        setPaso('horario');
    };

    const turnoConfirmado = () => {
        cargarMisTurnos();
        setVista('mis-turnos');
    };

    const abrirReserva = () => {
        resetTurno();
        setVista('reservar');
    };

    const cancelarReserva = () => {
        resetTurno();
        setVista('mis-turnos');
    };

    const cancelarTurnoCliente = async (idTurno: number) => {
        const result = await Swal.fire({
            title: 'Cancelar turno',
            text: 'Esta acción solo está disponible hasta 24 hs antes del turno.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'Volver',
            confirmButtonColor: '#a18d41',
        });

        if (!result.isConfirmed) return;

        try {
            setCancelandoTurnoId(idTurno);
            await cancelarTurno(idTurno);
            await cargarMisTurnos();
            Swal.fire({
                title: 'Turno cancelado',
                text: 'Comunicate con el administrador para información de devolución de reserva.',
                icon: 'success',
                confirmButtonColor: '#a18d41',
            });
        } catch {
            Swal.fire({
                title: 'No se pudo cancelar',
                text: 'Recordá que los turnos solo se pueden cancelar con 24 hs de anticipación.',
                icon: 'error',
                confirmButtonColor: '#a18d41',
            });
        } finally {
            setCancelandoTurnoId(null);
        }
    };

    const volverPasoAnterior = () => {
        if (paso === 'servicio') {
            volverAProfesional();
            return;
        }

        if (paso === 'fecha') {
            volverAServicio();
            return;
        }

        if (paso === 'horario') {
            volverAFecha();
            return;
        }

        if (paso === 'confirmacion') {
            volverAHorario();
        }
    };

    return (
        <>
            <Menu />
            <main className="client-turnos-page">
                <div className="container px-3">
                    {vista === 'mis-turnos' && (
                        <MisTurnos
                            nombreUsuario={userData?.nombre}
                            turnos={misTurnos}
                            loading={loadingMisTurnos}
                            error={errorMisTurnos}
                            cancelandoTurnoId={cancelandoTurnoId}
                            onRetry={cargarMisTurnos}
                            onReservar={abrirReserva}
                            onCancelar={cancelarTurnoCliente}
                        />
                    )}

                    {vista === 'reservar' && (
                    <div className="turnos-card">
                        <div className="turnos-top-actions">
                            {paso !== 'profesional' && (
                                <button className="turnos-back" onClick={volverPasoAnterior} aria-label="Volver al paso anterior">
                                    <i className="bi bi-arrow-left"></i>
                                    Volver
                                </button>
                            )}

                            <button className="turnos-back turnos-back-home" onClick={cancelarReserva} aria-label="Volver a mis turnos">
                                Mis turnos
                            </button>
                        </div>

                        {paso !== 'confirmacion' && <ResumenTurno seleccion={seleccion} />}

                        {paso === 'profesional' && (
                            <SeleccionProfesional
                                profesionales={profesionales}
                                loading={loadingProfesionales}
                                error={errorProfesionales}
                                onRetry={cargarProfesionales}
                                onSelect={seleccionarProfesional}
                            />
                        )}

                        {paso === 'servicio' && seleccion.profesional && (
                            <SeleccionServicio
                                profesional={seleccion.profesional}
                                onSelect={seleccionarServicio}
                            />
                        )}

                        {paso === 'fecha' && seleccion.profesional && seleccion.servicio && (
                            <CalendarioTurnos
                                profesional={seleccion.profesional}
                                servicio={seleccion.servicio}
                                fechaSeleccionada={seleccion.fecha}
                                onSelect={seleccionarFecha}
                            />
                        )}

                        {paso === 'horario' && seleccion.profesional && seleccion.servicio && seleccion.fecha && (
                            <HorariosTurnos
                                profesional={seleccion.profesional}
                                servicio={seleccion.servicio}
                                fecha={seleccion.fecha}
                                horaSeleccionada={seleccion.hora}
                                onSelect={seleccionarHora}
                            />
                        )}

                        {paso === 'confirmacion' && (
                            <ConfirmarTurno
                                seleccion={seleccion}
                                onReset={resetTurno}
                                onSuccess={turnoConfirmado}
                            />
                        )}
                    </div>
                    )}
                </div>
            </main>
        </>
    )
}

