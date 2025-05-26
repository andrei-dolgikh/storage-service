import { Controller, Post, Get, Body, Param, Res } from '@nestjs/common';
import { StorageService } from './storage.service';
import { Response } from 'express';
import * as path from 'path';

@Controller()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('download')
  async downloadFile(@Body() body: { url: string }) {
    return this.storageService.downloadFromUrl(body.url);
  }

  @Post('upload')
  async uploadFile(@Body() body: { filePath: string; fileName: string }) {
    return this.storageService.storeFile(body.filePath, body.fileName);
  }

@Get('files/:filename')
async getFile(@Param('filename') filename: string, @Res() res: Response) {
  const filePath = this.storageService.getFilePath(filename);
  
  // Определение MIME-типа на основе расширения файла
  const ext = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';
  
  if (ext === '.mp4') {
    contentType = 'video/mp4';
  } else if (ext === '.jpg' || ext === '.jpeg') {
    contentType = 'image/jpeg';
  } else if (ext === '.png') {
    contentType = 'image/png';
  } else if (ext === '.gif') {
    contentType = 'image/gif';
  }
  
  res.header('Content-Type', contentType);
  return res.sendFile(filePath);
}
}