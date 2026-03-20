'use client'
import FormLogin from "@/app/components/formLogin/formLogin";
import FormRegistrarse from "@/app/components/formRegistrarse/formRegistrarse";
import { useState } from "react";

export default function Usuario(props: any) {
    const [isLoginForm, setIsLoginForm] = useState(true);

    return (
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
    )
}