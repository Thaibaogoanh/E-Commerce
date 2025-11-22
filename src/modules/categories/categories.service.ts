import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { Product } from '../../entities/product.entity';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
  CategoryTreeDto,
} from '../../dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    // Check if category with same name already exists
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });
    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    // Check if parent category exists (if parentId is provided)
    if (createCategoryDto.parentId) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parentId, isActive: true },
      });
      if (!parentCategory) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = this.categoryRepository.create(createCategoryDto);
    const savedCategory = await this.categoryRepository.save(category);

    return this.formatCategoryResponse(savedCategory);
  }

  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      relations: ['parent', 'children'],
      order: { name: 'ASC' },
    });

    return categories.map((category) => this.formatCategoryResponse(category));
  }

  async findTree(): Promise<CategoryTreeDto[]> {
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      relations: ['children'],
      order: { name: 'ASC' },
    });

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await this.productRepository.count({
          where: { categoryId: category.id, isActive: true },
        });
        return { ...category, productCount };
      }),
    );

    // Build tree structure
    const categoryMap = new Map<string, CategoryTreeDto>();
    const rootCategories: CategoryTreeDto[] = [];

    // First pass: create all category nodes
    categoriesWithCounts.forEach((category) => {
      const categoryNode: CategoryTreeDto = {
        id: category.id,
        name: category.name,
        description: category.description,
        image: category.image,
        parentId: category.parentId,
        isActive: category.isActive,
        children: [],
        productCount: category.productCount,
      };
      categoryMap.set(category.id, categoryNode);
    });

    // Second pass: build tree structure
    categoriesWithCounts.forEach((category) => {
      const categoryNode = categoryMap.get(category.id);
      if (category.parentId) {
        const parentNode = categoryMap.get(category.parentId);
        if (parentNode && categoryNode) {
          parentNode.children.push(categoryNode);
        }
      } else {
        if (categoryNode) {
          rootCategories.push(categoryNode);
        }
      }
    });

    return rootCategories;
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: { id, isActive: true },
      relations: ['parent', 'children', 'products'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.formatCategoryResponse(category);
  }

  async findOneWithProducts(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: { id, isActive: true },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Get products for this category
    const products = await this.productRepository.find({
      where: { categoryId: id, isActive: true },
      select: ['id', 'name', 'title', 'price', 'image'],
      order: { createdAt: 'DESC' },
    });

    const categoryResponse = this.formatCategoryResponse(category);
    categoryResponse.products = products;

    return categoryResponse;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: { id, isActive: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if category name is unique (if name is being updated)
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name },
      });
      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    // Check if parent category exists (if parentId is being updated)
    if (updateCategoryDto.parentId) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parentCategory = await this.categoryRepository.findOne({
        where: { id: updateCategoryDto.parentId, isActive: true },
      });
      if (!parentCategory) {
        throw new NotFoundException('Parent category not found');
      }

      // Check for circular reference
      const isCircular = await this.checkCircularReference(
        id,
        updateCategoryDto.parentId,
      );
      if (isCircular) {
        throw new BadRequestException('Circular reference detected');
      }
    }

    Object.assign(category, updateCategoryDto);
    const updatedCategory = await this.categoryRepository.save(category);

    return this.formatCategoryResponse(updatedCategory);
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.categoryRepository.findOne({
      where: { id, isActive: true },
      relations: ['children', 'products'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if category has children
    if (category.children && category.children.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with subcategories. Please delete subcategories first.',
      );
    }

    // Check if category has products
    const productCount = await this.productRepository.count({
      where: { categoryId: id, isActive: true },
    });
    if (productCount > 0) {
      throw new BadRequestException(
        'Cannot delete category with products. Please move or delete products first.',
      );
    }

    // Soft delete
    category.isActive = false;
    await this.categoryRepository.save(category);

    return { message: 'Category deleted successfully' };
  }

  private async checkCircularReference(
    categoryId: string,
    parentId: string,
  ): Promise<boolean> {
    let currentParentId: string | null = parentId;
    const visited = new Set<string>();

    while (currentParentId) {
      if (visited.has(currentParentId)) {
        return true; // Circular reference detected
      }

      if (currentParentId === categoryId) {
        return true; // Direct circular reference
      }

      visited.add(currentParentId);

      const parent = await this.categoryRepository.findOne({
        where: { id: currentParentId },
        select: ['parentId'],
      });

      currentParentId = parent?.parentId || null;
    }

    return false;
  }

  private formatCategoryResponse(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      parentId: category.parentId,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      parent: category.parent
        ? {
            id: category.parent.id,
            name: category.parent.name,
          }
        : undefined,
      children: category.children
        ? category.children.map((child) => this.formatCategoryResponse(child))
        : undefined,
    };
  }
}
