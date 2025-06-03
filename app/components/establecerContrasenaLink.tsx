'use client';

/* eslint @typescript-eslint/no-unused-vars: ["error", { "argsIgnorePattern": "^_" }] */

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ref, update, get } from "firebase/database";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth, database } from "../../firebaseConfig";

import { CampoContrasena } from "./campoContrasena";
import { Alerta } from "./alertaPantalla";

export default function EstablecerContrasenaLink() {
    const [nuevaContrasena, setNuevaContrasena] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [tokenVerificado, setTokenVerificado] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [errorConfirmacion, setErrorConfirmacion] = useState(false);
    const [alerta, setAlerta] = useState<{
        type: 'aprobado' | 'denegado' | 'errorSist' | 'info';
        mensaje: string;
    } | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const oobCode = searchParams.get("oobCode");

    useEffect(() => {
   
    const verificarCodigo = async () =>{
        if (!oobCode){
            setAlerta({
                type: 'errorSist',
                mensaje: 'El link no corresponde al usuario'
            });
            setCargando(false);
            return;
        }
        try {
            await verifyPasswordResetCode(auth, oobCode);
            setTokenVerificado(true);
        } catch (error) {
            console.error("Error en ", error);
            setAlerta({
                type: 'errorSist',
                mensaje:'El Link desde el que se accedió ha caducado'
            });
        } finally {
            setCargando(false);
        }
    };

    verificarCodigo(); }, [oobCode]);

    const handleNuevaContrasenaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value;
        setNuevaContrasena(valor);

        if (confirmarContrasena.length > 0) {
            setErrorConfirmacion(valor !== confirmarContrasena);
        }
    };

    const handleConfirmarContrasenaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value;
        setConfirmarContrasena(valor);
        setErrorConfirmacion(nuevaContrasena !== valor && valor.length > 0);
    };


