import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ShiftService } from './shift.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createShiftDto: CreateShiftDto) {
    return this.shiftService.create(createShiftDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.shiftService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShiftDto: UpdateShiftDto) {
    return this.shiftService.update(+id, updateShiftDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shiftService.remove(+id);
  }
}
