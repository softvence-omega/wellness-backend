import { PartialType } from '@nestjs/mapped-types';
import { CreateNudgeDto } from './create-nudge.dto';

export class UpdateNudgeDto extends PartialType(CreateNudgeDto) {}
