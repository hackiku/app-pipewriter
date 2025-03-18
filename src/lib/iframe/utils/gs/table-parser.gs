
function analyzeTableData() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const tables = body.getTables();
  
  let result = {
    totalTables: tables.length,
    tables: {}
  };

  tables.forEach((table, index) => {
    try {
      const tableId = 'table_' + index;
      const numRows = table.getNumRows();
      const numCols = table.getRow(0).getNumCells();
      
      let tableData = {
        dimensions: {
          rows: numRows,
          columns: numCols,
        },
        columns: [], // Will hold column-based analysis
        pattern: detectPattern(table)
      };

      // Analyze each column
      for (let colIndex = 0; colIndex < numCols; colIndex++) {
        let columnData = {
          index: colIndex,
          content: [],
          analysis: {
            hasHeadings: false,
            headingTypes: [],
            isEmpty: true,
            containsImage: false
          }
        };

        // Get all cells in this column
        for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
          const cell = table.getRow(rowIndex).getCell(colIndex);
          let cellData = analyzeCellContent(cell);
          
          columnData.content.push(cellData);
          
          // Update column analysis
          if (cellData.text.length > 0) columnData.analysis.isEmpty = false;
          if (cellData.style.startsWith('h')) {
            columnData.analysis.hasHeadings = true;
            columnData.analysis.headingTypes.push(cellData.style);
          }
          if (cellData.text.toLowerCase().includes('image') || 
              cellData.text.toLowerCase().includes('img')) {
            columnData.analysis.containsImage = true;
          }
        }

        tableData.columns.push(columnData);
      }

      result.tables[tableId] = tableData;
      
    } catch (e) {
      Logger.log('Error analyzing table ' + index + ': ' + e);
    }
  });
  
  Logger.log('DETAILED TABLE ANALYSIS:');
  Logger.log(JSON.stringify(result, null, 2));
  
  return result;
}

function analyzeCellContent(cell) {
  let cellData = {
    text: cell.getText().trim(),
    style: 'normal',
    attributes: {}
  };
  
  try {
    const para = cell.getChild(0).asParagraph();
    const heading = para.getHeading();
    
    // Map heading types
    const headingMap = {
      [DocumentApp.ParagraphHeading.HEADING1]: 'h1',
      [DocumentApp.ParagraphHeading.HEADING2]: 'h2',
      [DocumentApp.ParagraphHeading.HEADING3]: 'h3',
      [DocumentApp.ParagraphHeading.HEADING4]: 'h4',
      [DocumentApp.ParagraphHeading.HEADING5]: 'h5',
      [DocumentApp.ParagraphHeading.HEADING6]: 'h6'
    };
    
    cellData.style = headingMap[heading] || 'normal';
    
    // Get additional formatting
    const attrs = cell.getAttributes();
    if (attrs) {
      cellData.attributes = {
        backgroundColor: attrs[DocumentApp.Attribute.BACKGROUND_COLOR],
        verticalAlignment: attrs[DocumentApp.Attribute.VERTICAL_ALIGNMENT],
        bold: para.isBold(),
        italic: para.isItalic()
      };
    }
  } catch (e) {
    Logger.log('Error getting cell formatting: ' + e);
  }
  
  return cellData;
}

function detectPattern(table) {
  const numRows = table.getNumRows();
  const numCols = table.getRow(0).getNumCells();
  
  // Common patterns
  const patterns = {
    heading: false,
    imageColumn: false,
    contentRows: 0,
    layout: ''
  };
  
  // Check first row for headings
  const firstRow = table.getRow(0);
  for (let i = 0; i < numCols; i++) {
    try {
      const cell = firstRow.getCell(i);
      const para = cell.getChild(0).asParagraph();
      if (para.getHeading() !== DocumentApp.ParagraphHeading.NORMAL) {
        patterns.heading = true;
        break;
      }
    } catch(e) {}
  }
  
  // Detect common layouts
  if (numCols === 3) patterns.layout = 'three-column';
  if (numRows === 1) patterns.layout = 'single-row';
  if (numCols === 1) patterns.layout = 'single-column';
  if (numRows === 3 && numCols === 3) patterns.layout = 'grid-3x3';
  
  return patterns;
}

// Test function
function testAnalysis() {
  analyzeTableData();
}