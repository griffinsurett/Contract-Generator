// Gets today's date as YYYY-MM-DD string
export const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Gets a date X months from today as YYYY-MM-DD string
export const getDateMonthsFromNow = (months) => {
  const date = new Date()
  date.setMonth(date.getMonth() + months)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Formats any date string (YYYY-MM-DD) to spelled out fields
export const formatDateToFields = (dateString) => {
  const date = new Date(dateString + 'T00:00:00')
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  return {
    day: date.getDate().toString(),
    month: monthNames[date.getMonth()],
    year: date.getFullYear().toString()
  }
}