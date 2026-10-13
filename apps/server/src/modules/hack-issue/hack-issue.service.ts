import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { GitHubService, GitHubUnavailableError } from '../github/github.service';
import { GetHackIssuesQueryDto } from './dto/get-hack-issues.dto';
import { RegisterHackIssueDto } from './dto/register-hack-issue.dto';
import { parseGitHubIssueUrl } from './github-issue-url';
import { HackIssue, HackIssueDocument } from './schemas/hack-issue.schema';

const MONGO_DUPLICATE_KEY_ERROR = 11000;

@Injectable()
export class HackIssueService {
  private readonly logger = new Logger(HackIssueService.name);

  constructor(
    @InjectModel(HackIssue.name) private hackIssueModel: Model<HackIssueDocument>,
    private readonly githubService: GitHubService
  ) {}

  /**
   * Register a public GitHub issue on the platform from its URL
   * @param dto Issue URL
   * @param registeredBy ID of the admin registering the issue
   */
  async register(dto: RegisterHackIssueDto, registeredBy?: string): Promise<HackIssue> {
    const ref = parseGitHubIssueUrl(dto.url);
    if (!ref) {
      throw new BadRequestException(
        'Invalid GitHub issue URL. Expected a URL like https://github.com/owner/repo/issues/123'
      );
    }

    await this.ensureNotRegistered(`${ref.owner}/${ref.repo}`, ref.number);

    let issue: Awaited<ReturnType<GitHubService['fetchIssue']>>;
    try {
      issue = await this.githubService.fetchIssue(ref.owner, ref.repo, ref.number);
    } catch (error) {
      if (error instanceof GitHubUnavailableError) {
        throw new ServiceUnavailableException(
          'GitHub is unavailable right now, please try again later'
        );
      }
      throw error;
    }

    if (!issue) {
      throw new NotFoundException(
        `Issue ${ref.owner}/${ref.repo}#${ref.number} doesn't exist or isn't public`
      );
    }
    if (issue.isPullRequest) {
      throw new BadRequestException('This URL points to a pull request, not an issue');
    }
    if (issue.state !== 'open') {
      throw new BadRequestException('Only open issues can be registered');
    }

    // The repository may have been renamed or the URL may use a different casing
    const repository = `${issue.owner}/${issue.repo}`;
    await this.ensureNotRegistered(repository, issue.number);

    try {
      const created = await this.hackIssueModel.create({
        githubId: issue.githubId,
        repository,
        owner: issue.owner,
        repo: issue.repo,
        number: issue.number,
        title: issue.title,
        body: issue.body ?? undefined,
        labels: issue.labels,
        language: issue.language ?? undefined,
        url: issue.htmlUrl,
        registeredBy,
      });
      this.logger.log(`Registered GitHub issue ${repository}#${issue.number}`);
      return created;
    } catch (error) {
      // Two concurrent registrations of the same issue
      if ((error as { code?: number })?.code === MONGO_DUPLICATE_KEY_ERROR) {
        throw this.duplicateError(repository, issue.number);
      }
      throw error;
    }
  }

  async findAll(query: GetHackIssuesQueryDto) {
    const { status, search, page = 1, limit = 20 } = query;

    const filter: FilterQuery<HackIssueDocument> = {};
    if (status) {
      filter.status = status;
    }
    if (search) {
      const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: pattern }, { repository: pattern }];
    }

    const [issues, total] = await Promise.all([
      this.hackIssueModel
        .find(filter)
        .select('-__v -body')
        .populate('registeredBy', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.hackIssueModel.countDocuments(filter).exec(),
    ]);

    return {
      issues,
      pagination: {
        total,
        page,
        limit,
        pages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  private async ensureNotRegistered(repository: string, number: number): Promise<void> {
    const existing = await this.hackIssueModel
      .exists({ repository: repository.toLowerCase(), number })
      .exec();
    if (existing) {
      throw this.duplicateError(repository, number);
    }
  }

  private duplicateError(repository: string, number: number): ConflictException {
    return new ConflictException(`Issue ${repository}#${number} is already registered`);
  }
}
