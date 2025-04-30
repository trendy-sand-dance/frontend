import fsSync from 'fs';
import { promises as fs } from 'fs';
import path  from 'path';

// upload new image
export async function uploadFile(file: any, dirPath: string) {
	try {
		// get upload directory
		const buffer = await file.toBuffer();
		const wrkdir = process.cwd();
		const uploadDir = path.join(wrkdir, dirPath);

		// ensure uploads directory exists
		if (!fsSync.existsSync(uploadDir)) {
			fsSync.mkdirSync(uploadDir, { recursive: true });
		}

		// upload
		const filePath = path.join(uploadDir, file.filename);
		if (!fsSync.existsSync(filePath)) {
			fsSync.writeFile(filePath, buffer, (err) => {
				if (err) {
					throw { code: 500, message: "Erroring uploading file" };
				}});
			}
		return uploadDir as string;
	} catch(err: any) {
		if (err.code === 'FST_REQ_FILE_TOO_LARGE') {
			throw { code: 413, message: "File too large" };
		}
		throw { code: err.code || 500, message: err.message || "Internal server error" };
	}
};

// delete image
export async function deleteFile(uploadDir: string, filename: string, delim: string) {
	const files = fsSync.readdirSync(uploadDir);
	files.forEach(f => {
		if (f.split(delim)[0] == filename)
			{
				const deleteMe = path.join(uploadDir, f);
				fsSync.unlinkSync(deleteMe);
			}
		});
};

// rename image
export async function updateFilename(file: any, uploadDir: string, newFilename: string) {
	
	const oldPath = path.join(uploadDir, file.filename);
	const newPath = path.join(uploadDir, newFilename);
	await fs.rename(oldPath, newPath);
};
