import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly storageDir: string;
  private readonly baseUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.storageDir = process.env.STORAGE_DIR || '/app/storage';
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3002';
    
    // Создаем директорию для хранения, если её нет
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  async downloadFromUrl(url: string): Promise<{ path: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { responseType: 'arraybuffer' })
      );
      
      const fileExtension = this.getFileExtension(url);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(this.storageDir, fileName);
      
      fs.writeFileSync(filePath, response.data);
      
      return { path: filePath };
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new HttpException('Failed to download file', HttpStatus.BAD_REQUEST);
    }
  }

  async storeFile(filePath: string, fileName: string): Promise<{ url: string }> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new HttpException('Source file not found', HttpStatus.NOT_FOUND);
      }
      
      const destFileName = fileName || `${uuidv4()}${path.extname(filePath)}`;
      const destFilePath = path.join(this.storageDir, destFileName);
      
      // Копируем файл в хранилище
      fs.copyFileSync(filePath, destFilePath);
      
      // Формируем URL для доступа к файлу
      const fileUrl = `${this.baseUrl}/files/${destFileName}`;
      
      return { url: fileUrl };
    } catch (error) {
      console.error('Error storing file:', error);
      throw new HttpException('Failed to store file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  getFilePath(filename: string): string {
    const filePath = path.join(this.storageDir, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }
    
    return filePath;
  }

  private getFileExtension(url: string): string {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const extension = path.extname(pathname);
    
    // Возвращаем расширение или дефолтное .jpg если расширение не найдено
    return extension || '.jpg';
  }
}