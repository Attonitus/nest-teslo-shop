import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';


@Injectable()
export class FilesService {

  constructor(
    private cloudinaryService : CloudinaryService
  ){}

  async upload(file: Express.Multer.File) {
    try {
      const res = await this.cloudinaryService.uploadFileCloudinary(file);
      const imgId = res.public_id.split('/')[1];
      return {
        imgId,
        url: res.secure_url
      }
    } catch (error) {
      throw new ConflictException(`Error uploading image: ${error}`);
    }
  }

  async delete(imgId: string){
    const imgIdComplete = `${process.env.CLOUD_FOLDER}/${imgId}`;
    const res = await this.cloudinaryService.deleteFileCloudinary(imgIdComplete);

    if(res.result === "not found"){
      throw new BadRequestException(`Image with ${imgIdComplete} not exist`);
    }

    return res;
  }


}
