import { isValid, parse } from "date-fns"

const isValidDate = (date: Date) => {
  return date && date instanceof Date && !isNaN(date.getTime())
}

const isValidDateString = (dateSting: string) => {
  const parsedDate = parse(dateSting, "yyyy-MM-dd", new Date())
  return isValid(parsedDate)
}

export { isValidDate, isValidDateString }

