import Resizer from 'react-image-file-resizer';

export const getBase64ForMetadata = async (file: File): Promise<string> => {
    // First attempt with standard compression
    let stringImage = await new Promise<string>((resolve) => {
        Resizer.imageFileResizer(
            file,
            200,  // Smaller size for metadata
            200,
            'JPEG',
            70,   // Lower quality for smaller size
            0,
            (uri) => resolve(uri.toString()),
            'base64'
        );
    });

    // If still too large, try more aggressive compression
    if (stringImage.length >= 60_000) {
        stringImage = await new Promise<string>((resolve) => {
            Resizer.imageFileResizer(
                file,
                150,  // Even smaller
                150,
                'JPEG',
                50,   // Much lower quality
                0,
                (uri) => resolve(uri.toString()),
                'base64'
            );
        });
    }

    // Final check
    if (stringImage.length >= 70_000) {
        throw new Error('Image is too large. Please use a simpler image or reduce its complexity.');
    }

    return stringImage;
};