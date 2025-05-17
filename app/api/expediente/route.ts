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

    const path = `expedientes/expediente${expedienteId}`;
    const nodeRef = ref(database, path);
    const snap = await get(nodeRef);

    if (!snap.exists()) {
        const defaultStructure = {
            id_candidato: expedienteId,
            notas: "",
            documentos: {
                INE: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'INE',
                    url: ''
                },
                CURP: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'CURP',
                    url: ''
                },
                ActaNacimiento: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Acta de Nacimiento',
                    url: ''
                },
                ConstanciaSituacionFiscal: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Constancia de Situación Fiscal',
                    url: ''
                },
                ComprobanteDomicilio: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Comprobante de Domicilio',
                    url: ''
                }, NumeroImss: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Número de IMSS',
                    url: ''
                }, ComprobanteEstudios: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Comprobante de Estudios',
                    url: ''
                }, ConstanciaLaboral1: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Constancia Laboral 1',
                    url: ''
                }, ConstanciaLaboral2: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Constancia Laboral 2',
                    url: ''
                }, CartaRecomendacion1: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Carta de Recomendación Personal 1',
                    url: ''
                }, CartaRecomendacion2: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Carta de Recomendación Personal 2',
                    url: ''
                }, RetencionInfonavit: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Hoja de Retención Infonavit',
                    url: ''
                }, DepositoNomina: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Estado de Cuenta para Depósito de Nómina',
                    url: ''
                },
                CV: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Currículum',
                    url: ''
                },
                CertificadoMedico: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Certificado Médico',
                    url: ''
                }
            }
        };
        await set(nodeRef, defaultStructure);
    }

    return NextResponse.json({ok: true});
}