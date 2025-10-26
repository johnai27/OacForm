import type { NextApiRequest, NextApiResponse } from "next"
import fs from "fs-extra"
import path from "path"
import { utils, writeFile } from "xlsx-js-style"

const EXCEL_FILE_PATH = path.join(process.cwd(), "public", "OAC_Registro.xlsx")

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "POST") {
      const { registros, action } = req.body

      if (action === "crear") {
        // Crear Excel vacío con encabezados
        const ws = utils.json_to_sheet([
          {
            NO: "",
            FECHA: "",
            NOMBRES: "",
            APELLIDOS: "",
            PREFIJO_ID: "",
            CEDULA_PASAPORTE: "",
            TELEFONO: "",
            MUNICIPIO: "",
            PARROQUIA: "",
            DIRECCION: "",
            BREVE_DESCRIPCION: "",
            PROMOTOR: "",
            INFO_SATISFACTORIA: "",
            MOTIVOS: "",
          },
        ])
        // Estilo de encabezados
        const range = ws['!ref']!
        for (let C = 0; C < 14; ++C) {
          const cell = ws[`${String.fromCharCode(65 + C)}1`]
          if (cell) {
            cell.s = {
              fill: { fgColor: { rgb: "A07772" } },
              font: { bold: true, color: { rgb: "FFFFFF" } },
            }
          }
        }
        const wb = { Sheets: { "Registros": ws }, SheetNames: ["Registros"] }
        writeFile(wb, EXCEL_FILE_PATH)
        return res.status(200).json({ message: "Excel creado exitosamente" })
      }

      if (action === "guardar") {
        if (!registros || !Array.isArray(registros)) {
          return res.status(400).json({ message: "No hay registros para guardar" })
        }

        // Convertir a mayúsculas y preparar datos
        const datos = registros.map((r: any, index: number) => ({
          NO: index + 1,
          FECHA: r.fecha,
          NOMBRES: r.nombres.toUpperCase(),
          APELLIDOS: r.apellidos.toUpperCase(),
          PREFIJO_ID: r.prefijoId.toUpperCase(),
          CEDULA_PASAPORTE: r.cedulaPasaporte.toUpperCase(),
          TELEFONO: r.telefono,
          MUNICIPIO: r.municipio.toUpperCase(),
          PARROQUIA: r.parroquia.toUpperCase(),
          DIRECCION: r.direccion,
          BREVE_DESCRIPCION: r.breveDescripcion,
          PROMOTOR: r.promotor.toUpperCase(),
          INFO_SATISFACTORIA: r.informacionFue,
          MOTIVOS: r.motivos,
        }))

        const ws = utils.json_to_sheet(datos)
        // Color encabezado
        const range = ws['!ref']!
        for (let C = 0; C < 14; ++C) {
          const cell = ws[`${String.fromCharCode(65 + C)}1`]
          if (cell) {
            cell.s = {
              fill: { fgColor: { rgb: "A07772" } },
              font: { bold: true, color: { rgb: "FFFFFF" } },
            }
          }
        }

        const wb = { Sheets: { "Registros": ws }, SheetNames: ["Registros"] }
        writeFile(wb, EXCEL_FILE_PATH)
        return res.status(200).json({ message: "Excel actualizado exitosamente" })
      }

      if (action === "eliminar") {
        if (fs.existsSync(EXCEL_FILE_PATH)) {
          await fs.remove(EXCEL_FILE_PATH)
          return res.status(200).json({ message: "Excel eliminado" })
        }
        return res.status(200).json({ message: "No había archivo para eliminar" })
      }
    }

    res.status(405).json({ message: "Método no permitido" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error en el servidor", error })
  }
}
