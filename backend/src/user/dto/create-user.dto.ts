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
  @IsNotEmpty()
  @IsString()
  username: string;

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

  @IsNotEmpty()
  @IsPhoneNumber('ID')
  noHp: string;

  @IsNotEmpty()
  @Matches(/^(L|P)$/, {
    message: 'Jenis kelamin harus “L” atau “P”',
  })
  jenisKelamin: string; // “L” atau “P”

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Tanggal lahir harus format YYYY-MM-DD',
  })
  tanggalLahir: string; // “YYYY-MM-DD”

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  status?: string;
}
