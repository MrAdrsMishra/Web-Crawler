import {
  IsString,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  IsISO8601,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({ example: 'Electronics', description: 'Title of the category' })
  title: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({
    example: 'harry-potter-1972',
    description: 'URL-friendly slug',
  })
  slug: string;

  @IsOptional()
  @IsUUID() // Better than 'any' to ensure it's a valid ID
  @ApiPropertyOptional({
    example: 'uuid-of-parent',
    description: 'ID of the parent category',
  })
  parentId?: string;

  @IsNotEmpty()
  @IsISO8601() // Validates string matches ISO date format (e.g., 2026-01-14T10:32:10Z)
  @ApiProperty({
    example: '2026-01-18T15:00:00Z',
    description: 'The last time this data was updated',
    format: 'date-time',
  })
  lastScrapedAt: string;
}
