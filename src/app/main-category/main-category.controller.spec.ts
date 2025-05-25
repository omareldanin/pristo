import { Test, TestingModule } from '@nestjs/testing';
import { MainCategoryController } from './main-category.controller';

describe('MainCategoryController', () => {
  let controller: MainCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MainCategoryController],
    }).compile();

    controller = module.get<MainCategoryController>(MainCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
