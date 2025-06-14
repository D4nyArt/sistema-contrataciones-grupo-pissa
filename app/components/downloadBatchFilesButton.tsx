import React, {useEffect, useState} from 'react'
import JSZip from 'jszip'
import {saveAs} from 'file-saver'
import {getStorage, ref as storageRef, getDownloadURL} from 'firebase/storage'
import {FolderDown} from "lucide-react";

type Documento = {
  estadoArchivo: string
  estadoCampos: string
  estadoGeneral: string
  extension: string
  nombre: string
  url: string
}

type Expediente = {
  documentos: Record<string, Documento>
  id_candidato: string
  notas?: string
}

interface Props {
  expedienteId: string
}

const DownloadBatchFilesButton: React.FC<Props> = ({expedienteId}) => {
  const [expediente, setExpediente] = useState<Expediente | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchExpediente() {
      try {
        // <-- cambiamos a GET con query param
        const res = await fetch(`/api/expediente?expedienteId=${expedienteId}`)
        if (res.ok) {
          const data: Expediente = await res.json()
          setExpediente(data)
        } else {
          console.error('Error al cargar expediente', await res.text())
        }
      } catch (err) {
        console.error('Error cargando expediente:', err)
      }
    }
    fetchExpediente()
  }, [expedienteId])

  const handleDownload = async () => {
    if (!expediente) return
    setLoading(true)
    const zip = new JSZip()
    const storage = getStorage()

    for (const key of Object.keys(expediente.documentos)) {
      const doc = expediente.documentos[key]
      if (!doc.url) continue
      try {
        const fileRef = storageRef(storage, doc.url)
        const downloadUrl = await getDownloadURL(fileRef)
        const res = await fetch(downloadUrl)
        const blob = await res.blob()
        const filename = `${doc.nombre}.${doc.extension}`
        zip.file(filename, blob)
      } catch (err) {
        console.error(`Error descargando ${key}:`, err)
      }
    }

    try {
      const content = await zip.generateAsync({type: 'blob'})
      saveAs(content, `expediente-${expediente.id_candidato}.zip`)
    } catch (err) {
      console.error('Error generando ZIP:', err)
    } finally {
      setLoading(false)
    }
  }
  if (!expediente) {
    return (
      <button
        className="px-3.5 py-2 text-xs text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled
      >
        Cargando expediente…
      </button>
    )
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="px-3.5 py-2 bg-[#2d4583] text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-100 hover:text-[#2d4583] transition-colors cursor-pointer"
    >
      {loading ? 'Preparando descarga…' : <FolderDown className="w-5" />}
    </button>
  )
}

export default DownloadBatchFilesButton