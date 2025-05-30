
import {NextRequest, NextResponse} from 'next/server';
import {ref, get, set} from 'firebase/database';
import {database} from '@/firebaseConfig';

export async function POST(request: NextRequest) {
    const {expedienteId} = await request.json();
    if (!expedienteId) {
        return NextResponse.json(
            {error: 'Se requiere expedienteId'},
            {status: 400}
        );
    }

    const path = `historiales/historial${expedienteId}`;
    const nodeRef = ref(database, path);
    const snap = await get(nodeRef);

    if (!snap.exists()) {
        const defaultStructure = {
            id: expedienteId,
            contrasena: {

            },
            expediente: {
                documentos: {
                    
                },
                campos:{

                }
            },
            contratos: {

            }
        };

         await set(nodeRef, defaultStructure);
    }

    return NextResponse.json({ok: true});
}