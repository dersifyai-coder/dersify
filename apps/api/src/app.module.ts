import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiModule } from "./ai/ai.module";
import { AuthModule } from "./auth/auth.module";
import configuration from "./config/configuration";
import { CurriculumModule } from "./curriculum/curriculum.module";
import { LearnerModule } from "./learner/learner.module";
import { RagModule } from "./rag/rag.module";
import { SessionModule } from "./session/session.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    LearnerModule,
    AiModule,
    RagModule,
    CurriculumModule,
    SessionModule,
  ],
})
export class AppModule {}
