import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
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
  startTask(@Req() { user }, @Query("id") id: string) {
    return this.taskService.startTask(user, +id)
  }

  @Post("/goToLink/:link/:id")
  @UseGuards(AuthGuard)
  goToLink(
    @Req() { user }, 
    @Query("link") link: string,
    @Query("id") id: string,
    @Res() res: Response
  ) {
    return this.taskService.goToLink(user, res, link, +id)
  }

  @Post("/claim-task-coins/:id")
  @UseGuards(AuthGuard)
  claimCoins(@Req() { user },  @Query("id") id: string) {
    return this.taskService.claimTaskCoins(user, +id)
  }
}
