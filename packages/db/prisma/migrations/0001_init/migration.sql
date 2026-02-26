-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'VIEWER');

-- CreateEnum
CREATE TYPE "RepoType" AS ENUM ('GITHUB', 'GITLAB', 'LOCAL');

-- CreateEnum
CREATE TYPE "DataSourceType" AS ENUM ('GITHUB', 'GITLAB', 'LOCAL_GIT', 'JIRA', 'SONARQUBE');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "repo_url" TEXT NOT NULL,
    "repo_type" "RepoType" NOT NULL DEFAULT 'GITHUB',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pull_requests" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "author_login" TEXT NOT NULL,
    "ai_used" BOOLEAN NOT NULL DEFAULT false,
    "ai_code_ratio" DOUBLE PRECISION,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,
    "changed_files" INTEGER NOT NULL DEFAULT 0,
    "commit_count" INTEGER NOT NULL DEFAULT 0,
    "review_comments" INTEGER NOT NULL DEFAULT 0,
    "review_rounds" INTEGER NOT NULL DEFAULT 0,
    "merged_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "rollback_flag" BOOLEAN NOT NULL DEFAULT false,
    "major_revision" BOOLEAN NOT NULL DEFAULT false,
    "merge_time" INTEGER,
    "conflict_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pull_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_metrics" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "cyclomatic_complexity" INTEGER NOT NULL DEFAULT 0,
    "lines_of_code" INTEGER NOT NULL DEFAULT 0,
    "change_frequency_90d" INTEGER NOT NULL DEFAULT 0,
    "author_count" INTEGER NOT NULL DEFAULT 0,
    "ai_code_ratio" DOUBLE PRECISION,
    "last_modified" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metric_snapshots" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL,
    "ai_success_rate" DOUBLE PRECISION,
    "ai_stable_rate" DOUBLE PRECISION,
    "total_prs" INTEGER NOT NULL DEFAULT 0,
    "ai_prs" INTEGER NOT NULL DEFAULT 0,
    "psri_score" DOUBLE PRECISION,
    "psri_structural" DOUBLE PRECISION,
    "psri_change" DOUBLE PRECISION,
    "psri_defect" DOUBLE PRECISION,
    "tdi_score" DOUBLE PRECISION,
    "avg_complexity" DOUBLE PRECISION,
    "total_files" INTEGER NOT NULL DEFAULT 0,
    "hotspot_files" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metric_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_jobs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "source" "DataSourceType" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "error" TEXT,
    "items_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_behaviors" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT,
    "event_type" TEXT NOT NULL,
    "file_path" TEXT,
    "session_duration" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_behaviors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_behaviors" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "file_path" TEXT,
    "prompt_hash" TEXT,
    "generation_count" INTEGER NOT NULL DEFAULT 0,
    "accepted_count" INTEGER NOT NULL DEFAULT 0,
    "rejected_count" INTEGER NOT NULL DEFAULT 0,
    "edit_distance" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_behaviors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decisions" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "last_used" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_configs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "structural" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "change" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "defect" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "architecture" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "runtime" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "coverage" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weight_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_project_id_user_id_key" ON "project_members"("project_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pull_requests_project_id_external_id_key" ON "pull_requests"("project_id", "external_id");

-- CreateIndex
CREATE INDEX "pull_requests_project_id_created_at_idx" ON "pull_requests"("project_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "file_metrics_project_id_file_path_key" ON "file_metrics"("project_id", "file_path");

-- CreateIndex
CREATE INDEX "file_metrics_project_id_change_frequency_90d_idx" ON "file_metrics"("project_id", "change_frequency_90d");

-- CreateIndex
CREATE INDEX "metric_snapshots_project_id_snapshot_date_idx" ON "metric_snapshots"("project_id", "snapshot_date");

-- CreateIndex
CREATE INDEX "collection_jobs_project_id_created_at_idx" ON "collection_jobs"("project_id", "created_at");

-- CreateIndex
CREATE INDEX "user_behaviors_project_id_event_type_idx" ON "user_behaviors"("project_id", "event_type");

-- CreateIndex
CREATE INDEX "ai_behaviors_project_id_tool_idx" ON "ai_behaviors"("project_id", "tool");

-- CreateIndex
CREATE INDEX "decisions_project_id_status_idx" ON "decisions"("project_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- CreateIndex
CREATE UNIQUE INDEX "weight_configs_project_id_key" ON "weight_configs"("project_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_metrics" ADD CONSTRAINT "file_metrics_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_snapshots" ADD CONSTRAINT "metric_snapshots_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_jobs" ADD CONSTRAINT "collection_jobs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_behaviors" ADD CONSTRAINT "user_behaviors_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_behaviors" ADD CONSTRAINT "ai_behaviors_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_configs" ADD CONSTRAINT "weight_configs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
