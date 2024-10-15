export const MAX_ATTEMPTS = 30;
export const RETRY_DELAY = 4000;

export const Resource = {
  DOCUMENT_AI: "documentAi",
  AUDIO_AI: "audioAi",
  IMAGE_AI: "imageAi",
  AGENT_AI: "agentAi",
  FILE: "file",
  EXPERIMENTAL: "experimental",
  HTTP: "http",
};

export const Operation = {
  RESUME_PARSER: "resumeParser",
  INVOICE_PARSER: "invoiceParser",
  PRESENTATION_PARSER: "presentationParser",
  FORM_FILLING: "formFilling",
  IMAGE_CATALOGING: "imageCataloging",
  IMAGE_CAPTIONING: "imageCaptioning",
  FILE_LIST: "fileList",
  FILE_UPLOAD: "fileUpload",
  GITHUB_AGENT: "githubAgent",
  LINKEDIN_AGENT: "linkedinAgent",
  MARKET_RESEARCH_AGENT: "marketResearchAgent",
  WEB_GENERATION: "webGeneration",
  AUDIO_TRANSCRIPTION: "audioTranscription",
  IMAGE_EMBEDDING: "imageEmbedding",
  DOCUMENT_EMBEDDING: "documentEmbedding",
  GET: "GET",
  POST: "POST",
};

export enum Domain {
  // Public schemas
  DocumentGenerative = "document.generative",
  DocumentPresentation = "document.presentation",
  DocumentVisualGrounding = "document.visual-grounding",

  // Document extraction
  DocumentInvoice = "document.invoice",
  DocumentResume = "document.resume",
  DocumentHealthInsuranceCard = "document.health-insurance-card",
  DocumentDriversLicense = "document.drivers-license",
  DocumentReceipt = "document.receipt",

  // Document schema extraction
  DocumentSchemaCreation = "document.schema-creation",

  // Document with paragraphs, tables, charts, etc.
  DocumentPdf = "document.pdf",
  DocumentFile = "document.file",
  DocumentPdfAutofill = "document.pdf-autofill",
  DocumentHardwareSpecSheet = "document.hardware-spec-sheet",

  // Audio
  AudioTranscription = "audio.transcription",

  // Image
  ImageEmbeddings = "image.embeddings",
  ImageCaptioning = "image.caption",
  // Video
  VideoTranscription = "video.transcription",
  VideoEmbeddings = "video.embeddings",
  VideoGenerativeEmbeddings = "video.generative-embeddings",

  // Experimental / sports
  SportsNfl = "sports.nfl",
  SportsNba = "sports.nba",
  SportsSoccer = "sports.soccer",

  // Experimental / TV
  VideoTvNews = "video.tv-news",
  VideoTvIntelligence = "video.tv-intelligence",

  // Experimental / web + social
  WebEcommerceProductCatalog = "web.ecommerce-product-catalog",
  WebGithubDeveloperStats = "web.github-developer-stats",
  WebMarketResearch = "web.market-research",
  SocialTwitterCard = "social.twitter-card",

  // Experimental / multi-modal RAG
  DocumentMultimodalEmbeddings = "document.multimodal-embeddings",
  DocumentMultimodalRag = "document.multimodal-rag",
}

//create operation to domain mapping
export const OperationToDomain = {
  [Operation.RESUME_PARSER]: Domain.DocumentResume,
  [Operation.INVOICE_PARSER]: Domain.DocumentInvoice,
  [Operation.PRESENTATION_PARSER]: Domain.DocumentPresentation,
  [Operation.FORM_FILLING]: Domain.DocumentPdfAutofill,
  [Operation.IMAGE_CAPTIONING]: Domain.DocumentGenerative,
  // [Operation.IMAGE_CAPTIONING]: Domain.ImageCaptioning,
  [Operation.GITHUB_AGENT]: Domain.WebGithubDeveloperStats,
  [Operation.MARKET_RESEARCH_AGENT]: Domain.WebMarketResearch,
};

// Configuration for Model Choices
export const MODEL_CHOICES = {
  "vlm-1": "VLM-1",
  // "gpt-3.5": "GPT-3.5",
  // "gpt-4": "GPT-4",
  // Add more models as needed
};

// Configuration for Mode Choices
export const MODE_CHOICES = {
  fast: "Fast",
  accurate: "Accurate",
  // balanced: "Balanced",
  // Add more modes as needed
};
