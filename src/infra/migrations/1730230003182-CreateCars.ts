import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCars1730230003182 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'car',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'plate',
            type: 'varchar',
            length: '7',
          },
          {
            name: 'brand',
            type: 'varchar',
            length: '127',
          },
          {
            name: 'model',
            type: 'varchar',
            length: '127',
          },
          {
            name: 'km',
            type: 'int',
          },
          {
            name: 'year',
            type: 'int',
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 12,
            scale: 2,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '8',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
            default: 'NULL',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('car');
  }
}
