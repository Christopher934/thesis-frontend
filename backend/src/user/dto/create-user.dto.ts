// src/user/dto/create-user.dto.ts
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

export class CreateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  namaDepan: string;

  @IsNotEmpty()
  @IsString()
  namaBelakang: string;

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
  jenisKelamin?: string; // “L” atau “P”

  @IsOptional()
  @Matches(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, {
    message: 'Tanggal lahir harus format YYYY-MM-DD',
  })
  tanggalLahir?: string; // “YYYY-MM-DD”

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  status?: string;
}
