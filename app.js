pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';


const pdfInput = document.getElementById('pdfInput');
const startReading = document.getElementById('startReading');
const pauseReading = document.getElementById('pauseReading');
const resumeReading = document.getElementById('resumeReading');
const continueFromCurrentPage = document.getElementById('continueFromCurrentPage');

let pdfTextContent = '';
let currentSpeechIndex = 0;
let synthesis = window.speechSynthesis;

let pdfViewer = new pdfjsViewer.PDFViewer({
    container: document.getElementById('pdfViewerContainer'),
});

pdfInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    pdfTextContent = await readPdfFile(file);
    loadPdfToViewer(file);
});

startReading.addEventListener('click', () => {
    startTextToSpeech(pdfTextContent, currentSpeechIndex);
});

pauseReading.addEventListener('click', () => {
    synthesis.pause();
});

resumeReading.addEventListener('click', () => {
    synthesis.resume();
});

continueFromCurrentPage.addEventListener('click', async () => {
    const currentPage = pdfViewer.currentPageNumber;
    const text = await readPdfFileFromPage(pdfInput.files[0], currentPage);
    startTextToSpeech(text, 0);
});

async function readPdfFile(file) {
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
    let textContent = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        textContent += content.items.map(item => item.str).join(' ');
    }
    return textContent;
}

async function readPdfFileFromPage(file, startPage) {
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
    let textContent = '';
    for (let i = startPage; i <= pdf.numPages; i++) {
        const page =await pdf.getPage(i);
        const content = await page.getTextContent();
        textContent += content.items.map(item => item.str).join(' ');
        }
        return textContent;
        }
        
        function startTextToSpeech(text, startIndex) {
        synthesis.cancel();
        let utterances = createUtterances(text, startIndex);
        utterances.forEach((utterance, index) => {
        utterance.onend = () => {
        currentSpeechIndex = index + 1;
        };
        synthesis.speak(utterance);
        });
        }
        
        function createUtterances(text, startIndex) {
        let sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        let utterances = [];
        for (let i = startIndex; i < sentences.length; i++) {
        let sentence = sentences[i].trim();
        let utterance = new SpeechSynthesisUtterance(sentence);
        utterance.lang = detectLanguage(sentence);
        utterances.push(utterance);
        }
        return utterances;
        }
        
        function detectLanguage(text) {
        const turkishLetters = 'şŞıİğĞüÜöÖçÇ';
        const englishLetters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let turkishCount = 0;
        let englishCount = 0;
        for (let i = 0; i < text.length; i++) {
            if (turkishLetters.includes(text[i])) {
                turkishCount++;
            } else if (englishLetters.includes(text[i])) {
                englishCount++;
            }
        }
        
        return turkishCount > englishCount ? 'tr-TR' : 'en-US';
    }
    async function loadPdfToViewer(file) {
        const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
        pdfViewer.setDocument(pdf);
        }