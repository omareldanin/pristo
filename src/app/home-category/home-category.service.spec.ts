import { Test, TestingModule } from '@nestjs/testing';
import { HomeCategoryService } from './home-category.service';

describe('HomeCategoryService', () => {
  let service: HomeCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HomeCategoryService],
    }).compile();

    service = module.get<HomeCategoryService>(HomeCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
