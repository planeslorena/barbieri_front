'use client'
import FormLogin from "@/app/components/formLogin/formLogin";
import FormRegistrarse from "@/app/components/formRegistrarse/formRegistrarse";
import { useState } from "react";
import "./page.css"

export default function Auth(props: any) {
    const [isLoginForm, setIsLoginForm] = useState(true);

    return (
        <>
            <div className="login-logo-wrapper mx-auto mt-5 mb-4">
                <img src="/images/logo.png" alt="Logo Dra. Florencia Barbieri" className="img-fluid login-logo" />
            </div>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-sm-12 col-md-6 col-lg-6 d-flex flex-column align-items-center justify-content-center rounded turnero my-3">
                        {isLoginForm ? (
                            <FormLogin mostrarFormRegistrarse={() => { setIsLoginForm(false) }} />
                        ) : (
                            <FormRegistrarse mostrarFormLogin={() => { setIsLoginForm(true) }} />
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}