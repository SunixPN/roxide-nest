import { Injectable, Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { UserService } from './user.service';

@Injectable()
export class UserServiceFactory implements OnModuleInit {
  private static userService: UserService;

  constructor(private readonly moduleRef: ModuleRef) {}

  onModuleInit() {
    UserServiceFactory.userService = this.moduleRef.get(UserService, { strict: false });
  }

  static getUserService(): UserService {
    return UserServiceFactory.userService;
  }
}

@Module({
  providers: [UserServiceFactory],
  exports: [UserServiceFactory],
})

export class UserServiceFactoryModule {}