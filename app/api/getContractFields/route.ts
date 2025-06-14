import {NextRequest, NextResponse} from "next/server";
import {database} from "@/firebaseConfig";
import {ref, get} from "firebase/database";

export async function GET(request: NextRequest) {
    const {searchParams} = new URL(request.url);
    const uid = searchParams.get("uid");
    const contractType = searchParams.get("contractType"); // "pro" o "cor"
    const selectedCompany = searchParams.get("selectedCompany");
    const selectedClient = searchParams.get("selectedClient");

    if (!uid || !contractType || !selectedCompany) {
        return NextResponse.json({
            error: "Missing required parameters: uid, contractType, selectedCompany"
        }, {status: 400});
    }

    try {
        const contractFields: any = {};

        // 1) Obtener datos de la empresa
        const empresaSnap = await get(ref(database, `contratos/empresas/${selectedCompany}`));
        if (empresaSnap.exists()) {
            const empresaData = empresaSnap.val();
            contractFields.empresa = empresaData.nombre || "";
            contractFields.representante_legal = empresaData.representanteLegal || "";
            contractFields.domicilio_empresa = empresaData.direccion || "";

        }

        // 2) Si es contrato de proyecto, obtener datos del cliente
        if (contractType === "pro" && selectedClient) {
            const clienteSnap = await get(ref(database, `contratos/clientes/${selectedClient}`));
            if (clienteSnap.exists()) {
                const clienteData = clienteSnap.val();
                contractFields.repse = clienteData.repse || "";
                contractFields.repse_folio = clienteData.folioRepse || "";
                contractFields.cliente = clienteData.nombre || "";
                contractFields.numero_contrato = clienteData.numeroContrato || "";
                contractFields.fecha_contrato = clienteData.fechaContrato || "";
                contractFields.fecha_adendum = clienteData.fechaAdendum || "";
                contractFields.vigencia_contrato = clienteData.fechaVigencia || "";
            }
        }

        // 3) Obtener datos del candidato
        const candidatoSnap = await get(ref(database, `usuarios/${uid}`));

        if (candidatoSnap.exists()) {
            const candidatoData = candidatoSnap.val();
            contractFields.nombre = candidatoData.nombre + " " + candidatoData.apellidos || "";
            contractFields.puesto = candidatoData.puesto || "";
            contractFields.sexo = candidatoData.sexo || "";
        }

        // 3) Obtener datos del expediente del candidato
        const domicilioSnap = await get(ref(database, `expedientes/expediente${uid}/documentos/ComprobanteDomicilio/campos/domicilio/valor`));
        let domicilioCandidato = "";
        if (domicilioSnap.exists()) {
            domicilioCandidato = domicilioSnap.val();
        }
        contractFields.domicilio_candidato = domicilioCandidato;

        const estadoCivilSnap = await get(ref(database, `expedientes/expediente${uid}/documentos/ActaNacimiento/campos/estadoCivil/valor`));
        let estadoCivlCandidato = "";
        if (estadoCivilSnap.exists()) {
            estadoCivlCandidato = estadoCivilSnap.val();
        }
        contractFields.estado_civil = estadoCivlCandidato;

        const edadSnap = await get(ref(database, `expedientes/expediente${uid}/documentos/ActaNacimiento/campos/edad/valor`));
        let edadCandidato = "";
        if (edadSnap.exists()) {
            edadCandidato  = edadSnap.val();
        }
        contractFields.edad = edadCandidato;

        const rfcSnap = await get(ref(database, `expedientes/expediente${uid}/documentos/ConstanciaSituacionFiscal/campos/rfc/valor`));
        let rfcCandidato = "";
        if (rfcSnap.exists()) {
            rfcCandidato = rfcSnap.val();
        }
        contractFields.rfc = rfcCandidato;

        const curpSnap = await get(ref(database, `expedientes/expediente${uid}/documentos/CURP/campos/curp/valor`));
        let curpCandidato = "";
        if (curpSnap.exists()) {
            curpCandidato = curpSnap.val();
        }
        contractFields.curp = curpCandidato;

        return NextResponse.json({
            success: true,
            contractFields
        });

    } catch (error) {
        console.error("Error getting contract fields:", error);
        return NextResponse.json({
            error: "Internal server error"
        }, {status: 500});
    }
}