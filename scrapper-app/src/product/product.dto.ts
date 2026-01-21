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

export class ProductDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: 'worldofbooks', description: 'Unique identifier' })
  sourceId: string;

  @IsNotEmpty()
  @IsString()
  @IsDate()
  @Length(1, 100)
  @ApiProperty({
    example: 'HP-12345',
    description: 'Unique identifier',
    format: 'date-time',
  })
  externalProductId: Date;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({
    example: 'Harry Potter Fantasy Edition',
    description: 'Title of the entity',
  })
  title: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1000)
  @ApiProperty({ example: 24, description: 'Price value' })
  price: number;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: 'INR', description: 'The currency property' })
  currency: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  @Length(1, 126)
  @ApiProperty({
    example: 'https://example.com',
    description: 'URL link',
    format: 'uri',
  })
  productUrl: string;

  @IsNotEmpty()
  @IsString()
  @IsDate()
  @Length(1, 100)
  @ApiProperty({
    example: '2026-01-14T10:32:10Z',
    description: 'The lastScrapedAt property',
    format: 'date-time',
  })
  lastScrapedAt: Date;
}

export class SpecsDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: 'abs', description: 'The first property' })
  first: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: 'seco-specs', description: 'The second property' })
  second: string;
}

export class ProductDetailsDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: 'hsfdsfdsjufgafb', description: 'Unique identifier' })
  productId: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({
    example: 'hsfdsfdsjufgafb',
    description: 'Detailed description',
  })
  description: string;

  @IsNotEmpty()
  @ValidateNested()
  @IsObject()
  @ApiProperty({ type: SpecsDto, description: 'specs object' })
  @Type(() => SpecsDto)
  specs: SpecsDto;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1000)
  @ApiProperty({ example: 4, description: 'The raringAvg property' })
  ratingAvg: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1000)
  @ApiProperty({ example: 32, description: 'Count or quantity' })
  reviewsCount: number;
}
