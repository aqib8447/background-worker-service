-- DropIndex
DROP INDEX "workspace_slug_key";

-- AlterTable
ALTER TABLE "workspace" ALTER COLUMN "slug" DROP NOT NULL;
