import XLSX from 'xlsx';

try {
    const workbook = XLSX.readFile('C:\\Users\\NAGA HARSHITH\\OneDrive\\Desktop\\Asia_By_Gram\\final menu_065531.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    // Print rows 60 to 100
    console.log(JSON.stringify(data.slice(60, 100), null, 2));
} catch (error) {
    console.error("Error reading file:", error);
}
