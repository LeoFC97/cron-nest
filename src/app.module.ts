/* istanbul ignore file */

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { HealthModule } from './health/health.module'
import { UserModule } from './user/user.module'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HealthModule, UserModule, ScheduleModule.forRoot()]
})
export class AppModule {}
