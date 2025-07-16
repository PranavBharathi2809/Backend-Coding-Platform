import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1752650265112 implements MigrationInterface {
    name = 'InitMigration1752650265112'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test_cases" DROP CONSTRAINT "test_cases_problem_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "function_names" DROP CONSTRAINT "function_names_problem_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "function_names" DROP CONSTRAINT "function_names_language_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "function_signatures" DROP CONSTRAINT "function_signatures_problem_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "function_signatures" DROP CONSTRAINT "function_signatures_language_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "test_cases" DROP COLUMN "is_hidden"`);
        await queryRunner.query(`ALTER TABLE "test_cases" ADD "isHidden" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "test_cases" ALTER COLUMN "problemId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "languages" DROP CONSTRAINT "languages_name_key"`);
        await queryRunner.query(`ALTER TABLE "languages" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "languages" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "languages" ADD CONSTRAINT "UQ_9c0e155475f0aa782e4a6178969" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "languages" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "languages" ADD "version" character varying`);
        await queryRunner.query(`ALTER TABLE "function_names" ALTER COLUMN "problemId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "function_names" ALTER COLUMN "languageId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "function_names" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "function_names" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "function_signatures" ALTER COLUMN "problemId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "function_signatures" ALTER COLUMN "languageId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "problems" DROP CONSTRAINT "problems_key_key"`);
        await queryRunner.query(`ALTER TABLE "problems" DROP COLUMN "key"`);
        await queryRunner.query(`ALTER TABLE "problems" ADD "key" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "problems" ADD CONSTRAINT "UQ_20ea4195e6fd9e514fbf17c4944" UNIQUE ("key")`);
        await queryRunner.query(`ALTER TABLE "problems" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "problems" ADD "title" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "problems" ALTER COLUMN "description" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "problems" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "problems" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "problems" ADD "title" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "problems" DROP CONSTRAINT "UQ_20ea4195e6fd9e514fbf17c4944"`);
        await queryRunner.query(`ALTER TABLE "problems" DROP COLUMN "key"`);
        await queryRunner.query(`ALTER TABLE "problems" ADD "key" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "problems" ADD CONSTRAINT "problems_key_key" UNIQUE ("key")`);
        await queryRunner.query(`ALTER TABLE "function_signatures" ALTER COLUMN "languageId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "function_signatures" ALTER COLUMN "problemId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "function_names" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "function_names" ADD "name" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "function_names" ALTER COLUMN "languageId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "function_names" ALTER COLUMN "problemId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "languages" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "languages" ADD "version" text`);
        await queryRunner.query(`ALTER TABLE "languages" DROP CONSTRAINT "UQ_9c0e155475f0aa782e4a6178969"`);
        await queryRunner.query(`ALTER TABLE "languages" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "languages" ADD "name" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "languages" ADD CONSTRAINT "languages_name_key" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "test_cases" ALTER COLUMN "problemId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "test_cases" DROP COLUMN "isHidden"`);
        await queryRunner.query(`ALTER TABLE "test_cases" ADD "is_hidden" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "function_signatures" ADD CONSTRAINT "function_signatures_language_id_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "function_signatures" ADD CONSTRAINT "function_signatures_problem_id_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "function_names" ADD CONSTRAINT "function_names_language_id_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "function_names" ADD CONSTRAINT "function_names_problem_id_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_problem_id_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
