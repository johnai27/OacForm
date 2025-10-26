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
import { Plus, Trash2, Trash, Eye, EyeOff } from "lucide-react"

interface Registro {
  no: number
  fecha: string
  nombres: string
  apellidos: string
  prefijoId: string
  cedulaPasaporte: string
  telefono: string
  direccion: string
  municipio: string
  parroquia: string
  breveDescripcion: string
  promotor: string
  informacionFue: string
  motivos: string
}

const GOOGLE_SHEETS_URL =
  "https://script.google.com/macros/s/AKfycbzZR2HHr7VDmmE3b255sDNylG88BMQIjcryZ-l03m_DTe0_MJFW0qnF7h-j1pqe6343/exec"

export default function FormularioOAC() {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [seleccionado, setSeleccionado] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    prefijoId: "V-",
    cedulaPasaporte: "",
    telefono: "",
    direccion: "",
    municipio: "",
    parroquia: "",
    breveDescripcion: "",
    promotor: "",
    informacionFue: "satisfactoria",
    motivos: "",
  })
  const [descripcionesVisibles, setDescripcionesVisibles] = useState<{ [key: number]: boolean }>({})
  const [motivosVisibles, setMotivosVisibles] = useState<{ [key: number]: boolean }>({})

  useEffect(() => {
    // Cargar registros al iniciar
    fetch(GOOGLE_SHEETS_URL + "?action=get")
      .then(res => res.json())
      .then((data: Registro[]) => {
        if (data && Array.isArray(data)) setRegistros(data)
      })
      .catch(err => console.error("Error al cargar registros:", err))
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleDescripcion = (index: number) => {
    setDescripcionesVisibles(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const toggleMotivos = (index: number) => {
    setMotivosVisibles(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const guardarEnGoogleSheets = async (registro: Registro) => {
    try {
      await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", registros: [registro] }),
      })
    } catch (error) {
      console.error("Error al guardar en Google Sheets:", error)
    }
  }

  const eliminarRegistroGoogleSheets = async (no: number) => {
    try {
      await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", no }),
      })
    } catch (error) {
      console.error("Error al eliminar registro:", error)
    }
  }

  const eliminarTodaLaListaGoogleSheets = async () => {
    try {
      await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      })
    } catch (error) {
      console.error("Error al eliminar toda la lista:", error)
    }
  }

  const agregarALista = () => {
    const nuevoRegistro: Registro = { no: registros.length + 1, fecha: new Date().toLocaleDateString("es-ES"), ...formData }
    setRegistros([...registros, nuevoRegistro])
    guardarEnGoogleSheets(nuevoRegistro)
    setFormData({ nombres: "", apellidos: "", prefijoId: "V-", cedulaPasaporte: "", telefono: "", direccion: "", municipio: "", parroquia: "", breveDescripcion: "", promotor: "", informacionFue: "satisfactoria", motivos: "" })
  }

  const quitarSeleccionado = () => {
    if (seleccionado !== null) {
      const registroAEliminar = registros[seleccionado]
      eliminarRegistroGoogleSheets(registroAEliminar.no)
      setRegistros(registros.filter((_, index) => index !== seleccionado))
      setSeleccionado(null)
    }
  }

  const eliminarTodaLaLista = () => {
    if (confirm("¿Seguro que quieres eliminar toda la lista?")) {
      setRegistros([])
      eliminarTodaLaListaGoogleSheets()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DFD2D0] to-[#BFA4A1] p-6">
      <div className="mx-auto max-w-7xl">
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-[#804A43] via-[#8d5550] to-[#A07772] text-white rounded-t-2xl py-6">
            <CardTitle className="text-2xl font-bold tracking-wide">Formulario OAC - Registro de Atendidos</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Información Personal */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#804A43] border-b-2 border-[#DFD2D0] pb-2">
                Información Personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombres" className="text-[#804A43] font-semibold">Nombres</Label>
                  <Input
                    id="nombres"
                    value={formData.nombres}
                    onChange={(e) => handleInputChange("nombres", e.target.value)}
                    className="rounded-xl border-[#BFA4A1] focus:border-[#804A43] focus:ring-[#804A43]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos" className="text-[#804A43] font-semibold">Apellidos</Label>
                  <Input
                    id="apellidos"
                    value={formData.apellidos}
                    onChange={(e) => handleInputChange("apellidos", e.target.value)}
                    className="rounded-xl border-[#BFA4A1] focus:border-[#804A43] focus:ring-[#804A43]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-[#804A43] font-semibold">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange("telefono", e.target.value)}
                    className="rounded-xl border-[#BFA4A1] focus:border-[#804A43] focus:ring-[#804A43]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prefijoId" className="text-[#804A43] font-semibold">Prefijo ID</Label>
                  <Select value={formData.prefijoId} onValueChange={(v) => handleInputChange("prefijoId", v)}>
                    <SelectTrigger className="rounded-xl border-[#BFA4A1] focus:border-[#804A43] focus:ring-[#804A43]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="V-">V-</SelectItem>
                      <SelectItem value="E-">E-</SelectItem>
                      <SelectItem value="J-">J-</SelectItem>
                      <SelectItem value="G-">G-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="cedulaPasaporte" className="text-[#804A43] font-semibold">Cédula/Pasaporte</Label>
                  <Input
                    id="cedulaPasaporte"
                    value={formData.cedulaPasaporte}
                    onChange={(e) => handleInputChange("cedulaPasaporte", e.target.value)}
                    className="rounded-xl border-[#BFA4A1] focus:border-[#804A43] focus:ring-[#804A43]"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#804A43] border-b-2 border-[#DFD2D0] pb-2">Ubicación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="municipio" className="text-[#804A43] font-semibold">Municipio</Label>
                  <Input
                    id="municipio"
                    value={formData.municipio}
                    onChange={(e) => handleInputChange("municipio", e.target.value)}
                    className="rounded-xl border-[#BFA4A1] focus:border-[#804A43] focus:ring-[#804A43]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parroquia" className="text-[#804A43] font-semibold">Parroquia</Label>
                  <Input
                    id="parroquia"
                    value={formData.parroquia}
                    onChange={(e) => handleInputChange("parroquia", e.target.value)}
                    className="rounded-xl border-[#BFA4A1] focus:border-[#804A43] focus:ring-[#804A43]"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccion" className="text-[#804A43] font-semibold">Dirección</Label>
                  <Textarea
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange("direccion", e.target.value)}
                    className="rounded-xl border-[#BFA4A1] focus:border-[#804A43] focus:ring-[#804A43] min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* Detalles de Atención */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#804A43] border-b-2 border-[#DFD2D0] pb-2">Detalles de Atención</h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="breveDescripcion" className="text-[#804A43] font-semibold">Breve descripción</Label>
                  <Textarea
                    id="breveDescripcion"
                    value={formData.breveDescripcion}
                    onChange={(e) => handleInputChange("breveDescripcion", e.target.value)}
                    className="rounded-xl border-[#BFA4A1] focus:border-[#804A43] focus:ring-[#804A43] min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promotor" className="text-[#804A43] font-semibold">Promotor (servidor que atendió)</Label>
                  <Input
                    id="promotor"
                    value={formData.promotor}
                    onChange={(e) => handleInputChange("promotor", e.target.value)}
                    className="rounded-xl border-[#BFA4A1] focus:border-[#804A43] focus:ring-[#804A43]"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-[#804A43] font-semibold">La información fue:</Label>
                  <RadioGroup
                    value={formData.informacionFue}
                    onValueChange={(v) => handleInputChange("informacionFue", v)}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="satisfactoria" id="satisfactoria" />
                      <Label htmlFor="satisfactoria" className="cursor-pointer font-normal text-[#804A43]">Satisfactoria</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="insatisfactoria" id="insatisfactoria" />
                      <Label htmlFor="insatisfactoria" className="cursor-pointer font-normal text-[#804A43]">Insatisfactoria</Label>
                    </div>
                  </RadioGroup>
                </div>
                {formData.informacionFue === "insatisfactoria" && (
                  <div className="space-y-2">
                    <Label htmlFor="motivos" className="text-[#804A43] font-semibold">Motivos (si insatisfactoria)</Label>
                    <Textarea
                      id="motivos"
                      value={formData.motivos}
                      onChange={(e) => handleInputChange("motivos", e.target.value)}
                      className="rounded-xl border-[#BFA4A1] focus:border-[#804A43] focus:ring-[#804A43] min-h-[80px]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-wrap gap-4 pt-4 border-t-2 border-[#DFD2D0]">
              <Button onClick={agregarALista} className="bg-[#804A43] hover:bg-[#6d3f39] text-white rounded-xl px-6 font-semibold shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Agregar a la lista
              </Button>
              <Button onClick={quitarSeleccionado} variant="destructive" disabled={seleccionado === null} className="rounded-xl px-6 font-semibold shadow-lg">
                <Trash2 className="w-4 h-4 mr-2" />
                Quitar seleccionado
              </Button>
              <Button onClick={eliminarTodaLaLista} variant="destructive" className="rounded-xl px-6 font-semibold shadow-lg">
                <Trash className="w-4 h-4 mr-2" />
                Eliminar toda la lista
              </Button>
            </div>

            {/* Tabla */}
            {registros.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#804A43] border-b-2 border-[#DFD2D0] pb-2">Registros</h3>
                <div className="rounded-2xl border-2 border-[#BFA4A1] overflow-hidden shadow-lg bg-white">
                  <div className="overflow-x-auto overflow-y-visible w-full" style={{ maxWidth: "100%" }}>
                    <Table className="w-full" style={{ minWidth: "1800px" }}>
                      <TableHeader>
                        <TableRow className="bg-[#A07772] text-white">
                          <TableHead className="font-bold uppercase">No.</TableHead>
                          <TableHead className="font-bold uppercase">Fecha</TableHead>
                          <TableHead className="font-bold uppercase">Nombres</TableHead>
                          <TableHead className="font-bold uppercase">Apellidos</TableHead>
                          <TableHead className="font-bold uppercase">Prefijo ID</TableHead>
                          <TableHead className="font-bold uppercase">Cédula/Pasaporte</TableHead>
                          <TableHead className="font-bold uppercase">Teléfono</TableHead>
                          <TableHead className="font-bold uppercase">Municipio</TableHead>
                          <TableHead className="font-bold uppercase">Parroquia</TableHead>
                          <TableHead className="font-bold uppercase">Dirección</TableHead>
                          <TableHead className="font-bold uppercase">Breve descripción</TableHead>
                          <TableHead className="font-bold uppercase">Promotor</TableHead>
                          <TableHead className="font-bold uppercase">Info. Satisfactoria</TableHead>
                          <TableHead className="font-bold uppercase">Motivos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {registros.map((registro, index) => (
                          <TableRow key={index} onClick={() => setSeleccionado(index)} className={`cursor-pointer ${seleccionado === index ? "bg-[#BFA4A1] text-white" : "hover:bg-[#DFD2D0]"}`}>
                            <TableCell>{registro.no}</TableCell>
                            <TableCell>{registro.fecha}</TableCell>
                            <TableCell>{registro.nombres}</TableCell>
                            <TableCell>{registro.apellidos}</TableCell>
                            <TableCell>{registro.prefijoId}</TableCell>
                            <TableCell>{registro.cedulaPasaporte}</TableCell>
                            <TableCell>{registro.telefono}</TableCell>
                            <TableCell>{registro.municipio}</TableCell>
                            <TableCell>{registro.parroquia}</TableCell>
                            <TableCell className="min-w-[200px] truncate">{registro.direccion}</TableCell>
                            <TableCell className="min-w-[220px]">
                              <div className="flex items-center gap-2">
                                {descripcionesVisibles[index] ? (
                                  <span>{registro.breveDescripcion}</span>
                                ) : (
                                  <span className="text-[#A07772] italic text-sm">Ver descripción</span>
                                )}
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); toggleDescripcion(index) }}>
                                  {descripcionesVisibles[index] ? <EyeOff className="h-4 w-4 text-[#804A43]" /> : <Eye className="h-4 w-4 text-[#804A43]" />}
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>{registro.promotor}</TableCell>
                            <TableCell>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${registro.informacionFue === "satisfactoria" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                {registro.informacionFue === "satisfactoria" ? "Sí" : "No"}
                              </span>
                            </TableCell>
                            <TableCell className="min-w-[220px]">
                              {registro.informacionFue === "insatisfactoria" && registro.motivos ? (
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); toggleMotivos(index) }}>
                                    {motivosVisibles[index] ? <EyeOff className="h-4 w-4 text-[#804A43]" /> : <Eye className="h-4 w-4 text-[#804A43]" />}
                                  </Button>
                                  {motivosVisibles[index] ? <span>{registro.motivos}</span> : <span className="text-[#A07772] italic text-sm">Ver motivos</span>}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">N/A</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
