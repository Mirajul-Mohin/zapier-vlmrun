import { MODEL_CHOICES, MODE_CHOICES } from "../constants/constants";

export const createModelField = (
    options: {
        choices?: Record<string, string>;
        defaultChoice?: string;
        helpText?: string;
    } = {}
) => ({
    key: "model",
    required: true,
    type: "string",
    label: "Model",
    choices: options.choices || MODEL_CHOICES,
    default: options.defaultChoice || "vlm-1",
    helpText: options.helpText || "The model to use.",
});

export const createModeField = ({
    choices = MODE_CHOICES,
    defaultChoice = "accurate",
    helpText = "Fast is faster but less accurate. Accurate is slower but more accurate.",
} = {}) => ({
    key: "mode",
    required: true,
    type: "string",
    label: "Mode",
    choices,
    default: defaultChoice,
    helpText,
});

export const createOperationField = (
    choices: any,
    defaultChoice: string,
    helpText: string,
    altersDynamicFields: boolean = false
) => ({
    key: "operation",
    required: true,
    type: "string",
    label: "Operation",
    choices,
    default: defaultChoice,
    helpText,
    altersDynamicFields
});

export const createFileField = (label: string, helpText: string) => ({
    key: "file",
    required: true,
    type: "file",
    label,
    helpText,
});


export const createUrlField = (label: string = 'URL', helpText: string = 'URL to scrape and parse') => ({
    key: "url",
    required: true,
    type: "string",
    label,
    helpText,
});
