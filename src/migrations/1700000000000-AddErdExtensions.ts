/* eslint-disable linebreak-style */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddErdExtensions1700000000000 implements MigrationInterface {
  name = 'AddErdExtensions1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for stock movement type
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE stock_movement_type_enum AS ENUM ('inbound', 'outbound', 'reserve', 'release', 'adjust');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create stocks table first (if not exists) - needed for foreign key
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS stocks (
        "StockID" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "skuId" uuid UNIQUE NOT NULL,
        qty_outbound integer DEFAULT 0,
        qty_inbound integer DEFAULT 0,
        qty_on_hand integer DEFAULT 0,
        qty_reserved integer DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // Create index for stocks
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_stocks_sku_id ON stocks("skuId");
    `);

    // stock_movements
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "stockId" uuid NOT NULL,
        type stock_movement_type_enum NOT NULL,
        quantity integer NOT NULL,
        "referenceType" varchar(255),
        "referenceId" varchar(255),
        note varchar(500),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT fk_stock_movements_stock FOREIGN KEY ("stockId") REFERENCES stocks("StockID") ON DELETE CASCADE
      );
    `);

    // Create index for stock_movements
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_stock_movements_stock_id ON stock_movements("stockId");
    `);

    // shipment_items (FKs will be added later if parent tables exist)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS shipment_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "shipmentId" uuid NOT NULL,
        "orderItemId" uuid NOT NULL,
        quantity integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // Add foreign keys only if parent tables exist
    const shipmentTableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'shipments'
      );
    `);
    if (shipmentTableExists[0].exists) {
      await queryRunner.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'fk_shipment_items_shipment'
          ) THEN
            ALTER TABLE shipment_items 
            ADD CONSTRAINT fk_shipment_items_shipment 
            FOREIGN KEY ("shipmentId") REFERENCES shipments("Ship_ID") ON DELETE CASCADE;
          END IF;
        END $$;
      `);
    }

    const orderItemsTableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'order_items'
      );
    `);
    if (orderItemsTableExists[0].exists) {
      await queryRunner.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'fk_shipment_items_order_item'
          ) THEN
            ALTER TABLE shipment_items 
            ADD CONSTRAINT fk_shipment_items_order_item 
            FOREIGN KEY ("orderItemId") REFERENCES order_items(id) ON DELETE CASCADE;
          END IF;
        END $$;
      `);
    }

    // Create indexes for shipment_items
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_shipment_items_shipment_id ON shipment_items("shipmentId");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_shipment_items_order_item_id ON shipment_items("orderItemId");
    `);

    // packaging (if not exists)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS packagings (
        "PKG_ID" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) NOT NULL,
        max_weight decimal(10,2) NOT NULL,
        cost decimal(10,2),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // return_reasons
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS return_reasons (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        reason varchar(255) NOT NULL,
        description text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // employees
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS employees (
        "EmpID" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name varchar(255) NOT NULL,
        role varchar(100),
        shift varchar(50),
        salary numeric(12,2),
        createdAt TIMESTAMP NOT NULL DEFAULT now(),
        updatedAt TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // sizes
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS sizes (
        "SizeCode" varchar(20) PRIMARY KEY,
        chest_len integer,
        length_len integer,
        createdAt TIMESTAMP NOT NULL DEFAULT now(),
        updatedAt TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // materials
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) NOT NULL,
        composition varchar(255),
        gsm integer,
        stretchable boolean DEFAULT false,
        care varchar(255),
        createdAt TIMESTAMP NOT NULL DEFAULT now(),
        updatedAt TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // print_methods
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS print_methods (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) NOT NULL,
        description text,
        notes varchar(255),
        createdAt TIMESTAMP NOT NULL DEFAULT now(),
        updatedAt TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // assets
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) NOT NULL,
        url varchar(500) NOT NULL,
        "mimeType" varchar(100),
        "sizeBytes" integer,
        "isActive" boolean DEFAULT true,
        "uploadedBy" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // Add foreign key only if users table exists
    const usersTableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    if (usersTableExists[0].exists) {
      await queryRunner.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'fk_assets_user'
          ) THEN
            ALTER TABLE assets 
            ADD CONSTRAINT fk_assets_user 
            FOREIGN KEY ("uploadedBy") REFERENCES users("UserID") ON DELETE SET NULL;
          END IF;
        END $$;
      `);
    }

    // Create index for assets
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_assets_uploaded_by ON assets("uploadedBy");
    `);

    // asset_disposals
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS asset_disposals (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "assetId" uuid NOT NULL,
        "disposedBy" uuid,
        reason varchar(255) NOT NULL,
        note varchar(500),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT fk_asset_disposals_asset FOREIGN KEY ("assetId") REFERENCES assets(id) ON DELETE CASCADE
      );
    `);

    // Add foreign key to users only if users table exists
    const usersTableExistsForDisposals = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    if (usersTableExistsForDisposals[0].exists) {
      await queryRunner.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'fk_asset_disposals_user'
          ) THEN
            ALTER TABLE asset_disposals 
            ADD CONSTRAINT fk_asset_disposals_user 
            FOREIGN KEY ("disposedBy") REFERENCES users("UserID") ON DELETE SET NULL;
          END IF;
        END $$;
      `);
    }

    // Create index for asset_disposals
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_asset_disposals_asset_id ON asset_disposals("assetId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS asset_disposals;`);
    await queryRunner.query(`DROP TABLE IF EXISTS assets;`);
    await queryRunner.query(`DROP TABLE IF EXISTS shipment_items;`);
    await queryRunner.query(`DROP TABLE IF EXISTS stock_movements;`);
    await queryRunner.query(`DROP TYPE IF EXISTS stock_movement_type_enum;`);
    // Keep master data tables (packagings, return_reasons, employees, sizes, materials, print_methods) to avoid data loss.
  }
}
