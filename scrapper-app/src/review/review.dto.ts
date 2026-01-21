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
import { JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from 'src/product/product.entity';

export class ReviewDto {
  @PrimaryGeneratedColumn()
  id: string;
  
  @ManyToOne(()=>Product)
  @JoinColumn({name: "productId"}) // putting K here since here can be multiple row for a same product for each row we can reach to its prodect parent
  readonly product: Product;

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