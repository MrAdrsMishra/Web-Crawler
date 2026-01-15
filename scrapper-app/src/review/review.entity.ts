import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  ValidateNested,
  IsObject,
  IsEnum,
  IsDate,
  IsUUID,
  IsEmail,
  IsUrl,
  IsNotEmpty,
  Length,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PrimaryGeneratedColumn } from 'typeorm';

export class CreateReviewDto {
  @PrimaryGeneratedColumn()
  id: string;
  
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({
    example: 'gsdfhgsb23vhag434v2v_njnjsd_kdss5',
    description: 'Unique identifier',
  })
  readonly product_id: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: 'adrs', description: 'The author property' })
  readonly author: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: 'this is review', description: 'The text property' })
  readonly text: string;

  @IsNotEmpty()
  @IsString()
  @IsDate()
  @Length(1, 100)
  @ApiProperty({
    example: '2026-01-14T10:32:10Z',
    description: 'The create_at property',
    format: 'date-time',
  })
  readonly createAt: Date;
}
