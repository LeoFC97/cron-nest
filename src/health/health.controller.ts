import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { HealthCheck, HealthCheckService } from '@nestjs/terminus'
import { AppHealthIndicator } from './app.health'

@ApiTags('Health Check')
@Controller(['healthcheck', 'health'])
export class HealthController {
  constructor(private readonly health: HealthCheckService, private readonly appHealthIndicator: AppHealthIndicator) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Get application liveness' })
  public async check() {
    return this.health.check([async () => this.appHealthIndicator.isHealthy('app')])
  }
}
