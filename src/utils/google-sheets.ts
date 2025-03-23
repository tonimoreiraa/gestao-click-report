import { google } from 'googleapis';

/**
 * Export data to Google Sheets
 */
export class GoogleSheetsExport {
  private auth;
  private sheets;

  /**
   * Initialize Google Sheets client
   * @param credentialsPath Path to credentials.json file
   */
  constructor(credentialsPath: string = 'credentials.json') {
    this.auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
    });
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  /**
   * Create a range string in A1 notation from data dimensions
   * @param dataArray The 2D array of data
   * @returns Range string in A1 notation (e.g., "A1:D10")
   */
  private createRangeFromData(dataArray: any[][], headers: string[]): string {
    // Get the number of rows and columns in the data array
    const numRows = dataArray.length;
    const numCols = headers.length;
    console.log(numRows, numCols);

    // Calculate the ending column letter based on the number of columns
    let endingColLetter = "";
    let quotient = numCols;
    let remainder = 0;
    while (quotient > 0) {
      remainder = (quotient - 1) % 26;
      endingColLetter = String.fromCharCode(65 + remainder) + endingColLetter;
      quotient = Math.floor((quotient - remainder) / 26);
    }

    // Return the range in A1 notation
    return `A1:${endingColLetter}${numRows}`;
  }

  /**
   * Format data for Google Sheets
   * @param data Array of objects to export
   * @returns 2D array ready for Google Sheets
   */
  private formatData(data: any[], headers: string[]): any[][] {
    // Get headers

    // Convert objects to arrays based on headers
    const rows = data.map(item => {
      return headers.map(header => {
        const value = item[header];

        // Handle different value types
        if (value === null || value === undefined) {
          return '';
        } else if (typeof value === 'object') {
          // Convert objects/arrays to JSON string
          return JSON.stringify(value);
        } else {
          // Convert to string
          return String(value);
        }
      });
    });

    // Combine headers and rows
    return [headers, ...rows];
  }

  /**
   * Export data to Google Sheets
   * @param data Array of objects to export
   * @param spreadsheetId Google Spreadsheet ID
   * @param sheetName Sheet name (default: 'Sheet1')
   * @param headers Optional array of headers (default: extracted from data)
   */
  async exportData(data: any[], spreadsheetId: string, sheetName: string = 'Sheet1', headers: string[]): Promise<void> {
    try {
      // Format data for sheets (convert objects to 2D array with headers)
      const formattedData = this.formatData(data, headers);

      // Get range based on data dimensions
      const range = this.createRangeFromData(formattedData, headers);

      // Update the sheet
      // @ts-ignore
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!${range}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: formattedData },
      });

      console.log(`Successfully exported ${formattedData.length - 1} rows to ${sheetName}`);
    } catch (error) {
      console.error('Error exporting data to Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Export JSON file to Google Sheets
   * @param jsonData JSON data or path to JSON file
   * @param spreadsheetId Google Spreadsheet ID
   * @param sheetName Sheet name (default: 'Sheet1')
   * @param headers Optional array of headers (default: extracted from data)
   */
  async exportJson(jsonData: string | any[], spreadsheetId: string, sheetName: string = 'Sheet1', headers: string[]): Promise<void> {
    try {
      // Handle string input (file path or JSON string)
      let data: any[];

      if (typeof jsonData === 'string') {
        try {
          // Try to parse as JSON string first
          data = JSON.parse(jsonData);
        } catch {
          // If that fails, try to read as file path
          const fs = require('fs');
          const fileContent = fs.readFileSync(jsonData, 'utf8');
          data = JSON.parse(fileContent);
        }
      } else {
        // Already an object/array
        data = Array.isArray(jsonData) ? jsonData : [jsonData];
      }

      // Export the data
      await this.exportData(data, spreadsheetId, sheetName, headers);
    } catch (error) {
      console.error('Error exporting JSON to Google Sheets:', error);
      throw error;
    }
  }
}