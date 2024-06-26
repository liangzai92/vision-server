import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Post,
  Query,
} from '@nestjs/common';

import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { convertToNumber } from '@/utils';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('xdf/staff')
  getUserList(@Query() query) {
    const payload = {
      ...query,
      page: convertToNumber(query.page),
      pageSize: convertToNumber(query.pageSize),
    };
    return this.userService.getUserList(payload);
  }

  @Get(':id')
  findUserByUserId(@Param('id') id: string) {
    return this.userService.findUserByUserId(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
