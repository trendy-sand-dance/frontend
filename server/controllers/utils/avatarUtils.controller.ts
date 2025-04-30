import { uploadFile, deleteFile, updateFilename } from './fileUtils.controller';

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
async function getNewAvatar(username: string, file: any) {
	try {
		// get file extension + upload new avatar + get upload directory
		const extension = file.filename.split('.').pop();
		const imageDir = 'public/images/avatars';
		const uploadDir = await uploadFile(file, imageDir);
		
		// get file paths
		const userAvatar = (username + "_avatar") as string;
		const rand = (Math.random() * 10).toString(10).substr(0, 5);
		const filename = (username + "_avatar_E" + rand + "." + extension) as string;

		// delete existing avatar
		const delim = '_E'
		await deleteFile(uploadDir, userAvatar, delim);
		
		// update new avatar filename
		await updateFilename(file, uploadDir, filename);

		return filename as string;
	} catch(error: any) {
		throw { code: error.code, message: error.message };
	}

};

export default getNewAvatar;