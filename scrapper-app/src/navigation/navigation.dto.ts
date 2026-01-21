import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, ValidateNested, IsObject, IsEnum, IsDate, IsUUID, IsEmail, IsUrl, IsNotEmpty, Length, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NavigationDto{

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: "this is title", description: 'Title of the entity' })
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: "fiction", description: 'The slug property' })
  readonly slug: string;

  @IsNotEmpty()
  @IsString()
  @IsDate()
  @Length(1, 100)
  @ApiProperty({ example: "2026-01-14T10:32:10Z", description: 'The lastScrapedAt property', format: 'date-time' })
  readonly lastScrapedAt: Date;
}