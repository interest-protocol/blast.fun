import Resizer from 'react-image-file-resizer';

const STORAGE_KEY = 'pnl-backgrounds';
const MAX_FILE_SIZE = 1024 * 1024;

export interface BackgroundImage {
	id: string;
	dataUrl: string;
	uploadedAt: number;
}

export const resizeImage = async (file: File): Promise<string> => {
	if (file.size > MAX_FILE_SIZE) {
		throw new Error('Image must be less than 1MB');
	}

	const resizedImage = await new Promise<string>((resolve) => {
		Resizer.imageFileResizer(
			file,
			800,
			400,
			'JPEG',
			85,
			0,
			(uri) => resolve(uri.toString()),
			'base64',
			800,
			400
		);
	});

	return resizedImage;
};

export const saveBackgroundToStorage = (dataUrl: string): BackgroundImage => {
	const backgrounds = getBackgroundsFromStorage();
	const newBackground: BackgroundImage = {
		id: Date.now().toString(),
		dataUrl,
		uploadedAt: Date.now(),
	};

	backgrounds.push(newBackground);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(backgrounds));

	return newBackground;
};

export const getBackgroundsFromStorage = (): BackgroundImage[] => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
};

export const deleteBackgroundFromStorage = (id: string): void => {
	const backgrounds = getBackgroundsFromStorage().filter(bg => bg.id !== id);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(backgrounds));
};

export const DEFAULT_BACKGROUNDS = [
	'/assets/pnl-card-default.png',
];