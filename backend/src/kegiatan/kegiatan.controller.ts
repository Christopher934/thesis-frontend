import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { KegiatanService } from './kegiatan.service';

@Controller('events')
export class KegiatanController {
  constructor(private readonly kegiatanService: KegiatanService) {}

  @Get()
  async findAll() {
    return this.kegiatanService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.kegiatanService.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.kegiatanService.create(body);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.kegiatanService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.kegiatanService.remove(id);
  }
}
