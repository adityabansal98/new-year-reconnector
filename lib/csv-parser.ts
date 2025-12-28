import Papa from "papaparse"

export interface LinkedInConnection {
  "First Name": string
  "Last Name": string
  URL?: string
  "Email Address"?: string
  Company: string
  Position: string
  "Connected On": string
}

export async function parseCSV(file: File): Promise<LinkedInConnection[]> {
  return new Promise((resolve, reject) => {
    // Read file as text first to ensure proper encoding
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const text = e.target?.result as string
      
      // Split into lines and find the header row (row 4, index 3)
      const lines = text.split(/\r?\n/)
      
      // Find the header row - look for "First Name" in the first few rows
      let headerRowIndex = 0
      for (let i = 0; i < Math.min(10, lines.length); i++) {
        if (lines[i].includes("First Name") && lines[i].includes("Last Name")) {
          headerRowIndex = i
          break
        }
      }
      
      // If we found a header row, skip everything before it
      const textToParse = headerRowIndex > 0 
        ? lines.slice(headerRowIndex).join("\n")
        : text
      
      Papa.parse<LinkedInConnection>(textToParse, {
        header: true,
        skipEmptyLines: true,
        delimiter: ",",
        quoteChar: '"',
        escapeChar: '"',
        transformHeader: (header) => header.trim(),
        transform: (value) => (value || "").trim(),
        // Be more lenient with field mismatches - LinkedIn CSVs can be inconsistent
        dynamicTyping: false,
        complete: (results) => {
          // Filter out parsing errors that are just warnings about field count mismatches
          // These often occur when CSV has extra columns or inconsistent formatting
          const criticalErrors = results.errors.filter(
            (error) => 
              error.type !== "FieldMismatch" && 
              error.type !== "Quotes" &&
              error.type !== "Delimiter"
          )

          if (criticalErrors.length > 0) {
            console.warn("CSV parsing warnings:", criticalErrors)
          }

          // Filter out empty rows and ensure required fields exist
          const validConnections = results.data.filter(
            (row) =>
              row &&
              row["First Name"] &&
              row["Last Name"] &&
              (row.Company || row.Position) // At least one should exist
          )

          if (validConnections.length === 0) {
            reject(new Error("No valid connections found in CSV file. Please ensure the file has 'First Name', 'Last Name', and either 'Company' or 'Position' columns."))
            return
          }

          resolve(validConnections)
        },
        error: (error) => {
          reject(new Error(`Failed to parse CSV: ${error.message}`))
        },
      })
    }

    reader.onerror = () => {
      reject(new Error("Failed to read CSV file"))
    }

    reader.readAsText(file, "UTF-8")
  })
}

