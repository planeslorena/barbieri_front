import { useForm, SubmitHandler } from "react-hook-form";
import "./formRegistrarse.css";
import { useContext } from "react";
import { UserContext } from "@/app/context/user.context";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerUser } from "@/app/services/auth";
import Swal from "sweetalert2";


// ─── Validation Schema ────────────────────────────────────────────────────────

const schema = yup.object().shape({
  nombre: yup
    .string()
    .required("El nombre y apellido son requeridos"),
  dni: yup
    .string()
    .required("El DNI es requerido")
    .matches(/^\d+$/, "El DNI debe contener solo números")
    .min(7, "El DNI debe tener al menos 7 dígitos")
    .max(8, "El DNI no puede tener más de 8 dígitos"),
  mail: yup
    .string()
    .email("Ingresá un email válido")
    .required("El email es requerido"),
  telefono: yup
    .string()
    .required("El teléfono es requerido")
    .matches(/^\d+$/, "El teléfono debe contener solo números"),
  // En el schema de yup
  fecha_nacimiento: yup
    .string()
    .required("La fecha de nacimiento es requerida")
    .test("edad-minima", "Debés ser mayor de 15 años", (value) => {
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
    .test("edad-maxima", "Fecha de nacimiento inválida", (value) => {
      if (!value) return false;
      const anioNacimiento = new Date(value).getFullYear();
      return anioNacimiento >= 1900;
    }),
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  nombre: string;
  dni: string;
  mail: string;
  telefono: string;
  fecha_nacimiento: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  mostrarFormLogin: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FormRegistrarse({
  mostrarFormLogin,
}: Props) {
  const { setUserData } = useContext(UserContext);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
  });

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const resp = await registerUser({
      nombre: data.nombre,
      dni: Number(data.dni),
      mail: data.mail,
      telefono: Number(data.telefono),
      fecha_nacimiento: data.fecha_nacimiento,
    });

    if (resp.status === 409) {
      Swal.fire({
        title: `Hola ${data.nombre}!`,
        text: "Tu DNI ya se encuentra registrado. Por favor, iniciá sesión para continuar.",
        icon: "error",
      });
      setUserData(null);
      mostrarFormLogin();
      return;
    }

    Swal.fire({
      title: `Hola ${data.nombre}!`,
      text: "¡Ya podés empezar a disfrutar de nuestros servicios!",
      icon: "success",
    });

    setUserData(resp.data);
    mostrarFormLogin();
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="container container-form">

      <div className="d-flex flex-column align-items-center justify-content-center mb-3">
        <h4 className="font-text">Creá tu cuenta</h4>

        <form id="register-form" onSubmit={handleSubmit(onSubmit)} className="cliente-form">

          {/* Nombre */}
          <div className="form-group mb-2">
            <label>Nombre y Apellido</label>
            <input
              type="text"
              className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
              {...register("nombre")}
            />
            {errors.nombre && (
              <div className="invalid-feedback">{errors.nombre.message}</div>
            )}
          </div>

          {/* DNI + Teléfono */}
          <div className="row mb-2">
            <div className="col">
              <label>DNI</label>
              <input
                type="text"
                inputMode="numeric"
                className={`form-control ${errors.dni ? "is-invalid" : ""}`}
                {...register("dni")}
              />
              {errors.dni && (
                <div className="invalid-feedback">{errors.dni.message}</div>
              )}
            </div>
            <div className="col">
              <label>Teléfono</label>
              <input
                type="tel"
                className={`form-control ${errors.telefono ? "is-invalid" : ""}`}
                {...register("telefono")}
              />
              {errors.telefono && (
                <div className="invalid-feedback">{errors.telefono.message}</div>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="form-group mb-2">
            <label>Email</label>
            <input
              type="email"
              className={`form-control ${errors.mail ? "is-invalid" : ""}`}
              {...register("mail")}
            />
            {errors.mail && (
              <div className="invalid-feedback">{errors.mail.message}</div>
            )}
          </div>

          {/* Fecha de nacimiento — nuevo campo requerido por Cliente */}
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
            <u className="text-registrarse">Ya tenes una cuenta? Inicia sesión</u>
          </small>
      </div>
    </div>
  );
}