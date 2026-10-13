import { BlogService } from './blog.service';

function chain(result: unknown) {
  const link: Record<string, jest.Mock> = {};
  for (const name of ['select', 'sort', 'skip', 'limit', 'populate', 'lean']) {
    link[name] = jest.fn().mockReturnValue(link);
  }
  link.exec = jest.fn().mockResolvedValue(result);
  return link;
}

describe('BlogService.findAll search', () => {
  let postModel: { find: jest.Mock; countDocuments: jest.Mock };
  let userModel: { find: jest.Mock };
  let service: BlogService;

  beforeEach(() => {
    postModel = {
      find: jest.fn().mockReturnValue(chain([])),
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
    };
    userModel = { find: jest.fn().mockReturnValue(chain([])) };
    service = new BlogService(postModel as never, userModel as never);
  });

  function titlePattern(): string {
    const filter = postModel.find.mock.calls[0][0] as { $or: Array<{ title: { $regex: string } }> };
    return filter.$or[0].title.$regex;
  }

  it('matches the search text literally rather than as a regular expression', async () => {
    await service.findAll({ search: 'C++' });
    const pattern = new RegExp(titlePattern(), 'i');
    expect(pattern.test('Learning C++ today')).toBe(true);
    expect(pattern.test('Learning C plus plus today')).toBe(false);
  });

  it('does not reject a search that contains regex syntax such as a bracket or a parenthesis', async () => {
    await expect(service.findAll({ search: '(' })).resolves.toBeDefined();
    const pattern = new RegExp(titlePattern(), 'i');
    expect(pattern.test('a note (draft)')).toBe(true);
  });

  it('matches node.js only where the dot is literal', async () => {
    await service.findAll({ search: 'node.js' });
    const pattern = new RegExp(titlePattern(), 'i');
    expect(pattern.test('Intro to node.js')).toBe(true);
    expect(pattern.test('Intro to nodexjs')).toBe(false);
  });

  it.each([
    '(',
    '[',
    '*',
    '?',
    'C++',
    '(and C)',
  ])('treats %s as plain text in every searched field', async (search) => {
    await service.findAll({ search });
    const postFilter = postModel.find.mock.calls[0][0];
    const userFilter = userModel.find.mock.calls[0][0];
    const patterns = [...postFilter.$or, ...userFilter.$or]
      .map((clause: Record<string, { $regex?: string }>) => Object.values(clause)[0].$regex)
      .filter(Boolean)
      .map((source: string) => new RegExp(source, 'i'));

    expect(patterns).toHaveLength(5);
    for (const pattern of patterns) {
      expect(pattern.test(`intro ${search} outro`)).toBe(true);
    }
  });
});
