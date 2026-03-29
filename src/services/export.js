import * as XLSX from 'xlsx'

export const exportTransactionsToExcel = (transactions) => {
  const rows = transactions.map((item) => ({
    Fecha: item.date,
    Tipo: item.type,
    Monto: item.amount,
    Descripcion: item.description,
    Categoria: item.categoryName || '',
    Cuenta: item.accountName || '',
  }))

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transacciones')
  XLSX.writeFile(workbook, 'reporte_finanzas.xlsx')
}
