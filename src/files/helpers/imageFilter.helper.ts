const validExtensions = ['gif', 'jpg', 'jpeg', 'png', 'webp'];



export const imageFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    if(!file) return callback( new Error('File is empty'), false);

    const fileExtension = file.mimetype.split('/')[1];

    if(validExtensions.includes(fileExtension)){
        return callback(null, true);
    }

    callback(null, false);
}