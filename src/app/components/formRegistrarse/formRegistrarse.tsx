import { useForm, SubmitHandler, set } from "react-hook-form"
//import "./formRegistrarse.css"
import { useContext, useState } from "react";
import { UserContext } from "@/app/context/user.context";
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
//import { createClient } from "@/app/services/client";
import Swal from "sweetalert2";
//import { ICliente } from "@/app/model/ICliente";


 
const schema = yup.object().shape({
  nombreApellido: yup.string().required('El nombre y apellido son requeridos'),
  dni: yup.string()
    .required('El DNI es requerido')
    .matches(/^\d+$/, 'El DNI debe contener solo números')
    .min(7, 'El DNI debe tener al menos 7 dígitos')
    .max(8, 'El DNI no puede tener más de 8 dígitos'),
  mail: yup.string().email('Ingrese un email válido').required('El email es requerido'),
  telefono: yup.string().required('El teléfono es requerido'),
})

interface FormData {
  nombreApellido: string;
  dni: number;
  mail: string;
  telefono: number;
}

export default function FormRegistrarse(props: any) {
  const { setMostrarFormLogin, setMostrarFormRegistrarse, setMostrarMascotas, setMostrarUsuario }: { setMostrarFormLogin: Function, setMostrarFormRegistrarse: Function, setMostrarMascotas: Function, setMostrarUsuario: Function } = props;
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema) as any
  });

  const { userData, setUserData } = useContext(UserContext);

  const onSubmit = async (data: FormData) => {
    const cliente = {
      id_cliente: null,
      nombre: data.nombreApellido,
      dni: data.dni,
      mail: data.mail,
      telefono: data.telefono
    };
    const resp = 409//await createClient(cliente);

    if (resp == 409) {
      Swal.fire({
        title: `Hola ${cliente.nombre}!`,
        text: "Tu DNI ya se encuentra registrado. Por favor, inicia sesión para continuar.",
        icon: "error"
      });
      setUserData(null);
      setMostrarFormRegistrarse(false);
      setMostrarFormLogin(true);
    } else {
      Swal.fire({
        title: `Hola ${cliente.nombre}!`,
        text: "Ya podes empezar a disfrutar de nuestros servicios!",
        icon: "success"
      });
      /*const id_newCliente = resp.raw.insertId;

      const newCliente = {
        ...cliente,
        id_cliente: id_newCliente,
      }
      setUserData(newCliente);*/
      setMostrarUsuario(false);
      setMostrarFormRegistrarse(false);
      setMostrarFormLogin(true);
      setMostrarMascotas(true);
    }
  };

  const irAtras = () => {
    setMostrarFormLogin(true);
    setMostrarFormRegistrarse(false);
  };

  return (

    <div className="container">
      <div className='d-flex flex-column align-items-start justify-content-start w-100'>
        <i className="bi bi-arrow-left" onClick={irAtras}></i>
      </div>
      <div className="d-flex flex-column align-items-center justify-content-center mb-3">
        <h4 className="font-text">Registrate en Peluditos</h4>

        <form id="pet-form" onSubmit={handleSubmit(onSubmit)} className="pet-form">
          <div className="form-group mb-2">
            <label>Nombre y Apellido</label>
            <input
              type="text"
              className={`form-control ${errors.nombreApellido ? 'is-invalid' : ''}`}
              {...register('nombreApellido')}
            />
            {errors.nombreApellido && <div className="invalid-feedback">{errors.nombreApellido.message}</div>}
          </div>

          <div className="row mb-2">
            <div className="col">
              <label>DNI</label>
              <input
                type="number"
                className={`form-control ${errors.dni ? 'is-invalid' : ''}`}
                {...register('dni')}
              />
              {errors.dni && <div className="invalid-feedback">{errors.dni.message}</div>}
            </div>
            <div className="col">
              <label>Teléfono</label>
              <input
                type="tel"
                className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                {...register('telefono')}
              />
              {errors.telefono && <div className="invalid-feedback">{errors.telefono.message}</div>}
            </div>
          </div>

          <div className="form-group mb-2">
            <label>Email</label>
            <input
              type="email"
              className={`form-control ${errors.mail ? 'is-invalid' : ''}`}
              {...register('mail')}
            />
            {errors.mail && <div className="invalid-feedback">{errors.mail.message}</div>}
          </div>
          <button type="submit" className='btn-style'> Guardar</button>
        </form>
      </div>
    </div >
  )
}