// ================================================
// GOOGLE APPS SCRIPT FOR WEDABIME PRAMUKAYO
// Site Visitor Management System
// ================================================
// 
// SETUP INSTRUCTIONS:
// 1. Open your Google Sheet: 
//    https://docs.google.com/spreadsheets/d/1fbacGzpr6v894f0bsT8CA7dJGjAHF3r-fB5I19kKpTA/edit
// 2. Go to Extensions > Apps Script
// 3. Delete any existing code and paste this entire script
// 4. Click Deploy > New deployment
// 5. Select "Web app" as type
// 6. Set "Execute as" to your Google account
// 7. Set "Who has access" to "Anyone"
// 8. Click Deploy and authorize
// 9. Copy the Web app URL and add it to your Vercel environment
//    variables as GOOGLE_SHEETS_WEBHOOK_URL
// ================================================

const SPREADSHEET_ID = '1fbacGzpr6v894f0bsT8CA7dJGjAHF3r-fB5I19kKpTA';

// Column headers - match exactly with the sheet
const HEADERS = [
  'Customer ID',
  'Lead Received Date',
  'Day',
  'Customer Name',
  'Phone Number',
  'Phone Has WhatsApp',
  'Has WhatsApp Number',
  'WhatsApp Number',
  'District',
  'City',
  'Address',
  'Google Maps Link',
  'Latitude',
  'Longitude',
  'Drawings',
  'Images',
  'Videos',
  'Has Removals',
  'Removal Charge',
  'Has Additional Labour',
  'Additional Labour Charge',
  'Service Type',
  // Ceiling Details
  'Ceiling Type',
  'Ceiling Area 1 (L×W)',
  'Ceiling Area 2 (L×W)',
  'Ceiling Area 3 (L×W)',
  'Ceiling Area 4 (L×W)',
  'Ceiling Total Area',
  'Ceiling Per Sqft Price',
  'Ceiling Total Price',
  // Gutters Details
  'Gutters Measurements',
  'Gutters Total Feet',
  'Gutters Per Feet Price',
  'Gutters Total Price',
  // Roof Details
  'Roof Type',
  'Roof Work Type',
  'Roof Material Type',
  'Roof Sheet Type',
  'Roof Area',
  'Roof Total Price',
  // Quotation
  'Quotation Number',
  'Quotation PDF',
  'Total Amount',
  'Status',
  'Notes',
  'Created At',
  'Updated At'
];

function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Site Visits');
  
  if (!sheet) {
    sheet = ss.insertSheet('Site Visits');
    // Add headers
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    // Format header row
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#1e3a5f')
      .setFontColor('white')
      .setHorizontalAlignment('center');
    // Freeze header row
    sheet.setFrozenRows(1);
    // Set column widths
    sheet.setColumnWidths(1, HEADERS.length, 120);
  }
  
  return sheet;
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'Wedabime Pramukayo Site Visitor API is running'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getSheet();
    
    // Get day of week from date
    const date = new Date(data.leadReceivedDate);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[date.getDay()];
    
    // Parse service details
    const ceilingData = data.ceilingDetails ? (typeof data.ceilingDetails === 'string' ? JSON.parse(data.ceilingDetails) : data.ceilingDetails) : null;
    const guttersData = data.guttersDetails ? (typeof data.guttersDetails === 'string' ? JSON.parse(data.guttersDetails) : data.guttersDetails) : null;
    const roofData = data.roofDetails ? (typeof data.roofDetails === 'string' ? JSON.parse(data.roofDetails) : data.roofDetails) : null;
    
    // Format ceiling areas
    const ceilingAreas = ceilingData?.areas || [];
    const ceilingAreasFormatted = ceilingAreas.map((a: { length: number; width: number }) => `${a.length}'×${a.width}'`);
    
    // Format gutters measurements
    const guttersMeasurements = guttersData?.measurements || [];
    const guttersMeasurementsFormatted = guttersMeasurements.map((m: number) => `${m}'`).join(' + ');
    
    // Prepare row data
    const row = [
      data.customerId || '',
      data.leadReceivedDate || '',
      dayOfWeek,
      data.customerName || '',
      data.phoneNumber || '',
      data.phoneHasWhatsApp || 'No',
      data.hasWhatsAppNumber || '',
      data.whatsappNumber || '',
      data.district || '',
      data.city || '',
      data.address || '',
      data.googleMapsLink || '',
      data.latitude || '',
      data.longitude || '',
      data.drawings || '',
      data.images || '',
      data.videos || '',
      data.hasRemovals || 'No',
      data.removalCharge || 0,
      data.hasAdditionalLabour || 'No',
      data.additionalLabourCharge || 0,
      data.serviceType || '',
      // Ceiling Details
      ceilingData?.type || '',
      ceilingAreasFormatted[0] || '',
      ceilingAreasFormatted[1] || '',
      ceilingAreasFormatted[2] || '',
      ceilingAreasFormatted[3] || '',
      ceilingData?.total?.totalArea || 0,
      ceilingData?.total?.perSqftPrice || 0,
      ceilingData?.total?.totalPrice || 0,
      // Gutters Details
      guttersMeasurementsFormatted || '',
      guttersData?.totalFeet || 0,
      guttersData?.perFeetPrice || 0,
      guttersData?.totalPrice || 0,
      // Roof Details
      roofData?.roofType || '',
      roofData?.workType || '',
      roofData?.materialType || '',
      roofData?.sheetType || '',
      roofData?.area || 0,
      roofData?.totalPrice || 0,
      // Quotation
      data.quotationNumber || '',
      data.quotationPdf || '',
      data.totalAmount || 0,
      data.status || 'pending',
      data.notes || '',
      data.createdAt || new Date().toISOString(),
      data.updatedAt || new Date().toISOString()
    ];
    
    // Add row to sheet
    sheet.appendRow(row);
    
    // Apply formatting to new row
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, HEADERS.length)
      .setBackground(lastRow % 2 === 0 ? '#f3f4f6' : '#ffffff');
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data added successfully',
      row: lastRow
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Function to set up the sheet with proper formatting
function setupSheet() {
  const sheet = getSheet();
  Logger.log('Sheet setup complete: ' + sheet.getName());
}

// Function to test the webhook
function testWebhook() {
  const testData = {
    customerId: 'A-001a01',
    leadReceivedDate: '2025-01-15',
    customerName: 'Test Customer',
    phoneNumber: '0771234567',
    phoneHasWhatsApp: 'Yes',
    hasWhatsAppNumber: '',
    whatsappNumber: '',
    district: 'Colombo',
    city: 'Colombo 05',
    address: '123 Test Street',
    googleMapsLink: 'https://maps.google.com/test',
    latitude: 6.9271,
    longitude: 79.8612,
    drawings: '',
    images: '',
    videos: '',
    hasRemovals: 'No',
    removalCharge: 0,
    hasAdditionalLabour: 'No',
    additionalLabourCharge: 0,
    serviceType: 'ceiling',
    ceilingDetails: JSON.stringify({
      type: 'PVC',
      areas: [
        { length: 10, width: 12 },
        { length: 8, width: 10 }
      ],
      total: {
        totalArea: 200,
        perSqftPrice: 150,
        totalPrice: 30000
      }
    }),
    guttersDetails: null,
    roofDetails: null,
    quotationNumber: 'Q-2025-001',
    quotationPdf: '',
    totalAmount: 30000,
    status: 'pending',
    notes: 'Test entry',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(e);
  Logger.log(result.getContent());
}
