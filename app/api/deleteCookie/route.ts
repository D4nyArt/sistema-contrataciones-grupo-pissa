/**
 * route.ts
 * 
 * Proporciona un endpoint API para eliminar cookies del navegador.
 *
 * Este módulo maneja la eliminación de cookies específicas basándose en el nombre
 * proporcionado como parámetro de consulta. Se utiliza principalmente para el
 * proceso de cierre de sesión y limpieza de datos de autenticación almacenados
 * en cookies del cliente.
 */

import { cookies } from 'next/headers';
import { NextResponse} from 'next/server'

/**
 * Elimina una cookie específica del navegador del cliente.
 *
 * Esta función de endpoint API extrae el nombre de la cookie desde los parámetros
 * de consulta URL y procede a eliminarla del almacén de cookies. Es utilizada
 * principalmente durante el proceso de cierre de sesión para limpiar tokens de
 * autenticación y otros datos sensibles.
 *
 * @param req - El objeto de request que contiene la URL con el parámetro 'name'.
 * @returns Una respuesta JSON confirmando la eliminación exitosa de la cookie.
 *
 * @example
 * ```ts
 * // Request URL:
 * DELETE /api/deleteCookie?name=authToken
 * 
 * // Respuesta exitosa:
 * { message: 'Cookie deleted successfully' }
 * ```
 */
export async function DELETE(req: Request) {
    
    const url = req.url;
    const query = new URLSearchParams(url.split('?')[1]);
    
    const cookieName = query.get("name");

    const cookieStore = await cookies();
    cookieStore.delete(`${cookieName}`);

 //res.setHeader('Set-Cookie', serialized);
 return NextResponse.json({ message: 'Cookie deleted successfully'});
}