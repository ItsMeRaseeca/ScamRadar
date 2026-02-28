import { createWorker } from 'tesseract.js';

/**
 * Extracts text from an image file using Tesseract.js (Client-side)
 * @param file The image file to recognize
 * @param onProgress Callback for extraction progress (0-100)
 * @returns Extracted text string
 */
export async function extractTextFromImage(
    file: File,
    onProgress?: (progress: number) => void
): Promise<string> {
    const worker = await createWorker('eng', 1, {
        logger: (m) => {
            if (m.status === 'recognizing text' && onProgress) {
                onProgress(Math.floor(m.progress * 100));
            }
        },
    });

    try {
        const { data: { text } } = await worker.recognize(file);
        return text.trim();
    } catch (error) {
        console.error('Tesseract.js OCR Error:', error);
        throw new Error('Failed to extract text from image. Please try another image or paste manually.');
    } finally {
        await worker.terminate();
    }
}
