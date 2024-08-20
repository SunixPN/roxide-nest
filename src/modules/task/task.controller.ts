import { Body, Controller, Get, Param, Post, Query, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { ITaskCreate } from 'src/entities/task.model';
import { User } from 'src/entities/user.model';
import { Response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post("/create")
  @UseGuards(AuthGuard)
  createTask(@Body() task: ITaskCreate) {
    return this.taskService.createTask(task)
  }

  @Get("/all-tasks-with-user")
  @UseGuards(AuthGuard)
  allTasksWithUser(@Req() { user }) {
    return this.taskService.getAllTasksWithUser(user as User)
  }

  @Post("/start-task/:id")
  @UseGuards(AuthGuard)
  startTask(@Req() { user }, @Param("id") id: string) {
    return this.taskService.startTask(user, +id)
  }

  @Get("/goToLink/:telegram_id/:link/:id")
  @Redirect()
  goToLink(
    @Param("link") link: string,
    @Param("id") id: string,
    @Param("telegram_id") telegram_id: string,
  ) {
    return this.taskService.goToLink(link, +id, +telegram_id)
  }

  @Post("/claim-task-coins/:id")
  @UseGuards(AuthGuard)
  claimCoins(@Req() { user },  @Param("id") id: string) {
    return this.taskService.claimTaskCoins(user, +id)
  }
}
