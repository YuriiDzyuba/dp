import { MigrationInterface, QueryRunner } from 'typeorm';

export class addLikedPoststoUserEntity1636542469904
  implements MigrationInterface
{
  name = 'addLikedPoststoUserEntity1636542469904';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users_liked_posts_posts" ("usersId" integer NOT NULL, "postsId" integer NOT NULL, CONSTRAINT "PK_dabc63ed6d0b36c1b401ff0eb1b" PRIMARY KEY ("usersId", "postsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_262d0acbed6a2865beb9a68f33" ON "users_liked_posts_posts" ("usersId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eb68cd8837fcd1bbaced863e8d" ON "users_liked_posts_posts" ("postsId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users_liked_posts_posts" ADD CONSTRAINT "FK_262d0acbed6a2865beb9a68f334" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_liked_posts_posts" ADD CONSTRAINT "FK_eb68cd8837fcd1bbaced863e8d3" FOREIGN KEY ("postsId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_liked_posts_posts" DROP CONSTRAINT "FK_eb68cd8837fcd1bbaced863e8d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_liked_posts_posts" DROP CONSTRAINT "FK_262d0acbed6a2865beb9a68f334"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_eb68cd8837fcd1bbaced863e8d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_262d0acbed6a2865beb9a68f33"`,
    );
    await queryRunner.query(`DROP TABLE "users_liked_posts_posts"`);
  }
}
