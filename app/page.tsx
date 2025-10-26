"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Trash, Eye, EyeOff, Download } from "lucide-react"
import * as XLSX from "xlsx"

interface Registro {
  no: number
  fecha: string
  nombres: string
  apellidos: string
  prefijoId: string
  cedulaPasaporte: string
  telefono: string
  municipio: string
  parroquia: string
  direccion: string
  breveDescripcion: string
  promotor: string
  informacionFue: string
  motivos: string
}

const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbzBvpMlE7jtkqbtWBfPDezU3gHqWnjacRdYx4xhK8BAGNK2K24F3_pBBqIspkKt5PbDLw/exec" // 👈 coloca aquí tu URL de Apps Script

export default function FormularioOAC() {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [seleccionado, setSeleccionado] = useState<number | null>(null)
  const [descripcionesVisibles, setDescripcionesVisibles] = useState<{ [key: number]: boolean }>({})
  const [motivosVisibles, setMotivosVisibles] = useState<{ [key: number]: boolean }>({})
  const [confirmacion, setConfirmacion] = useState("")
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    prefijoId: "V-",
    cedulaPasaporte: "",
    telefono: "",
    municipio: "",
    parroquia: "",
    direccion: "",
    breveDescripcion: "",
    promotor: "",
    informacionFue: "satisfactoria",
    motivos: "",
  })

const guardarEnGoogleSheets = async (registro: Registro) => {
  try {
    // Crear objeto plano con los datos
    const datos = Object.fromEntries(
      Object.entries(registro).map(([key, value]) => [key, String(value ?? "")])
    );

    // Enviar como JSON
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();
    console.log("✅ Respuesta Google Sheets:", result);

    if (result.result === 'success') {
      setConfirmacion("✅ Registro guardado en la nube");
    } else {
      throw new Error(result.error);
    }
    
    setTimeout(() => setConfirmacion(""), 3000);
  } catch (error) {
    console.error("❌ Error al guardar:", error);
    setConfirmacion("❌ Error al guardar en la nube");
  }
}
  // 🔹 Añadir registro
  const agregarALista = () => {
    const nuevoRegistro: Registro = {
      no: registros.length + 1,
      fecha: new Date().toLocaleDateString("es-ES"),
      ...formData,
    }

    setRegistros(prev => [...prev, nuevoRegistro])
    guardarEnGoogleSheets(nuevoRegistro)

    setFormData({
      nombres: "",
      apellidos: "",
      prefijoId: "V-",
      cedulaPasaporte: "",
      telefono: "",
      municipio: "",
      parroquia: "",
      direccion: "",
      breveDescripcion: "",
      promotor: "",
      informacionFue: "satisfactoria",
      motivos: "",
    })
  }

  // 🔹 Eliminar uno
  const eliminarSeleccionado = () => {
    if (seleccionado !== null) {
      const registro = registros[seleccionado]
      fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", no: registro.no }),
      })
      setRegistros(registros.filter((_, i) => i !== seleccionado))
      setSeleccionado(null)
    }
  }

  // 🔹 Eliminar todos
  const eliminarTodo = () => {
    if (confirm("¿Seguro que quieres borrar toda la lista?")) {
      fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      })
      setRegistros([])
    }
  }

  // 🔹 Guardar Excel localmente
