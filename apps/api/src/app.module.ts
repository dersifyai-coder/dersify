import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiModule } from "./ai/ai.module";
import { AuthModule } from "./auth/auth.module";
import configuration from "./config/configuration";
import { CurriculumModule } from "./curriculum/curriculum.module";
import { LearnerModule } from "./learner/learner.module";
import { RagModule } from "./rag/rag.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
    LearnerModule,
    AiModule,
    RagModule,
    CurriculumModule,
  ],
})
export class AppModule {}
