import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { RedisService } from '@common/redis/redis.service';
import {
  CreateGrammarBookDto,
  UpdateGrammarBookDto,
  CreateGrammarUnitDto,
  UpdateGrammarUnitDto,
} from './dto/grammar.dto';

const CACHE_TTL = 3600;
const CACHE_PREFIX = 'grammar';

import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class GrammarService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private eventEmitter: EventEmitter2,
  ) {}

  // ==================== READ OPERATIONS ====================

  async getBooks() {
    const cacheKey = `${CACHE_PREFIX}:books`;
    const cached = await this.redis.getJson(cacheKey);
    if (cached) return cached;

    const books = await this.prisma.grammarBook.findMany({
      orderBy: { level: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        author: true,
        level: true,
        imageUrl: true,
        color: true,
        unitCount: true,
        _count: { select: { units: true } },
      },
    });

    await this.redis.setJson(cacheKey, books, CACHE_TTL);
    return books;
  }

  async getBookBySlug(slug: string) {
    const cacheKey = `${CACHE_PREFIX}:book:${slug}`;
    const cached = await this.redis.getJson(cacheKey);
    if (cached) return cached;

    const book = await this.prisma.grammarBook.findUnique({
      where: { slug },
      include: {
        units: {
          orderBy: { order: 'asc' },
          select: { id: true, title: true, order: true },
        },
      },
    });

    if (book) await this.redis.setJson(cacheKey, book, CACHE_TTL);
    return book;
  }

  async getUnit(unitId: string) {
    const unit = await this.prisma.grammarUnit.findUnique({
      where: { id: unitId },
      include: {
        book: { select: { id: true, slug: true, name: true } },
        exercises: { orderBy: { order: 'asc' } },
      },
    });
    return unit;
  }

  async getUnitWithContent(unitId: string) {
    const cacheKey = `${CACHE_PREFIX}:unit:${unitId}`;
    const cached = await this.redis.getJson(cacheKey);
    if (cached) return cached;

    const unit = await this.prisma.grammarUnit.findUnique({
      where: { id: unitId },
      include: {
        book: { select: { id: true, slug: true, name: true } },
        exercises: { orderBy: { order: 'asc' } },
      },
    });

    if (!unit) return null;

    // Transform exercises to nested structure
    const exercisesMap = new Map<string, any>();

    for (const ex of unit.exercises) {
        if (!exercisesMap.has(ex.section)) {
             // Parse options safely
             let options: any = {};
             if (typeof ex.options === 'object') {
                 options = ex.options;
             }
             
            exercisesMap.set(ex.section, {
                id: ex.section,
                question: options?.instruction || '',
                type: ex.type,
                verbs: options?.verbs,
                items: [],
                matches: []
            });
        }
        
        const group = exercisesMap.get(ex.section);
        const options: any = typeof ex.options === 'object' ? ex.options : {};

        if (ex.type === 'match') {
             group.matches.push({
                 left: ex.question,
                 right: ex.answer,
                 isExample: options?.isExample || false
             });
        } else {
            group.items.push({
                label: ex.question,
                answer: ex.answer,
                value: ex.answer, // Fallback
                isExample: options?.isExample || false
            });
        }
    }

    const transformedUnit = {
        ...unit,
        exercises: Array.from(exercisesMap.values())
    };

    await this.redis.setJson(cacheKey, transformedUnit, CACHE_TTL);
    return transformedUnit;
  }

  // ==================== BOOK CRUD ====================

  async createBook(dto: CreateGrammarBookDto) {
    const book = await this.prisma.grammarBook.create({ data: dto });
    this.eventEmitter.emit('grammar.updated');
    return book;
  }

  async updateBook(id: string, dto: UpdateGrammarBookDto) {
    const book = await this.prisma.grammarBook.update({
      where: { id },
      data: dto,
    });
    this.eventEmitter.emit('grammar.updated');
    return book;
  }

  async deleteBook(id: string) {
    await this.prisma.grammarBook.delete({ where: { id } });
    this.eventEmitter.emit('grammar.updated');
    return { message: 'Grammar book deleted successfully' };
  }

  // ==================== UNIT CRUD ====================

  async createUnit(dto: CreateGrammarUnitDto) {
    const { exercises, ...rest } = dto;
    const unit = await this.prisma.grammarUnit.create({
      data: {
        ...rest,
        exercises: exercises ? { create: exercises } : undefined,
      },
    });
    this.eventEmitter.emit('grammar.updated');
    return unit;
  }

  async updateUnit(id: string, dto: UpdateGrammarUnitDto) {
    const { exercises, ...rest } = dto;
    
    // If exercises are provided, we replace all existing ones (simplest strategy for full unit update)
    // Or we could implement smarter diffing, but for now flush-and-replace is fine for Admin UI.
    const data: any = { ...rest };
    
    if (exercises) {
        data.exercises = {
            deleteMany: {},
            create: exercises
        };
    }

    const unit = await this.prisma.grammarUnit.update({
      where: { id },
      data: data,
    });
    this.eventEmitter.emit('grammar.updated');
    return unit;
  }

  async deleteUnit(id: string) {
    await this.prisma.grammarUnit.delete({ where: { id } });
    this.eventEmitter.emit('grammar.updated');
    return { message: 'Grammar unit deleted successfully' };
  }

  // ==================== CACHE ====================

  @OnEvent('grammar.updated')
  async handleGrammarUpdated() {
    console.log('🔄 Grammar updated, invalidating cache...');
    await this.invalidateCache();
  }

  async invalidateCache(pattern?: string) {
    await this.redis.delByPattern(pattern || `${CACHE_PREFIX}:*`);
  }
}
