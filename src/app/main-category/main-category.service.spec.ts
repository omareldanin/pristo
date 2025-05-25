import { Test, TestingModule } from '@nestjs/testing';
import { MainCategoryService } from './main-category.service';

describe('MainCategoryService', () => {
  let service: MainCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MainCategoryService],
    }).compile();

    service = module.get<MainCategoryService>(MainCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
