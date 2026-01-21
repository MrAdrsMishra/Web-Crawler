
import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, ValidateNested, IsObject, IsEnum, IsDate, IsUUID, IsEmail, IsUrl, IsNotEmpty, Length, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FrontierQueueDto {
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  @Length(1, 100)
  @ApiProperty({ example: "https://example.com", description: 'URL link', format: 'uri' })
  readonly url: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: "new", description: 'Current status' })
  readonly status: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1000)
  @ApiProperty({ example: 10, description: 'The depth property' })
  readonly depth: number;

  @IsNotEmpty()
  @IsString()
  @IsDate()
  @Length(1, 100)
  @ApiProperty({ example: "2026-01-14T10:32:10Z", description: 'The last_seen property', format: 'date-time' })
  readonly last_seen: Date;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1000)
  @ApiProperty({ example: 10, description: 'The priority property' })
  readonly priority: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1000)
  @ApiProperty({ example: 5, description: 'Count or quantity' })
  readonly retry_time: number;
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1000)
  @ApiProperty({ example: 5, description: 'Count or quantity' })
  readonly retry_count: number;
}