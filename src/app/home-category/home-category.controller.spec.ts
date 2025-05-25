import { Test, TestingModule } from '@nestjs/testing';
import { HomeCategoryController } from './home-category.controller';

describe('HomeCategoryController', () => {
  let controller: HomeCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeCategoryController],
    }).compile();

    controller = module.get<HomeCategoryController>(HomeCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
