import { IsString, IsInt, IsOptional, IsUrl, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGrammarBookDto {
  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsString()
  author: string;

  @IsString()
  level: string;

  @IsUrl()
  imageUrl: string;

  @IsString()
  color: string;

  @IsInt()
  @Min(0)
  unitCount: number;
}

export class UpdateGrammarBookDto {
  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  unitCount?: number;
}

export class GrammarExerciseDto {
  @IsString()
  section: string;

  @IsString()
  question: string;

  @IsString()
  answer: string;

  @IsString()
  type: string;

  @IsInt()
  order: number;

  @IsOptional()
  options?: any;
}

export class CreateGrammarUnitDto {
  @IsString()
  bookId: string;

  @IsString()
  title: string;

  @IsInt()
  order: number;

  @IsString()
  @IsOptional()
  theoryContent?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => GrammarExerciseDto)
  exercises?: GrammarExerciseDto[];
}

export class UpdateGrammarUnitDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsString()
  @IsOptional()
  theoryContent?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => GrammarExerciseDto)
  exercises?: GrammarExerciseDto[];
}
