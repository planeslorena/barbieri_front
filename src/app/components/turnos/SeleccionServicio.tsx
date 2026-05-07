'use client';

import type { ProfesionalTurno, ServicioTurno } from '@/app/services/turnos';

interface Props {
  profesional: ProfesionalTurno;
  onSelect: (servicio: ServicioTurno) => void;
}

const SIN_CATEGORIA = 'Consultas y tratamientos';
const SERVICIO_SIN_NOMBRE = 'Tratamiento';

export default function SeleccionServicio({ profesional, onSelect }: Props) {
  const serviciosPorCategoria = profesional.servicios.reduce<
    {
      id: number | null;
      nombre: string;
      orden: number;
      servicios: ServicioTurno[];
    }[]
  >((categorias, servicio) => {
    const categoriaId = servicio.categoria?.id_categoria_servicio ?? null;
    const categoriaExistente = categorias.find((categoria) => categoria.id === categoriaId);

    if (categoriaExistente) {
      categoriaExistente.servicios.push(servicio);
      return categorias;
    }

    categorias.push({
      id: categoriaId,
      nombre: servicio.categoria?.nombre ?? SIN_CATEGORIA,
      orden: servicio.categoria?.orden ?? Number.MAX_SAFE_INTEGER,
      servicios: [servicio],
    });

    return categorias;
  }, []).sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre));

  return (
    <div className="turnos-step">
      <div className="turnos-heading">
        <span className="turnos-eyebrow">Paso 2 de 5</span>
        <h1 className="title">Elegi tratamiento</h1>
        <p>Estos son los servicios disponibles con {profesional.nombre}.</p>
      </div>

      {!profesional.servicios.length ? (
        <p className="turnos-state">No hay servicios disponibles para este profesional.</p>
      ) : (
        <div className="turnos-categories">
          {serviciosPorCategoria.map((categoria) => (
            <details
              className="turnos-category"
              key={categoria.id ?? categoria.nombre}
            >
              <summary className="turnos-category-summary">
                <span>{categoria.nombre}</span>
                <small>{categoria.servicios.length} servicios</small>
                <i className="bi bi-chevron-down"></i>
              </summary>

              <div className="turnos-list">
                {categoria.servicios.map((servicio) => (
                  <button
                    key={servicio.id_servicio}
                    className="turnos-option"
                    onClick={() => onSelect(servicio)}
                  >
                    <span>
                      <strong>{servicio.nombre || SERVICIO_SIN_NOMBRE}</strong>
                      <small>{servicio.duracion} min - Reserva ${servicio.reserva}</small>
                    </span>
                    <i className="bi bi-arrow-right-short"></i>
                  </button>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
