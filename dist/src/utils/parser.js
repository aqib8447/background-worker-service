import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
function isValidSectionTitle(title) {
    const clean = title.trim();
    if (!clean)
        return false;
    if (clean.length < 4)
        return false;
    if (/[0-9]/.test(clean))
        return false;
    if (/^(column|row)\b/i.test(clean))
        return false;
    return true;
}
function looksLikeHeading(line) {
    if (line.length > 80)
        return false;
    const upperRatio = line.replace(/[^A-Z]/g, "").length /
        line.replace(/[^A-Za-z]/g, "").length || 0;
    return upperRatio > 0.7 && isValidSectionTitle(line);
}
function splitIntoSections(rawText) {
    const sections = [];
    let title = "Introduction";
    let content = [];
    const lines = rawText.split("\n").map(l => l.trim());
    for (const line of lines) {
        if (looksLikeHeading(line)) {
            if (content.length > 0) {
                sections.push({ title, content: content.join(" ") });
                content = [];
            }
            title = line;
        }
        else {
            content.push(line);
        }
    }
    if (content.length > 0) {
        sections.push({ title, content: content.join(" ") });
    }
    return sections;
}
export async function parsePDFBuffer(fileBuffer) {
    try {
        // Create parser with buffer
        const parser = new PDFParse({ data: fileBuffer });
        // Get the text content
        const result = await parser.getText();
        return result.text?.trim() || "";
    }
    catch (err) {
        console.error("Error parsing PDF:", err);
        throw new Error("Failed to parse PDF");
    }
}
export async function extractTextFromFile(fileBuffer, filename) {
    const extension = filename?.split(".")[filename?.split(".").length - 1];
    console.log(extension);
    let rawText = "";
    if (extension === "pdf") {
        const text = await parsePDFBuffer(fileBuffer);
        if (!text)
            return [];
        rawText = text;
    }
    else if (extension === "docx") {
        const data = await mammoth.extractRawText({ buffer: fileBuffer });
        rawText = data.value;
    }
    else if (extension === "txt") {
        const data = fileBuffer.toString("utf-8");
        rawText = data;
    }
    else {
        throw new Error("Unsupported file type");
    }
    return splitIntoSections(rawText);
}
export function generateKeywords(content) {
    return content.split(" ").filter(word => word.length > 0);
}
