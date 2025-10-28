import { FilterQuery } from 'mongoose';
import { createNotFoundError } from '../../shared/errors/api-error';
import { LetterModel, LetterDocument } from './letter.model';
import {
  CreateLetterInput,
  LetterDTO,
  LetterListQuery,
  LetterListResponse,
  UpdateLetterInput
} from './letter.types';

class LetterService {
  private toDTO(document: LetterDocument): LetterDTO {
    return {
      id: document.id,
      title: document.title,
      icon: document.icon,
      content: document.content,
      createdAt: document.publishedAt ? document.publishedAt.toISOString() : undefined,
      legacyId: document.legacyId
    };
  }

  async list(query: LetterListQuery): Promise<LetterListResponse> {
    const filter: FilterQuery<LetterDocument> = {};

    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [{ title: regex }, { content: regex }];
    }

    const limit = query.limit ?? 50;
    const page = query.page ?? 1;
    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      LetterModel.find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit),
      LetterModel.countDocuments(filter)
    ]);

    return {
      data: documents.map(doc => this.toDTO(doc)),
      meta: {
        total,
        limit,
        page,
        pages: Math.max(1, Math.ceil(total / limit))
      }
    };
  }

  async findById(id: string): Promise<LetterDTO> {
    const document = await LetterModel.findById(id);
    if (!document) {
      throw createNotFoundError('Carta no encontrada');
    }

    return this.toDTO(document);
  }

  async create(input: CreateLetterInput): Promise<LetterDTO> {
    const document = await LetterModel.create({
      title: input.title,
      icon: input.icon,
      content: input.content,
      publishedAt: input.createdAt,
      legacyId: input.legacyId
    });

    return this.toDTO(document);
  }

  async update(id: string, input: UpdateLetterInput): Promise<LetterDTO> {
    const update: Partial<LetterDocument> = {};

    if (input.title !== undefined) update.title = input.title;
    if (input.icon !== undefined) update.icon = input.icon;
    if (input.content !== undefined) update.content = input.content;
    if (input.createdAt !== undefined) update.publishedAt = input.createdAt;
    if (input.legacyId !== undefined) update.legacyId = input.legacyId;

    const document = await LetterModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true
    });

    if (!document) {
      throw createNotFoundError('Carta no encontrada');
    }

    return this.toDTO(document);
  }

  async remove(id: string): Promise<void> {
    const document = await LetterModel.findByIdAndDelete(id);
    if (!document) {
      throw createNotFoundError('Carta no encontrada');
    }
  }
}

export const letterService = new LetterService();

