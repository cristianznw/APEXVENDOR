import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFParser from "pdf2json";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
});

/**
 * Extrae el texto legible de un archivo PDF a partir de un buffer de datos.
 * Utiliza PDFParser para procesar el contenido de todas las páginas.
 * 
 * @param buffer - El buffer que contiene los datos binarios del archivo PDF.
 * @returns Una promesa que resuelve con el texto extraído del PDF.
 */
export async function getPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      console.error("Error en PDFParser:", errData.parserError);
      resolve(""); // Resolvemos vacío para no romper el flujo
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      // Extraemos el texto de todas las páginas y lo limpiamos de codificación URL
      const text = pdfParser.getRawTextContent();
      resolve(text || "");
    });

    // Cargamos el buffer en el parser
    pdfParser.parseBuffer(buffer);
  });
}

/**
 * Envía una consulta al modelo de IA Gemini manteniendo el contexto de la conversación.
 * 
 * @param prompt - El mensaje o pregunta que se desea enviar a la IA.
 * @param history - El historial de la conversación previa para mantener el contexto.
 * @returns La respuesta generada por el modelo de IA o un mensaje de error amigable.
 */
export async function askGemini(prompt: string, history: any[]) {
  try {
    // Filtramos el historial para asegurarnos de que los roles sean correctos
    const formattedHistory = history.map((msg) => ({
      role: msg.role === "ai" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error en Gemini:", error);
    return "Lo siento, hubo un error al procesar tu solicitud.";
  }
}
