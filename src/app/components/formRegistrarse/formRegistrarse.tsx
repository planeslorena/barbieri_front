import { Resolver, useForm, SubmitHandler, useWatch } from "react-hook-form";
import "./formRegistrarse.css";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "@/app/context/user.context";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getObrasSociales, ObraSocial, registerUser } from "@/app/services/auth";
import Swal from "sweetalert2";

const schema = yup.object().shape({
  nombre: yup.string().required("El nombre y apellido son requeridos"),
  dni: yup
    .string()
    .required("El DNI es requerido")
    .matches(/^\d+$/, "El DNI debe contener solo numeros")
    .min(7, "El DNI debe tener al menos 7 digitos")
    .max(8, "El DNI no puede tener mas de 8 digitos"),
  telefono: yup
    .string()
    .required("El telefono es requerido")
    .matches(/^\d+$/, "El telefono debe contener solo numeros"),
  id_obra_social: yup
    .string()
    .required("La obra social es requerida")
    .matches(/^\d+$/, "Selecciona una obra social valida"),
  numero_obra_social: yup
    .string()
    .trim(),
  fecha_nacimiento: yup
    .string()
    .required("La fecha de nacimiento es requerida")
    .test("edad-minima", "Debes ser mayor de 15 anos", (value) => {
      if (!value) return false;
      const hoy = new Date();
      const nacimiento = new Date(value);
      const edad = hoy.getFullYear() - nacimiento.getFullYear();
      const cumplioEsteAnio =
        hoy.getMonth() > nacimiento.getMonth() ||
        (hoy.getMonth() === nacimiento.getMonth() &&
          hoy.getDate() >= nacimiento.getDate());
      return edad > 15 || (edad === 15 && cumplioEsteAnio);
    })
    .test("no-futuro", "La fecha no puede ser en el futuro", (value) => {
      if (!value) return false;
      return new Date(value) < new Date();
    })
    .test("edad-maxima", "Fecha de nacimiento invalida", (value) => {
      if (!value) return false;
      const anioNacimiento = new Date(value).getFullYear();
      return anioNacimiento >= 1900;
    }),
});

interface FormData {
  nombre: string;
  dni: string;
  telefono: string;
  id_obra_social: string;
  numero_obra_social: string;
  fecha_nacimiento: string;
}

interface Props {
  mostrarFormLogin: () => void;
}

