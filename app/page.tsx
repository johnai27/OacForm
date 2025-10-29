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
import { Plus, Trash2, Eye, EyeOff, Download, Database } from "lucide-react"
import * as XLSX from "xlsx"

// Firebase
import { db } from "@/lib/firebase"
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  onSnapshot 
} from "firebase/firestore"

interface Registro {
  id?: string
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
  timestamp?: any
}

// Función para obtener nombre de colección por fecha
const obtenerNombreColeccion = (fecha: string = new Date().toLocaleDateString("es-ES")) => {
  const fechaFormateada = fecha.split('/').join('-');
  return `registros_${fechaFormateada}`;
};

// Generar opciones de colección (últimos 7 días)
const generarOpcionesColecciones = () => {
  const opciones = [];
  for (let i = 0; i < 7; i++) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    const fechaStr = fecha.toLocaleDateString("es-ES");
    opciones.push({
      label: fechaStr,
      value: obtenerNombreColeccion(fechaStr)
    });
  }
  return opciones;
};

export default function FormularioOAC() {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [seleccionado, setSeleccionado] = useState<string | null>(null)
  const [descripcionesVisibles, setDescripcionesVisibles] = useState<{ [key: string]: boolean }>({})
  const [motivosVisibles, setMotivosVisibles] = useState<{ [key: string]: boolean }>({})
  const [confirmacion, setConfirmacion] = useState("")
  const [cargando, setCargando] = useState(false)
  const [coleccionActual, setColeccionActual] = useState(obtenerNombreColeccion())
  const [opcionesColecciones] = useState(generarOpcionesColecciones())
  const [errores, setErrores] = useState<{ [key: string]: string }>({})
  
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

  // Validar campos obligatorios
  const validarCampos = () => {
    const nuevosErrores: { [key: string]: string } = {}
    
    if (!formData.nombres.trim()) {
      nuevosErrores.nombres = "Los nombres son obligatorios"
    }
    
    if (!formData.apellidos.trim()) {
      nuevosErrores.apellidos = "Los apellidos son obligatorios"
    }
    
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  // 🔹 Cargar registros desde Firebase
  const cargarRegistros = async (nombreColeccion: string = coleccionActual) => {
    try {
      setCargando(true)
      const q = query(collection(db, nombreColeccion), orderBy("timestamp", "desc"))
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const registrosData: Registro[] = []
        querySnapshot.forEach((doc) => {
          registrosData.push({ 
            id: doc.id,
            ...doc.data() 
          } as Registro)
        })
        setRegistros(registrosData)
        setColeccionActual(nombreColeccion)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error("❌ Error cargando registros:", error)
      setConfirmacion("❌ Error al cargar registros")
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarRegistros(coleccionActual)
  }, [])

  // 🔹 Guardar en Firebase
  const guardarEnFirebase = async () => {
    // Validar campos obligatorios
    if (!validarCampos()) {
      setConfirmacion("❌ Por favor completa los campos obligatorios")
      setTimeout(() => setConfirmacion(""), 3000)
      return
    }

    try {
      setCargando(true)
      
      const fechaActual = new Date().toLocaleDateString("es-ES")
      const nombreColeccion = obtenerNombreColeccion(fechaActual)
      
      const nuevoRegistro: Omit<Registro, 'id'> = {
        no: registros.length + 1,
        fecha: fechaActual,
        ...formData,
        timestamp: new Date()
      }

      // Guardar en la colección de la fecha actual
      await addDoc(collection(db, nombreColeccion), nuevoRegistro)

      // Si no estamos en la colección actual, cambiar a ella
      if (nombreColeccion !== coleccionActual) {
        cargarRegistros(nombreColeccion)
      } else {
        // Recargar registros de la colección actual
        cargarRegistros(nombreColeccion)
      }
      
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

      setErrores({})
      setConfirmacion(`✅ Registro guardado en: ${nombreColeccion}`)
      setTimeout(() => setConfirmacion(""), 3000)
      
    } catch (error) {
      console.error("❌ Error al guardar:", error)
      setConfirmacion("❌ Error al guardar en la nube")
      setTimeout(() => setConfirmacion(""), 3000)
    } finally {
      setCargando(false)
    }
  }

  // 🔹 Eliminar registro
  const eliminarSeleccionado = async () => {
    if (seleccionado) {
      try {
        setCargando(true)
        await deleteDoc(doc(db, coleccionActual, seleccionado))
        setSeleccionado(null)
        setConfirmacion("✅ Registro eliminado")
        setTimeout(() => setConfirmacion(""), 3000)
      } catch (error) {
        console.error("❌ Error eliminando:", error)
        setConfirmacion("❌ Error al eliminar")
      } finally {
        setCargando(false)
      }
    }
  }

  // 🔹 Guardar Excel SIMPLIFICADO pero funcional
  const guardarExcel = () => {
    try {
      if (registros.length === 0) {
        alert("No hay registros para exportar.")
        return
      }

      // Orden correcto de columnas con nombres en español
      const datosParaExcel = registros.map(registro => ({
        "NO": registro.no,
        "FECHA": registro.fecha,
        "NOMBRES": registro.nombres,
        "APELLIDOS": registro.apellidos,
        "PREFIJO ID": registro.prefijoId,
        "CÉDULA/PASAPORTE": registro.cedulaPasaporte,
        "TELÉFONO": registro.telefono,
        "MUNICIPIO": registro.municipio,
        "PARROQUIA": registro.parroquia,
        "DIRECCIÓN": registro.direccion,
        "DESCRIPCIÓN": registro.breveDescripcion,
        "PROMOTOR": registro.promotor,
        "INFORMACIÓN": registro.informacionFue,
        "MOTIVOS": registro.motivos
      }))

      // Crear workbook y worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(datosParaExcel)

      // Ajustar anchos de columna específicos
      ws['!cols'] = [
        { wch: 5 },   // No
        { wch: 12 },  // Fecha
        { wch: 20 },  // Nombres
        { wch: 20 },  // Apellidos
        { wch: 10 },  // Prefijo ID
        { wch: 18 },  // Cédula/Pasaporte
        { wch: 15 },  // Teléfono
        { wch: 15 },  // Municipio
        { wch: 15 },  // Parroquia
        { wch: 25 },  // Dirección
        { wch: 30 },  // Descripción
        { wch: 15 },  // Promotor
        { wch: 15 },  // Información
        { wch: 30 }   // Motivos
      ]

      // Añadir la hoja al workbook
      XLSX.utils.book_append_sheet(wb, ws, "REGISTROS OAC")

      // Generar nombre de archivo
      const fecha = new Date().toISOString().split("T")[0]
      const nombreArchivo = `REGISTROS_OAC_${fecha}.xlsx`

      // Guardar archivo
      XLSX.writeFile(wb, nombreArchivo)

      setConfirmacion("✅ Excel descargado correctamente")
      setTimeout(() => setConfirmacion(""), 3000)
    } catch (error) {
      console.error("Error al guardar Excel:", error)
      setConfirmacion("❌ No se pudo generar el archivo Excel")
    }
  }

  const toggleDescripcion = (id: string) => {
    setDescripcionesVisibles(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleMotivos = (id: string) => {
    setMotivosVisibles(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errores[field]) {
      setErrores(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DFD2D0] to-[#BFA4A1] p-6">
      <div className="mx-auto max-w-7xl">
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-[#804A43] to-[#A07772] text-white rounded-t-2xl py-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold tracking-wide">
                Formulario OAC
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Select 
                    value={coleccionActual} 
                    onValueChange={(value) => cargarRegistros(value)}
                  >
                    <SelectTrigger className="w-48 bg-white/20 text-white border-white/30">
                      <SelectValue placeholder="Seleccionar fecha" />
                    </SelectTrigger>
                    <SelectContent>
                      {opcionesColecciones.map((opcion) => (
                        <SelectItem key={opcion.value} value={opcion.value}>
                          {opcion.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-6 h-6" />
                  <span className={`text-sm px-2 py-1 rounded ${
                    cargando ? "bg-yellow-500" : "bg-green-500"
                  }`}>
                    {cargando ? "Sincronizando..." : `Registros: ${registros.length}`}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {/* DATOS PERSONALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nombres">Nombres *</Label>
                <Input 
                  id="nombres"
                  value={formData.nombres} 
                  onChange={e => handleInputChange("nombres", e.target.value)} 
                  placeholder="Ingresa los nombres"
                  className={errores.nombres ? "border-red-500" : ""}
                />
                {errores.nombres && (
                  <p className="text-red-500 text-sm mt-1">{errores.nombres}</p>
                )}
              </div>
              <div>
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input 
                  id="apellidos"
                  value={formData.apellidos} 
                  onChange={e => handleInputChange("apellidos", e.target.value)} 
                  placeholder="Ingresa los apellidos"
                  className={errores.apellidos ? "border-red-500" : ""}
                />
                {errores.apellidos && (
                  <p className="text-red-500 text-sm mt-1">{errores.apellidos}</p>
                )}
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input 
                  id="telefono"
                  value={formData.telefono} 
                  onChange={e => handleInputChange("telefono", e.target.value)} 
                  placeholder="0412-1234567"
                />
              </div>
              <div>
                <Label htmlFor="prefijoId">Prefijo ID</Label>
                <Select 
                  value={formData.prefijoId} 
                  onValueChange={v => handleInputChange("prefijoId", v)}
                >
                  <SelectTrigger id="prefijoId">
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
              <div className="md:col-span-2">
                <Label htmlFor="cedula">Cédula/Pasaporte</Label>
                <Input 
                  id="cedula"
                  value={formData.cedulaPasaporte} 
                  onChange={e => handleInputChange("cedulaPasaporte", e.target.value)} 
                  placeholder="12345678"
                />
              </div>
            </div>

            {/* UBICACIÓN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="municipio">Municipio</Label>
                <Input 
                  id="municipio"
                  value={formData.municipio} 
                  onChange={e => handleInputChange("municipio", e.target.value)} 
                  placeholder="Nombre del municipio"
                />
              </div>
              <div>
                <Label htmlFor="parroquia">Parroquia</Label>
                <Input 
                  id="parroquia"
                  value={formData.parroquia} 
                  onChange={e => handleInputChange("parroquia", e.target.value)} 
                  placeholder="Nombre de la parroquia"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea 
                  id="direccion"
                  value={formData.direccion} 
                  onChange={e => handleInputChange("direccion", e.target.value)} 
                  placeholder="Dirección completa"
                  rows={3}
                />
              </div>
            </div>

            {/* DESCRIPCIÓN Y DETALLES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="descripcion">Breve descripción</Label>
                <Textarea 
                  id="descripcion"
                  value={formData.breveDescripcion} 
                  onChange={e => handleInputChange("breveDescripcion", e.target.value)} 
                  placeholder="Descripción del caso"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="promotor">Promotor</Label>
                <Input 
                  id="promotor"
                  value={formData.promotor} 
                  onChange={e => handleInputChange("promotor", e.target.value)} 
                  placeholder="Nombre del promotor"
                />
              </div>
              <div className="col-span-2">
                <Label>La información fue:</Label>
                <RadioGroup 
                  value={formData.informacionFue} 
                  onValueChange={v => handleInputChange("informacionFue", v)} 
                  className="flex gap-6 mt-2"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="satisfactoria" id="satisfactoria" />
                    <Label htmlFor="satisfactoria">Satisfactoria</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="insatisfactoria" id="insatisfactoria" />
                    <Label htmlFor="insatisfactoria">Insatisfactoria</Label>
                  </div>
                </RadioGroup>
              </div>
              {formData.informacionFue === "insatisfactoria" && (
                <div className="col-span-2">
                  <Label htmlFor="motivos">Motivos</Label>
                  <Textarea 
                    id="motivos"
                    value={formData.motivos} 
                    onChange={e => handleInputChange("motivos", e.target.value)} 
                    placeholder="Explica los motivos de la insatisfacción"
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* BOTONES */}
            <div className="flex flex-wrap gap-4 pt-4 border-t-2 border-[#DFD2D0]">
              <Button 
                onClick={guardarEnFirebase} 
                disabled={cargando || !formData.nombres.trim() || !formData.apellidos.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" /> 
                {cargando ? "Guardando..." : "Guardar"}
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={eliminarSeleccionado} 
                disabled={!seleccionado || cargando}
              >
                <Trash2 className="w-4 h-4 mr-2" /> 
                Eliminar seleccionado
              </Button>
              
              <Button 
                onClick={guardarExcel} 
                disabled={cargando || registros.length === 0}
                variant="outline"
                className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
              >
                <Download className="w-4 h-4 mr-2" /> 
                Descargar Excel
              </Button>
            </div>

            {confirmacion && (
              <p className={`font-semibold mt-2 p-3 rounded-lg ${
                confirmacion.includes("✅") 
                  ? "text-green-800 bg-green-100 border border-green-200" 
                  : "text-red-800 bg-red-100 border border-red-200"
              }`}>
                {confirmacion}
              </p>
            )}

            {/* TABLA COMPLETA CON SCROLL */}
            {registros.length > 0 && (
              <div className="mt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Colección actual: <span className="text-[#804A43]">{coleccionActual}</span>
                  </h3>
                </div>
                
                <div className="overflow-x-auto rounded-lg border shadow-lg bg-white">
                  <Table className="min-w-[1800px]">
                    <TableHeader>
                      <TableRow>
                        {["No", "Fecha", "Nombres", "Apellidos", "Prefijo ID", "Cédula/Pasaporte", "Teléfono", "Municipio", "Parroquia", "Dirección", "Descripción", "Promotor", "Información", "Motivos"].map((header) => (
                          <TableHead key={header} className="bg-[#804A43] text-white font-bold py-3 px-4 whitespace-nowrap">
                            {header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registros.map((registro) => (
                        <TableRow 
                          key={registro.id} 
                          onClick={() => setSeleccionado(registro.id || null)} 
                          className={`
                            cursor-pointer transition-colors hover:bg-gray-50
                            ${seleccionado === registro.id 
                              ? "bg-[#BFA4A1] text-gray-800 font-medium" 
                              : ""
                            }
                          `}
                        >
                          <TableCell className="py-3 px-4 font-medium">{registro.no}</TableCell>
                          <TableCell className="py-3 px-4">{registro.fecha}</TableCell>
                          <TableCell className="py-3 px-4">{registro.nombres}</TableCell>
                          <TableCell className="py-3 px-4">{registro.apellidos}</TableCell>
                          <TableCell className="py-3 px-4">{registro.prefijoId}</TableCell>
                          <TableCell className="py-3 px-4">{registro.cedulaPasaporte}</TableCell>
                          <TableCell className="py-3 px-4">{registro.telefono}</TableCell>
                          <TableCell className="py-3 px-4">{registro.municipio}</TableCell>
                          <TableCell className="py-3 px-4">{registro.parroquia}</TableCell>
                          <TableCell className="py-3 px-4 max-w-[200px] truncate" title={registro.direccion}>
                            {registro.direccion}
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <div className="flex flex-col">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  registro.id && toggleDescripcion(registro.id)
                                }}
                                className="mb-1 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                              >
                                {descripcionesVisibles[registro.id!] ? 
                                  <EyeOff className="w-4 h-4" /> : 
                                  <Eye className="w-4 h-4" />
                                }
                              </Button>
                              {descripcionesVisibles[registro.id!] && (
                                <div className="text-sm p-2 bg-blue-50 rounded border border-blue-200">
                                  {registro.breveDescripcion}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-4">{registro.promotor}</TableCell>
                          <TableCell className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              registro.informacionFue === "satisfactoria" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {registro.informacionFue}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <div className="flex flex-col">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  registro.id && toggleMotivos(registro.id)
                                }}
                                className="mb-1 bg-purple-500 hover:bg-purple-600 text-white border-purple-500"
                              >
                                {motivosVisibles[registro.id!] ? 
                                  <EyeOff className="w-4 h-4" /> : 
                                  <Eye className="w-4 h-4" />
                                }
                              </Button>
                              {motivosVisibles[registro.id!] && (
                                <div className="text-sm p-2 bg-purple-50 rounded border border-purple-200">
                                  {registro.motivos || "Sin motivos especificados"}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {registros.length === 0 && !cargando && (
              <div className="text-center py-12 text-gray-500 bg-white rounded-lg border-2 border-dashed">
                <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">No hay registros en {coleccionActual}</p>
                <p className="text-sm">Agrega tu primer registro usando el formulario</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}