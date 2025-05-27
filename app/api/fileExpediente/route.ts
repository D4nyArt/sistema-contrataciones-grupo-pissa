import { NextRequest, NextResponse } from 'next/server'
import { get, ref, update} from 'firebase/database'
import { database } from '@/firebaseConfig'

export async function GET(request: NextRequest) {
  try {
    const params      = request.nextUrl.searchParams
    const expedienteId = params.get('expedienteId')
    const documentoId  = params.get('documentoId')
    if (!expedienteId || !documentoId) {
      return NextResponse.json(
        { error: 'Faltan expedienteId o documentoId' },
        { status: 400 }
      )
    }

    // un solo request al nodo del documento
    const docRef = ref(
      database,
      `expedientes/expediente${expedienteId}/documentos/${documentoId}`
    )
    const snap = await get(docRef)
    if (!snap.exists()) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    // extraer solo nombre, url y estadoArchivo
    const { nombre, url, estadoArchivo} = snap.val() as { nombre?: string; url?: string; estadoArchivo?: string}
    return NextResponse.json({ nombre, url, estadoArchivo })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Error al recuperar info del archivo' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const { expedienteId, documentoId, estadoArchivo } = await request.json()
  if (!expedienteId || !documentoId || !estadoArchivo) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const docRef = ref(
    database,
    `expedientes/expediente${expedienteId}/documentos/${documentoId}`
  )
  try {
    await update(docRef, { estadoArchivo })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 })
  }
}