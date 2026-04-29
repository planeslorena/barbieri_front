'use client'
import { useForm, SubmitHandler } from "react-hook-form"
import "./formLogin.css"
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { UserContext } from "@/app/context/user.context";
import { login } from "@/app/services/auth";

interface Data {
    dni: number;
    codigo?: number;
}

export default function FormLogin(props: any) {
    const { mostrarFormRegistrarse }: { mostrarFormRegistrarse: Function } = props;
    const [pedirCodigo, setPedirCodigo] = useState(false);
    const [dniIngresado, setDniIngresado] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<Data>();

    const router = useRouter();
    const { setUserData } = useContext(UserContext);

    const rolerouter = (rol: string) => {
        if (rol === "ADMIN") {
            router.push("/admin");
        }
        else if (rol === "USER") {
            router.push("/client");
        } else if (rol === "PROF") {
            router.push("/profesional");
        }
    }

    const onSubmit: SubmitHandler<Data> = async (data) => {
        //Llama a el backend para generar el login
        const resp = await login({
            dni: pedirCodigo ? dniIngresado : data.dni,
            codigo: Number(data.codigo),
        });

        //Si hay un error de usuario no autorizado o usuario inexistente, muestra mensaje en pantalla
        if (resp === 404) {
            setError("dni", {
                type: "manual",
                message: "No existe un usuario registrado con ese DNI.",
            });
            return;
        }

        //Si hay un error deL codigo incorrecto, muestra mensaje en pantalla
        if (resp === 401) {
            setError("codigo", {
                type: "manual",
                message: "Código incorrecto.",
            });
            return;
        }

        //Si el usuario es ADMIN o PROF pide codigo de validacion
        if (resp.step === 'CODE_REQUIRED') {
            setPedirCodigo(true);
            setDniIngresado(data.dni);
            return;
        }

        if (resp.step === 'LOGGED') {
            setUserData(resp.usuario);
            rolerouter(resp.usuario.rol);
        }
    };


    return (
        <div className="card-login d-flex flex-column align-items-center justify-content-center w-100 shadow">
            <span className="login-eyebrow">Acceso usuarios</span>
            <h4 className="title">Iniciar sesión</h4>
            <p className="login-subtitle">Ingresá para gestionar tus turnos y continuar con tu seguimiento.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="login-form d-flex flex-column my-3 d-grid gap-2 col-8 mx-auto">
                {!pedirCodigo && (
                    <input placeholder="DNI" type="number" className="btn-dni"
                        {...register("dni", {
                            required: "Por favor ingrese su DNI",
                            minLength: { value: 6, message: "Ingrese un numero de DNI valido" },
                            maxLength: { value: 8, message: "Ingrese un numero de DNI valido" }
                        })} />
                )}

                {pedirCodigo && (
                    <input
                        placeholder="Código de acceso"
                        type="password"
                        className="btn-dni"
                        {...register("codigo", {
                            required: "Ingrese el código",
                        })}
                    />
                )}
                {errors.dni && <small className="login-error">{errors.dni?.message}</small>}
                {errors.codigo && <small className="login-error">{errors.codigo?.message}</small>}

                <button type="submit" className="btn-style login-submit-btn" >Ingresar</button>
                <small className="text-registrarse" onClick={() => mostrarFormRegistrarse()}>
                    <u className="text-registrarse">Aún no tenes una cuenta? Registrate</u>
                </small>
            </form>
        </div>
    )
}