const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!tokenVerificado) {
        setAlerta({
            type: 'errorSist',
            mensaje: 'No está permitido establecer una contraseña en este momento.'
        });
        return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
        setErrorConfirmacion(true);
        setAlerta({
            type: 'denegado',
            mensaje: 'Las contraseñas no coinciden'
        });
        return;
    }

    try {
        setCargando(true);

        try {
            const email = await verifyPasswordResetCode(auth, oobCode!);
            console.log("Email del usuario:", email);
            
            // Buscar el usuario por email en la base de datos
            const usuariosRef = ref(database, 'usuarios');
            const snapshot = await get(usuariosRef);
            
            if (snapshot.exists()) {
                const usuarios = snapshot.val();
                const usuarioEncontrado = Object.entries(usuarios).find(
                    ([_uid, userData]: [string, any]) => userData.email === email
                );

                if (usuarioEncontrado) {
                    const [uid] = usuarioEncontrado;
                    console.log("UID encontrado:", uid);
                    
                    // Verificar el estado actual del usuario
                    const userStatusRef = ref(database, `usuarios/${uid}/estadoUsuario`);
                    const statusSnapshot = await get(userStatusRef);
                    
                    if (!statusSnapshot.exists()) {
                        console.log("Estado de usuario no encontrado");
                        setAlerta({
                            type: "errorSist",
                            mensaje: "No se encontró el estado del usuario en la base de datos",
                        });
                        return;
                    }

                    const estadoUsuario: string = statusSnapshot.val();

                    await confirmPasswordReset(auth, oobCode!, nuevaContrasena);
                    // Actualizar el estado del usuario a cambioContrasena
                    await update(ref(database, `usuarios/${uid}`), {
                        estadoUsuario: 'cambioContrasena'
                    });

                    
                    console.log("Estado actualizado a cambioContrasena");
                } else {
                    console.log("Usuario no encontrado en la base de datos");
                    setAlerta({
                        type: 'errorSist',
                        mensaje: 'No se encontró el usuario en la base de datos'
                    });
                    return;
                }
            } else {
                console.log("No se encontraron usuarios en la base de datos");
                setAlerta({
                    type: 'errorSist',
                    mensaje: 'No se encontraron usuarios en la base de datos'
                });
                return;
            }
        } catch (dbError) {
            console.error('Error actualizando estado en base de datos:', dbError);
            setAlerta({
                type: 'errorSist',
                mensaje: 'Error al actualizar el estado del usuario en la base de datos'
            });
            return;
        }
        
        setAlerta({
            type: 'aprobado',
            mensaje: 'Tu contraseña ha sido actualizada correctamente y tu cuenta ha sido procesada'
        });
        
        setTimeout(() => {
            router.push('/');
        }, 3000);

    } catch (error: unknown) {
        let mensajeError = 'Ocurrió un error al actualizar la contraseña';

        if (typeof error === 'object' && error !== null && 'code' in error) {
            const code = (error as { code: string }).code;
            if (code === 'auth/weak-password') {
                mensajeError = 'La contraseña es demasiado débil';
            } else if (code === 'auth/expired-action-code') {
                mensajeError = 'El código de restablecimiento ha expirado';
            } else if (code === 'auth/invalid-action-code') {
                mensajeError = 'El código de restablecimiento es inválido';
            } else if (code === 'auth/user-disabled') {
                mensajeError = 'Esta cuenta ha sido deshabilitada';
            }
        }

        console.error("Error al actualizar la contraseña:", error);

        setAlerta({
            type: 'errorSist',
            mensaje: mensajeError
        });
    } finally {
        setCargando(false);
    }
};
    if (cargando) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d4583]"></div>
            </div>
        );
    }

    if (!tokenVerificado && alerta) {
        return (
            <div className="py-8 px-4">
                <Alerta
                    tipo={alerta.type}
                    mensaje={alerta.mensaje}
                    funCerrar={() => setAlerta(null)}
                />
                <div className="mt-6 flex justify-center">
                    <Link href="/" className="items-center flex hover:text-[#08b177] text-[#2975a0] group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left transition-all group-hover:scale-x-125">
                            <path d="M6 8L2 12L6 16"/><path d="M2 12H22"/>
                        </svg>
                        <span className="pl-2">Regresar al inicio</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 px-4">
            <h2 className="text-2xl font-semibold text-[#2d4583] mb-6">Establece tu nueva contraseña</h2>

            {alerta && (
                <Alerta
                    tipo={alerta.type}
                    mensaje={alerta.mensaje}
                    funCerrar={() => setAlerta(null)}
                />
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-1">Nueva contraseña</label>
                    <CampoContrasena
                        value={nuevaContrasena}
                        onChange={handleNuevaContrasenaChange}
                        placeholder="Nueva contraseña"
                        error={false}
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 mb-1">Confirmar contraseña</label>
                    <CampoContrasena
                        value={confirmarContrasena}
                        onChange={handleConfirmarContrasenaChange}
                        placeholder="Confirmar contraseña"
                        error={errorConfirmacion}
                    />
                    {errorConfirmacion && (
                        <p className="text-red-500 text-sm mt-1">
                            Las contraseñas no coinciden
                        </p>
                    )}
                </div>

                <div className="mb-6">
                    <button
                        type="submit"
                        disabled={cargando || alerta?.type === 'aprobado'}
                        className={`w-full py-2 rounded-lg transition ${
                            cargando || alerta?.type === 'aprobado'
                                ? 'bg-gray-400 text-gray-100 cursor-not-allowed'
                                : 'bg-[#2d4583] text-white hover:bg-[#08b177]'
                        }`}
                    >
                        {cargando ? 'Procesando...' : 'Establecer contraseña'}
                    </button>
                </div>

                <div className="flex items-center justify-center">
                    <Link href="/" className="items-center flex hover:text-[#08b177] text-[#2975a0] group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left transition-all group-hover:scale-x-125">
                            <path d="M6 8L2 12L6 16"/><path d="M2 12H22"/>
                        </svg>
                        <span className="pl-2">Regresar</span>
                    </Link>
                </div>
            </form>
        </div>
    );
}
