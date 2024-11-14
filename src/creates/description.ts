import { Bundle, ZObject } from "zapier-platform-core";
import { Resource } from "../constants/constants";
import { performOperation } from "../helper/apiHelper";
import { createFileField, createModeField, createModelField, createOperationField, createUrlField } from "./utils";

const perform = async (z: ZObject, bundle: Bundle) => {
	try {
		return await performOperation(z, bundle);
	} catch (error: any) {
		z.console.log(`[PERFORM] - ${error.message}`);
	}
};

const performResume = async (z: ZObject, bundle: Bundle) => {
	z.console.log(`[Inside Resume] - ${JSON.stringify(bundle.cleanedRequest)}`);
	return { ...bundle.cleanedRequest };
};

export const DocumentAi = {
	key: Resource.DOCUMENT_AI,
	noun: "Doc AI",
	display: {
		label: "Doc AI",
		description: "Uploads a document and parses it.",
	},
	operation: {
		inputFields: [
			createFileField("File", "The document to upload."),
			createOperationField(
				{
					resumeParser: "Resume Parser",
					presentationParser: "Presentation Parser",
					invoiceParser: "Invoice Parser",
					formFilling: "AI Assisted Form Filling",
				},
				"resumeParser",
				"The operation to perform."
			),
			createModelField(),
		],
		perform,
		performResume,
		sample: {
			operation: "resumeParser",
			file: "SAMPLE FILE",
			model: "vlm-1",
		},
	},
};

export const ImageAi = {
	key: Resource.IMAGE_AI,
	noun: "Image AI",
	display: {
		label: "Image AI",
		description: "Uploads an image and parses it.",
	},
	operation: {
		inputFields: [
			createFileField("Image", "The image to upload."),
			createOperationField(
				{
					imageCaptioning: "Image Captioning",
				},
				"imageCaptioning",
				"The operation to perform."
			),
			createModelField(),
		],
		perform,
		performResume,
		sample: {
			file: "SAMPLE FILE",
			operation: "imageCaptioning",
			model: "vlm-1",
		},
	},
};

export const AudioAi = {
	key: Resource.AUDIO_AI,
	noun: "Audio AI",
	display: {
		label: "Audio AI",
		description: "Uploads an Audio and transcribe it.",
	},
	operation: {
		inputFields: [
			createFileField("File", "Audio file to upload."),
			createOperationField(
				{
					audioTranscription: "Audio Transcription",
				},
				"audioTranscription",
				"The operation to perform."
			),
			createModelField(),
		],
		perform,
		performResume,
		sample: {
			file: "SAMPLE FILE",
			operation: "audioTranscription",
			model: "vlm-1",
		},
	},
};

export const AgentAi = {
	key: Resource.AGENT_AI,
	noun: "Agent AI",
	display: {
		label: "Agent AI",
		description: "URL to scrape and parse.",
	},
	operation: {
		inputFields: [
			createUrlField(),
			createOperationField(
				{
					githubAgent: "Github",
					linkedinAgent: "Linkedin",
					marketResearchAgent: "Market Research",
				},
				"githubAgent",
				"The agent to use."
			),
			createModelField(),
			createModeField(),
		],
		perform,
		performResume,
		sample: {
			operation: "githubAgent",
			url: "https://github.com/zapier/zapier-platform-core",
			model: "vlm-1",
			mode: "accurate",
		},
	},
};

export const ExperimentalAi = {
	key: Resource.EXPERIMENTAL,
	noun: "Experimental",
	display: {
		label: "Experiemental",
		description: "Document and Image Embedding",
	},
	operation: {
		inputFields: [
			createFileField("File", "Processing Embeddings from Image/Document Files"),
			createOperationField(
				{
					imageEmbedding: "Image Embeddings",
					documentEmbedding: "Document Embeddings",
				},
				"imageEmbedding",
				"The agent to use."
			),
			createModelField({ choices: { 'vlm-1-embeddings': 'VLM-1 Embeddings' }, defaultChoice: 'vlm-1-embeddings' }),
		],
		perform,
		performResume,
		sample: {
			operation: "imageEmbedding",
			file: "SAMPLE FILE",
			model: "vlm-1",
		},
	},
}

export const FileOperation = {
	key: Resource.FILE,
	noun: "File",
	display: {
		label: "File",
		description: "File Operations",
	},
	operation: {
		inputFields: [
			createOperationField(
				{
					fileList: "List",
					fileUpload: "Upload",
				},
				"fileList",
				"The operation to perform.",
				true
			),
			(z: ZObject, bundle: Bundle) => {
				if (bundle.inputData.operation === 'fileUpload') {
					return [createFileField("File", "File data from previous node.")];
				}
				return [];
			},
		],
		perform,
		sample: {
			operation: "fileList"
		},
	}
}