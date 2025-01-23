import { forwardRef, Module } from "@nestjs/common";
import { PoliciesService } from "./policies.service";
import { PoliciesController } from "./policies.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Policy, PolicySchema } from "./schemas/policy.schema";
import { AuthModule } from "src/auth/auth.module";
import { UsersModule } from "src/users/users.module";
import { DatasetsModule } from "src/datasets/datasets.module";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";

@Module({
  controllers: [PoliciesController],
  imports: [
    AuthModule,
    forwardRef(() => DatasetsModule),
    MongooseModule.forFeature([
      {
        name: Policy.name,
        schema: PolicySchema,
      },
    ]),
    UsersModule,
  ],
  providers: [PoliciesService, CaslAbilityFactory],
  exports: [PoliciesService],
})
export class PoliciesModule {}
