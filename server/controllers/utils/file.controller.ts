import fsSync from 'fs';
import { promises as fs } from 'fs';
import path  from 'path';

/**
 * @brief   - receives upload file from editAvatar endpoint
 * 			- ensures the upload directory exists
 * 			- uploads the new image file
 * 			- gets the correct file paths, user specific,
 * 			including unique addition for this new upload
 * 			- deletes any existing image if user already has one
 * 			- renames new image upload with <username>_avatar
 * 			 + unique addition + extension
 *
 * 			- ultimitly replacing the old avatar with the new 
 * 			or adding new one if user doesn't have their own uploaded one
 * 			- ensures each user only has one avatar image with uniform
 * 			file name
 * 
 * @returns	newly uploaded file name to update the database with
 * 
 */
 
async function uploadAvatar(username: string, file: any) {

		// get file extension
		const extension = file.filename.split('.').pop();
		
		// get upload directory
		const buffer = await file.toBuffer();
		const wrkdir = process.cwd();
		const uploadDir = path.join(wrkdir, 'public/images');

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
		
		// get file paths
		const userAvatar = (username + "_avatar") as string;
		const rand = (Math.random() * 10).toString(10).substr(0, 5);
		const filename = (username + "_avatar_E" + rand + "." + extension) as string;

		// delete existing avatar
		const files = fsSync.readdirSync(uploadDir);
		files.forEach(f => {
			if (f.split('_E')[0] == userAvatar)
			{
				// find existing with username_avatar name
				const deleteMe = path.join(uploadDir, f);
				fsSync.unlinkSync(deleteMe); // delete file
			}
		});
		
		// upload new avatar filename
		const oldPath = filePath;
		const newPath = path.join(uploadDir, filename);
		await fs.rename(oldPath, newPath);

		return filename as string;

};

export default uploadAvatar;