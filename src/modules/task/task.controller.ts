import { Body, Controller, Get, Param, Post, Redirect, Req, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { ITaskCreate } from 'src/entities/task.model';
import { User } from 'src/entities/user.model';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('task')
export class TaskController {
  constructor(
    private readonly taskService: TaskService
    ) {}

  @Post("/create")
  @UseGuards(AuthGuard)
  createTask(@Body() task: ITaskCreate) {
    return this.taskService.createTask(task)
  }

  @Post("/create-sub/:id")
  @UseGuards(AuthGuard)
  createSubTask(@Body() task: ITaskCreate, @Param("id") id: string) {
    return this.taskService.createSubTask(task, +id)
  }

  @Get("/all-tasks-with-user")
  @UseGuards(AuthGuard)
  allTasksWithUser(@Req() { user }) {
    return this.taskService.getAllTasksWithUser(user as User)
  }

  @Get("/task-with-user/:id")
  @UseGuards(AuthGuard)
  taskById(@Req() { user }, @Param("id") id: string) {
    return this.taskService.getTaskWithUserById(user as User, +id)
  }

  @Post("/start-task/:id")
  @UseGuards(AuthGuard)
  startTask(@Req() { user }, @Param("id") id: string) {
    return this.taskService.startTask(user, +id)
  }

  @Post("/complete-main/:id")
  @UseGuards(AuthGuard)
  completeMain(@Req() { user }, @Param("id") id: string) {
    return this.taskService.completeMainTask(user as User, +id)
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

  @Post("/check-subscribe/:id")
  @UseGuards(AuthGuard)
  checkSubscribe(@Param("id") id: string, @Req() { user }) {
    return this.taskService.checkSubscribe(user as User, +id)
  }

  @Post("/claim-task-coins/:id")
  @UseGuards(AuthGuard)
  claimCoins(@Req() { user },  @Param("id") id: string) {
    return this.taskService.claimTaskCoins(user, +id)
  }
}