const guardarExcel = () => {
  try {
    if (registros.length === 0) {
      alert("No hay registros para exportar.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(registros);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");

    const fecha = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const nombreArchivo = `Registros_${fecha}.xlsx`;

    XLSX.writeFile(wb, nombreArchivo, { bookType: "xlsx", type: "file" });

    setConfirmacion("✅ Excel guardado correctamente en tu PC");
    setTimeout(() => setConfirmacion(""), 3000);
  } catch (error) {
    console.error("Error al guardar Excel:", error);
    setConfirmacion("❌ No se pudo generar el archivo Excel");
  }
};


  const toggleDescripcion = (index: number) => setDescripcionesVisibles(prev => ({ ...prev, [index]: !prev[index] }))
  const toggleMotivos = (index: number) => setMotivosVisibles(prev => ({ ...prev, [index]: !prev[index] }))
  const handleInputChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DFD2D0] to-[#BFA4A1] p-6">
      <div className="mx-auto max-w-7xl">
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-[#804A43] to-[#A07772] text-white rounded-t-2xl py-6">
            <CardTitle className="text-2xl font-bold tracking-wide">📋 Formulario OAC - Registro de Atendidos</CardTitle>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {/* DATOS PERSONALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><Label>Nombres</Label><Input value={formData.nombres} onChange={e => handleInputChange("nombres", e.target.value)} /></div>
              <div><Label>Apellidos</Label><Input value={formData.apellidos} onChange={e => handleInputChange("apellidos", e.target.value)} /></div>
              <div><Label>Teléfono</Label><Input value={formData.telefono} onChange={e => handleInputChange("telefono", e.target.value)} /></div>
              <div>
                <Label>Prefijo ID</Label>
                <Select value={formData.prefijoId} onValueChange={v => handleInputChange("prefijoId", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="V-">V-</SelectItem>
                    <SelectItem value="E-">E-</SelectItem>
                    <SelectItem value="J-">J-</SelectItem>
                    <SelectItem value="G-">G-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2"><Label>Cédula/Pasaporte</Label><Input value={formData.cedulaPasaporte} onChange={e => handleInputChange("cedulaPasaporte", e.target.value)} /></div>
            </div>

            {/* UBICACIÓN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Municipio</Label><Input value={formData.municipio} onChange={e => handleInputChange("municipio", e.target.value)} /></div>
              <div><Label>Parroquia</Label><Input value={formData.parroquia} onChange={e => handleInputChange("parroquia", e.target.value)} /></div>
              <div className="md:col-span-2"><Label>Dirección</Label><Textarea value={formData.direccion} onChange={e => handleInputChange("direccion", e.target.value)} /></div>
            </div>

            {/* DESCRIPCIÓN Y DETALLES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Breve descripción</Label><Textarea value={formData.breveDescripcion} onChange={e => handleInputChange("breveDescripcion", e.target.value)} /></div>
              <div><Label>Promotor</Label><Input value={formData.promotor} onChange={e => handleInputChange("promotor", e.target.value)} /></div>
              <div className="col-span-2">
                <Label>La información fue:</Label>
                <RadioGroup value={formData.informacionFue} onValueChange={v => handleInputChange("informacionFue", v)} className="flex gap-6 mt-2">
                  <div className="flex items-center gap-2"><RadioGroupItem value="satisfactoria" /> <Label>Satisfactoria</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="insatisfactoria" /> <Label>Insatisfactoria</Label></div>
                </RadioGroup>
              </div>
              {formData.informacionFue === "insatisfactoria" && (
                <div className="col-span-2"><Label>Motivos</Label><Textarea value={formData.motivos} onChange={e => handleInputChange("motivos", e.target.value)} /></div>
              )}
            </div>

            {/* BOTONES */}
            <div className="flex flex-wrap gap-4 pt-4 border-t-2 border-[#DFD2D0]">
              <Button onClick={agregarALista}><Plus /> Añadir a la lista</Button>
              <Button variant="destructive" onClick={eliminarSeleccionado} disabled={seleccionado===null}><Trash2 /> Eliminar seleccionado</Button>
              <Button variant="destructive" onClick={eliminarTodo}><Trash /> Borrar todo</Button>
              <Button onClick={guardarExcel}><Download /> Guardar Excel</Button>
            </div>

            {confirmacion && <p className="text-green-700 font-semibold mt-2">{confirmacion}</p>}

            {/* TABLA */}
            {registros.length > 0 && (
              <div className="overflow-x-auto mt-6 rounded-lg border shadow-lg bg-white">
                <Table className="min-w-[1800px]">
                  <TableHeader>
                    <TableRow>
                      {["No","Fecha","Nombres","Apellidos","Prefijo ID","Cédula/Pasaporte","Teléfono","Municipio","Parroquia","Dirección","Descripción","Promotor","Info","Motivos"].map((h)=>(
                        <TableHead key={h} className="bg-[#BFA4A1] text-white">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registros.map((r,i)=>(
                      <TableRow key={i} onClick={()=>setSeleccionado(i)} className={seleccionado===i?"bg-[#BFA4A1] text-white":"hover:bg-[#F0E5E3]"}>
                        <TableCell>{r.no}</TableCell>
                        <TableCell>{r.fecha}</TableCell>
                        <TableCell>{r.nombres}</TableCell>
                        <TableCell>{r.apellidos}</TableCell>
                        <TableCell>{r.prefijoId}</TableCell>
                        <TableCell>{r.cedulaPasaporte}</TableCell>
                        <TableCell>{r.telefono}</TableCell>
                        <TableCell>{r.municipio}</TableCell>
                        <TableCell>{r.parroquia}</TableCell>
                        <TableCell className="truncate max-w-[180px]">{r.direccion}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={()=>toggleDescripcion(i)}>
                            {descripcionesVisibles[i] ? <EyeOff /> : <Eye />}
                          </Button>
                          {descripcionesVisibles[i] && <div className="text-sm mt-1">{r.breveDescripcion}</div>}
                        </TableCell>
                        <TableCell>{r.promotor}</TableCell>
                        <TableCell>{r.informacionFue}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={()=>toggleMotivos(i)}>
                            {motivosVisibles[i] ? <EyeOff /> : <Eye />}
                          </Button>
                          {motivosVisibles[i] && <div className="text-sm mt-1">{r.motivos}</div>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
