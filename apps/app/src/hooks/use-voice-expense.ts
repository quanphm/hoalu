import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { apiClient } from "#app/lib/api-client.ts";
import { RepeatSchema } from "@hoalu/common/schema";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

// Browser SpeechRecognition type declarations
interface SpeechRecognitionEvent extends Event {
	results: SpeechRecognitionResultList;
	resultIndex: number;
}

interface SpeechRecognitionResultList {
	length: number;
	item(index: number): SpeechRecognitionResult;
	[index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
	isFinal: boolean;
	length: number;
	item(index: number): SpeechRecognitionAlternative;
	[index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
	transcript: string;
	confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
	error: string;
	message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	start(): void;
	stop(): void;
	abort(): void;
	onresult: ((event: SpeechRecognitionEvent) => void) | null;
	onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
	onend: (() => void) | null;
	onstart: (() => void) | null;
}

declare global {
	interface Window {
		SpeechRecognition?: new () => SpeechRecognitionInstance;
		webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
	}
}

export interface VoiceExpenseData {
	title: string;
	amount: number;
	currency: string;
	date: string;
	suggestedCategoryId: string | null;
	repeat: RepeatSchema;
	confidence: number;
}

export type VoiceLanguage = "en-US" | "vi-VN";

export const VOICE_LANGUAGES: { value: VoiceLanguage; label: string }[] = [
	{ value: "en-US", label: "English" },
	{ value: "vi-VN", label: "Tiếng Việt" },
];

export function useVoiceRecorder(lang: VoiceLanguage = "en-US") {
	const [isListening, setIsListening] = useState(false);
	const [transcript, setTranscript] = useState("");
	const [interimTranscript, setInterimTranscript] = useState("");
	const [error, setError] = useState<string | null>(null);
	const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

	const isSupported =
		typeof window !== "undefined" &&
		(typeof window.SpeechRecognition !== "undefined" ||
			typeof window.webkitSpeechRecognition !== "undefined");

	const start = useCallback(() => {
		if (!isSupported) {
			setError("Speech recognition is not supported in this browser.");
			return;
		}

		setError(null);
		setTranscript("");
		setInterimTranscript("");

		const SpeechRecognitionClass = window.SpeechRecognition ?? window.webkitSpeechRecognition;
		const recognition = new SpeechRecognitionClass!();
		recognition.continuous = false;
		recognition.interimResults = true;
		recognition.lang = lang;

		recognition.onstart = () => {
			setIsListening(true);
		};

		recognition.onresult = (event: SpeechRecognitionEvent) => {
			let interim = "";
			let final = "";

			for (let i = event.resultIndex; i < event.results.length; i++) {
				const result = event.results[i];
				if (result && result[0]) {
					if (result.isFinal) {
						final += result[0].transcript;
					} else {
						interim += result[0].transcript;
					}
				}
			}

			if (final) {
				setTranscript((prev) => (prev + " " + final).trim());
				setInterimTranscript("");
			} else {
				setInterimTranscript(interim);
			}
		};

		recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
			if (event.error !== "aborted") {
				setError(`Speech recognition error: ${event.error}`);
			}
			setIsListening(false);
		};

		recognition.onend = () => {
			setIsListening(false);
			setInterimTranscript("");
		};

		recognitionRef.current = recognition;
		recognition.start();
	}, [isSupported, lang]);

	const stop = useCallback(() => {
		recognitionRef.current?.stop();
		recognitionRef.current = null;
		setIsListening(false);
		setInterimTranscript("");
	}, []);

	const reset = useCallback(() => {
		recognitionRef.current?.abort();
		recognitionRef.current = null;
		setIsListening(false);
		setTranscript("");
		setInterimTranscript("");
		setError(null);
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			recognitionRef.current?.abort();
		};
	}, []);

	return {
		isListening,
		transcript,
		interimTranscript,
		error,
		isSupported,
		start,
		stop,
		reset,
	};
}

export function useParseVoiceExpense() {
	const workspace = useWorkspace();

	return useMutation({
		mutationFn: async ({ transcription, lang }: { transcription: string; lang: VoiceLanguage }) => {
			const result = await apiClient.files.parseVoice(workspace.slug, transcription, lang);
			return result as VoiceExpenseData | null;
		},
	});
}
