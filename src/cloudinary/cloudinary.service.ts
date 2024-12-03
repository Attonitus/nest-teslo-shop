import { Injectable } from '@nestjs/common';
import {v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse} from 'cloudinary';
import {Readable} from 'node:stream';

@Injectable()
export class CloudinaryService {


    constructor(
    ){
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.CLOUD_API_KEY,
            api_secret: process.env.CLOUD_API_SECRET
        })
    }

    uploadFileCloudinary(file: Express.Multer.File) : 
    Promise<UploadApiResponse | UploadApiErrorResponse> {

        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                
            })
            const upload = cloudinary.uploader.upload_stream({folder: `${process.env.CLOUD_FOLDER}`}, 
                (error, result) => {
                if(error) return reject(error);
                resolve(result);
            });
            const str = Readable.from(file.buffer).pipe(upload);
            return str;
        });
    }

    async deleteFileCloudinary(imgId: string): Promise<UploadApiResponse | UploadApiErrorResponse>{

        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(imgId, (error, result) => {
                if(error) return reject(error);
                resolve(result);
            });
        })
    }
}
