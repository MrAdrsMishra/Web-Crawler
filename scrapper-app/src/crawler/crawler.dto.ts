import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, ValidateNested, IsObject, IsEnum, IsDate, IsUUID, IsEmail, IsUrl, IsNotEmpty, Length, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScrapJob {
  @IsNotEmpty() 
  @IsString()
  @IsUrl()
  @Length(1, 100)
  @ApiProperty({ example: "https://example.com", description: 'URL link', format: 'uri' })
  readonly targetUrl: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: "collection", description: 'Type classification' })
  readonly targteType: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: "pending", description: 'Current status' })
  readonly status: string;

  @IsNotEmpty()
  @IsString()
  @IsDate()
  @Length(1, 100)
  @ApiProperty({ example: "2026-01-14T10:32:10Z", description: 'The started_at property', format: 'date-time' })
  readonly startedAt: Date;

  @IsNotEmpty()
  @IsString()
  @IsDate()
  @Length(1, 100)
  @ApiProperty({ example: "2026-01-14T10:33:10Z", description: 'The finished_at property', format: 'date-time' })
  readonly finishedAt: Date;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: "no errors", description: 'The error_log property' })
  readonly errorLog: string;
}