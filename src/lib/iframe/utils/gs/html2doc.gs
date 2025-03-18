// ========================= html2doc =======================================

function XXXXhtml2doc(params) {
  var body = DocumentApp.getActiveDocument().getBody();
  var textAll = body.getText();
  var lines = textAll.split("\n");
  var newParagraphs = [];

  // Loop through each line in the text
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();

    // Check if the line starts with an HTML tag
    if (line.startsWith("<")) {
      var tagName = line.substring(1, line.indexOf(">")).toLowerCase();
      var tagText = line.substring(line.indexOf(">") + 1, line.lastIndexOf("<")).trim();

      var paragraphInfo = null;
      switch (tagName) {
        case "h2":
          paragraphInfo = {
            text: tagText,
            heading: DocumentApp.ParagraphHeading.HEADING2,
            addSpace: true
          };
          break;
        case "h3":
          paragraphInfo = {
            text: tagText,
            heading: DocumentApp.ParagraphHeading.HEADING3,
            addSpace: true
          };
          break;
        case "button":
          paragraphInfo = {
            text: tagText,
            heading: DocumentApp.ParagraphHeading.HEADING4,
            addSpace: false
          };
          break;
        case "h5":
          paragraphInfo = {
            text: tagText,
            heading: DocumentApp.ParagraphHeading.HEADING5,
            addSpace: false
          };
          break;
        case "p":
          paragraphInfo = {
            text: tagText,
            heading: DocumentApp.ParagraphHeading.HEADING6,
            addSpace: false
          };
          break;
      }

      if (paragraphInfo) {
        if (paragraphInfo.addSpace) {
          newParagraphs.push({
            text: "",
            heading: DocumentApp.ParagraphHeading.NORMAL
          });
        }
        newParagraphs.push(paragraphInfo);
      }
    }
  }

  // Determine insertion position - default to end if not specified
  var insertPosition = params && params.position === 'start' ? 0 : body.getNumChildren();

  // Insert paragraphs
  for (var j = 0; j < newParagraphs.length; j++) {
    var index = params && params.position === 'start' ? j : insertPosition + j;
    body.insertParagraph(index, newParagraphs[j].text)
        .setHeading(newParagraphs[j].heading);
  }

  return { success: true };
}