export default function FormRegistrarse({ mostrarFormLogin }: Props) {
  const { setUserData } = useContext(UserContext);
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
  const [obraSocialQuery, setObraSocialQuery] = useState("");
  const [showObraSocialOptions, setShowObraSocialOptions] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
  });
  const selectedObraSocialId = useWatch({ control, name: "id_obra_social" });
  const selectedObraSocial = useMemo(
    () => obrasSociales.find((obraSocial) => obraSocial.id_obra_social === Number(selectedObraSocialId)),
    [obrasSociales, selectedObraSocialId],
  );
  const isParticular = selectedObraSocial?.nombre.trim().toLowerCase() === "particular";

  useEffect(() => {
    getObrasSociales()
      .then(setObrasSociales)
      .catch(() => setObrasSociales([]));
  }, []);

  const filteredObrasSociales = useMemo(() => {
    const query = obraSocialQuery.trim().toLowerCase();
    if (!query) return obrasSociales;

    return obrasSociales.filter((obraSocial) =>
      obraSocial.nombre.toLowerCase().includes(query),
    );
  }, [obraSocialQuery, obrasSociales]);

  const selectObraSocial = (obraSocial: ObraSocial) => {
    setObraSocialQuery(obraSocial.nombre);
    setValue("id_obra_social", obraSocial.id_obra_social.toString(), {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (obraSocial.nombre.trim().toLowerCase() === "particular") {
      setValue("numero_obra_social", "", { shouldDirty: true, shouldValidate: true });
    }
    setShowObraSocialOptions(false);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!isParticular && !data.numero_obra_social.trim()) {
      setError("numero_obra_social", {
        type: "manual",
        message: "El numero de obra social es requerido",
      });
      return;
    }

    const resp = await registerUser({
      nombre: data.nombre,
      dni: Number(data.dni),
      telefono: Number(data.telefono),
      id_obra_social: Number(data.id_obra_social),
      numero_obra_social: isParticular ? null : data.numero_obra_social.trim(),
      fecha_nacimiento: data.fecha_nacimiento,
    });

    if (resp.status === 409) {
      Swal.fire({
        title: `Hola ${data.nombre}!`,
        text: "Tu DNI ya se encuentra registrado. Por favor, inicia sesion para continuar.",
        icon: "error",
      });
      setUserData(null);
      mostrarFormLogin();
      return;
    }

    Swal.fire({
      title: `Hola ${data.nombre}!`,
      text: "Ya podes empezar a disfrutar de nuestros servicios!",
      icon: "success",
    });

    setUserData(resp.data);
    mostrarFormLogin();
  };

  return (
    <div className="container container-form">
      <div className="d-flex flex-column align-items-center justify-content-center mb-3">
        <h4 className="font-text">Crea tu cuenta</h4>

        <form id="register-form" onSubmit={handleSubmit(onSubmit)} className="cliente-form">
          <div className="form-group mb-2">
            <label>Nombre y Apellido</label>
            <input
              type="text"
              className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
              {...register("nombre")}
            />
            {errors.nombre && <div className="invalid-feedback">{errors.nombre.message}</div>}
          </div>

          <div className="row mb-2">
            <div className="col">
              <label>DNI</label>
              <input
                type="text"
                inputMode="numeric"
                className={`form-control ${errors.dni ? "is-invalid" : ""}`}
                {...register("dni")}
              />
              {errors.dni && <div className="invalid-feedback">{errors.dni.message}</div>}
            </div>
            <div className="col">
              <label>Telefono</label>
              <input
                type="tel"
                className={`form-control ${errors.telefono ? "is-invalid" : ""}`}
                {...register("telefono")}
              />
              {errors.telefono && <div className="invalid-feedback">{errors.telefono.message}</div>}
            </div>
          </div>

          <div className="form-group mb-2">
            <label>Obra social</label>
            <input type="hidden" {...register("id_obra_social")} />
            <input
              type="text"
              autoComplete="off"
              className={`form-control ${errors.id_obra_social ? "is-invalid" : ""}`}
              placeholder="Buscar obra social o prepaga"
              value={obraSocialQuery}
              onChange={(event) => {
                setObraSocialQuery(event.target.value);
                setValue("id_obra_social", "", { shouldValidate: true });
                setShowObraSocialOptions(true);
              }}
              onFocus={() => setShowObraSocialOptions(true)}
              onBlur={() => setShowObraSocialOptions(false)}
            />
            {showObraSocialOptions && (
              <div className="obra-social-options">
                {filteredObrasSociales.map((obraSocial) => (
                  <button
                    key={obraSocial.id_obra_social}
                    type="button"
                    className="obra-social-option"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectObraSocial(obraSocial)}
                  >
                    {obraSocial.nombre}
                  </button>
                ))}
                {!filteredObrasSociales.length && (
                  <span className="obra-social-empty">No hay resultados</span>
                )}
              </div>
            )}
            {errors.id_obra_social && (
              <div className="invalid-feedback d-block">{errors.id_obra_social.message}</div>
            )}
          </div>

          {!isParticular && (
            <div className="form-group mb-2">
              <label>Numero de obra social</label>
              <input
                type="text"
                className={`form-control ${errors.numero_obra_social ? "is-invalid" : ""}`}
                {...register("numero_obra_social")}
              />
              {errors.numero_obra_social && (
                <div className="invalid-feedback">{errors.numero_obra_social.message}</div>
              )}
            </div>
          )}

          <div className="form-group mb-2">
            <label>Fecha de Nacimiento</label>
            <input
              type="date"
              className={`form-control ${errors.fecha_nacimiento ? "is-invalid" : ""}`}
              {...register("fecha_nacimiento")}
            />
            {errors.fecha_nacimiento && (
              <div className="invalid-feedback">{errors.fecha_nacimiento.message}</div>
            )}
          </div>

          <button type="submit" className="btn-style" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </button>
        </form>

        <small className="text-registrarse " onClick={() => mostrarFormLogin()}>
          <u className="text-registrarse">Ya tenes una cuenta? Inicia sesion</u>
        </small>
      </div>
    </div>
  );
}
