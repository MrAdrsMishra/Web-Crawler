import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, ValidateNested, IsObject, IsEnum, IsDate, IsUUID, IsEmail, IsUrl, IsNotEmpty, Length, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePoductDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: "uuid", description: 'Unique identifier' })
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: "worldofbooks", description: 'Unique identifier' })
  readonly sourceId: string;

  @IsNotEmpty()
  @IsString()
  @IsDate()
  @Length(1, 100)
  @ApiProperty({ example: "HP-12345", description: 'Unique identifier', format: 'date-time' })
  readonly externalProductId: Date;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: "Harry Potter Fantasy Edition", description: 'Title of the entity' })
  readonly title: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1000)
  @ApiProperty({ example: 24, description: 'Price value' })
  readonly price: number;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: "INR", description: 'The currency property' })
  readonly currency: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  @Length(1, 126)
  @ApiProperty({ example: "https://example.com", description: 'URL link', format: 'uri' })
  readonly productUrl: string;

  @IsNotEmpty()
  @IsString()
  @IsDate()
  @Length(1, 100)
  @ApiProperty({ example: "2026-01-14T10:32:10Z", description: 'The lastScrapedAt property', format: 'date-time' })
  readonly lastScrapedAt: Date;
}
// {
//   "id": "uuid",
//   "sourceId": "worldofbooks",
//   "externalProductId": "HP-12345",
//   "title": "Harry Potter Fantasy Edition",
//   "price": 24,
//   "currency": "INR",
//   "productUrl": "https://www.worldofbooks.com/en-gb/product/fantasy-harry-potter",
//   "lastScrapedAt": "2026-01-14T10:32:10Z"
// }
