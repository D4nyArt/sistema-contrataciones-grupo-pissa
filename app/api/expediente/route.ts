import {NextRequest, NextResponse} from 'next/server';
import {ref, get, set} from 'firebase/database';
import {database} from '@/firebaseConfig';


export async function GET(request: NextRequest) {
    const {searchParams} = new URL(request.url)
    const expedienteId = searchParams.get('expedienteId')
    if (!expedienteId) {
        return NextResponse.json({error: 'Se requiere expedienteId'}, {status: 400})
    }

    const path = `expedientes/expediente${expedienteId}`
    const nodeRef = ref(database, path)
    const snap = await get(nodeRef)

    if (!snap.exists()) {
        return NextResponse.json({error: 'Expediente no encontrado'}, {status: 404})
    }

    return NextResponse.json(snap.val())
}

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
            expediente_completo: false,
            documentos: {
                INE: {
                    campos: {
                        nombreCompleto: {
                            nombre: "Nombre Completo",
                            valor: '',
                            estado: 'no_subido'
                        }
                    },
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'INE',
                    url: '',
                    extension: 'jpg'
                },
                CURP: {
                    campos: {
                        curp: {
                            nombre: 'CURP',
                            valor: '',
                            estado: 'no_subido'
                        }
                    },
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'CURP',
                    url: '',
                    extension: 'pdf'
                },
                ActaNacimiento: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Acta de Nacimiento',
                    url: '',
                    extension: 'jpg'
                },
                ConstanciaSituacionFiscal: {
                    campos: {
                        rfc: {
                            nombre: 'RFC',
                            valor: '',
                            estado: 'no_subido'
                        }
                    },
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Constancia de Situación Fiscal',
                    url: '',
                    extension: 'pdf'
                },
                ComprobanteDomicilio: {
                    campos: {
                        domicilio: {
                            nombre: 'Domicilio',
                            valor: '',
                            estado: 'no_subido'
                        }
                    },
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Comprobante de Domicilio',
                    url: '',
                    extension: 'jpg'
                }, NumeroImss: {
                    campos: {
                        numeroImss: {
                            nombre: 'Número de IMSS',
                            valor: '',
                            estado: 'no_subido'
                        }
                    },
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Número de IMSS',
                    url: '',
                    extension: 'pdf'
                }, ComprobanteEstudios: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Comprobante de Estudios',
                    url: '',
                    extension: 'jpg'
                }, ConstanciaLaboral1: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Constancia Laboral 1',
                    url: '',
                    extension: 'jpg'
                }, ConstanciaLaboral2: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Constancia Laboral 2',
                    url: '',
                    extension: 'jpg'
                }, CartaRecomendacion1: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Carta de Recomendación Personal 1',
                    url: '',
                    extension: 'jpg'
                }, CartaRecomendacion2: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Carta de Recomendación Personal 2',
                    url: '',
                    extension: 'jpg'
                }, RetencionInfonavit: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Hoja de Retención Infonavit',
                    url: '',
                    extension: 'jpg'
                }, DepositoNomina: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Estado de Cuenta para Depósito de Nómina',
                    url: '',
                    extension: 'pdf'
                },
                CV: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Currículum',
                    url: '',
                    extension: 'pdf'
                },
                CertificadoMedico: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Certificado Médico',
                    url: '',
                    extension: 'jpg'
                },
                CertificadoAntecedentes: {
                    campos: {},
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Certificado de Antecedentes No Penales',
                    url: '',
                    extension: 'pdf'
                },
                EstadoCuenta: {
                    campos: {
                        clabe: {
                            nombre: 'CLABE Interbancaria',
                            valor: '',
                            estado: 'no_subido'   
                        },
                        cuenta: {
                            nombre: 'Número de Cuenta',
                            valor: '',
                            estado: 'no_subido'
                        }
                    },
                    estadoArchivo: 'no_subido',
                    estadoCampos: 'no_subido',
                    estadoGeneral: 'no_subido',
                    nombre: 'Estado de Cuenta o Contrato Bancario',
                    url: '',
                    extension: 'pdf'    
                }
            }
        };
        await set(nodeRef, defaultStructure);
    }

    return NextResponse.json({ok: true});
}