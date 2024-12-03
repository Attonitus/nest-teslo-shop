import { Controller, Post, UploadedFile, UseInterceptors, ParseFilePipe, Delete, Body, Param } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFilter } from './helpers/imageFilter.helper';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: imageFilter
  }))
  uploadProductFile( @UploadedFile('file', ParseFilePipe) file: Express.Multer.File ) {
    return this.filesService.upload(file);
  }


  @Delete(':imgId')
  deleteProductFile( @Param('imgId') imgId: string){
    return this.filesService.delete(imgId);
  }
}
