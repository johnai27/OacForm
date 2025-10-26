// CONFIGURACIÓN DE GOOGLE SHEETS API
//
// Para usar esta funcionalidad, necesitas:
//
// 1. Crear un proyecto en Google Cloud Console
// 2. Habilitar Google Sheets API
// 3. Crear un Google Apps Script Web App con el siguiente código:
//
// function doPost(e) {
//   const ss = SpreadsheetApp.openById('TU_SPREADSHEET_ID');
//   const sheet = ss.getSheetByName('Registros') || ss.insertSheet('Registros');
//
//   const data = JSON.parse(e.postData.contents);
//   const registros = data.registros;
//
//   // Si la hoja está vacía, agregar encabezados
//   if (sheet.getLastRow() === 0) {
//     sheet.appendRow([
//       'No.', 'Fecha', 'Nombres', 'Apellidos', 'Prefijo_ID',
//       'Cédula/Pasaporte', 'Teléfono', 'Dirección', 'Municipio',
//       'Parroquia', 'Breve Descripción', 'Promotor',
//       'Información Fue', 'Motivos'
//     ]);
//   }
//
//   // Agregar cada registro
//   registros.forEach(registro => {
//     sheet.appendRow([
//       registro.no,
//       registro.fecha,
//       registro.nombres,
//       registro.apellidos,
//       registro.prefijoId,
//       registro.cedulaPasaporte,
//       registro.telefono,
//       registro.direccion,
//       registro.municipio,
//       registro.parroquia,
//       registro.breveDescripcion,
//       registro.promotor,
//       registro.informacionFue,
//       registro.motivos
//     ]);
//   });
//
//   return ContentService.createTextOutput(JSON.stringify({
//     status: 'success',
//     message: 'Datos guardados correctamente'
//   })).setMimeType(ContentService.MimeType.JSON);
// }
//
// 4. Implementar el Web App y copiar la URL
// 5. Pegar la URL en la constante GOOGLE_SHEETS_URL en page.tsx

export const GOOGLE_SHEETS_CONFIG = {
  // Reemplaza con tu URL de Google Apps Script Web App
  webAppUrl: "TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI",

  // ID de tu Google Spreadsheet (opcional, se usa en el script)
  spreadsheetId: "TU_SPREADSHEET_ID_AQUI",
}
