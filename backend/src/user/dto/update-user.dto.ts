// backend/src/user/dto/update-user.dto.ts
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  namaDepan?: string;

  @IsOptional()
  @IsString()
  namaBelakang?: string;

  @IsOptional()
  @IsString()
  alamat?: string;

  @IsOptional()
  @IsPhoneNumber('ID')
  noHp?: string;

  @IsOptional()
  @Matches(/^(L|P)$/, {
    message: 'Jenis kelamin harus “L” atau “P”',
  })
  jenisKelamin?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Tanggal lahir harus format YYYY-MM-DD',
  })
  tanggalLahir?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  telegramChatId?: string;
}
