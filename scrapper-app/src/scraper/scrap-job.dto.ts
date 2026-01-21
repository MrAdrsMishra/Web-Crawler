import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, ValidateNested, IsObject, IsEnum, IsDate, IsUUID, IsEmail, IsUrl, IsNotEmpty, Length, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PrimaryGeneratedColumn } from 'typeorm';

export class CreateScrapJobDto {
  @PrimaryGeneratedColumn()
  id:string
  
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  @Length(1, 100)
  @ApiProperty({ example: "https://example.com", description: 'URL link', format: 'uri' })
  readonly targetUrl: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: "product", description: 'Type classification' })
  readonly targetType: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: "failed", description: 'Current status' })
  readonly status: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: "Timeout while scraping page", description: 'The errorLog property' })
  readonly errorLog: string;

  @IsNotEmpty()
  @IsString()
  @IsDate()
  @Length(1, 100)
  @ApiProperty({ example: "2026-01-14T10:30:00Z", description: 'The startedAt property', format: 'date-time' })
  readonly startedAt: Date;

  @IsNotEmpty()
  @IsString()
  @IsDate()
  @Length(1, 100)
  @ApiProperty({ example: "2026-01-14T10:32:10Z", description: 'The finishedAt property', format: 'date-time' })
  readonly finishedAt: Date;
}