import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { User } from '../user/schemas/user.schema';
import { BlogService } from './blog.service';
import { Post } from './schemas/post.schema';

const chain = (result: unknown) => {
  const query: Record<string, jest.Mock> = {};
  for (const method of ['sort', 'skip', 'limit', 'select', 'populate', 'lean']) {
    query[method] = jest.fn(() => query);
  }
  query.exec = jest.fn(async () => result);
  return query;
};

describe('BlogService.findAll search', () => {
  let service: BlogService;
  const postModel = { find: jest.fn(), countDocuments: jest.fn() };
  const userModel = { find: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    postModel.find.mockReturnValue(chain([]));
    postModel.countDocuments.mockReturnValue(chain(0));
    userModel.find.mockReturnValue(chain([]));
    const module = await Test.createTestingModule({
      providers: [
        BlogService,
        { provide: getModelToken(Post.name), useValue: postModel },
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();
    service = module.get(BlogService);
  });

  /** Regexes the service sends to MongoDB for a search */
  const searchRegexes = async (search: string) => {
    await service.findAll({ search, published: true });
    const postFilter = postModel.find.mock.calls[0][0];
    const userFilter = userModel.find.mock.calls[0][0];
    return [...postFilter.$or, ...userFilter.$or]
      .map((clause: Record<string, { $regex?: string }>) => Object.values(clause)[0].$regex)
      .filter(Boolean)
      .map((source: string) => new RegExp(source, 'i'));
  };

  it.each([
    '(',
    '[',
    '*',
    '?',
    'C++',
    '(and C)',
  ])('treats %s as plain text instead of an invalid regex', async (search) => {
    const regexes = await searchRegexes(search);

    expect(regexes).toHaveLength(5);
    for (const regex of regexes) {
      expect(regex.test(`intro ${search} outro`)).toBe(true);
    }
  });

  it('matches dots literally', async () => {
    const [titleRegex] = await searchRegexes('node.js');

    expect(titleRegex.test('Getting started with Node.js')).toBe(true);
    expect(titleRegex.test('Why nodexjs is not a thing')).toBe(false);
  });
});
