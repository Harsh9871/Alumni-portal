-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'CLOSED', 'ON_HOLD');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentDetails" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "email_address" TEXT NOT NULL,
    "linked_in" TEXT NOT NULL,
    "github" TEXT NOT NULL,
    "about_us" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "profile_picture_url" TEXT NOT NULL,
    "resume" TEXT NOT NULL,

    CONSTRAINT "StudentDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlumniDetails" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "email_address" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "profile_picture_url" TEXT NOT NULL,
    "passing_batch" INTEGER NOT NULL,
    "degree_certificate" TEXT NOT NULL,

    CONSTRAINT "AlumniDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "job_description" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "salary" TEXT NOT NULL,
    "vacancy" INTEGER NOT NULL,
    "joining_date" TIMESTAMP(3) NOT NULL,
    "status" "JobStatus" NOT NULL,
    "open_till" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplied" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "applied_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplied_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_id_key" ON "User"("user_id");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_is_deleted_idx" ON "User"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "StudentDetails_user_id_key" ON "StudentDetails"("user_id");

-- CreateIndex
CREATE INDEX "StudentDetails_full_name_idx" ON "StudentDetails"("full_name");

-- CreateIndex
CREATE INDEX "StudentDetails_email_address_idx" ON "StudentDetails"("email_address");

-- CreateIndex
CREATE UNIQUE INDEX "AlumniDetails_user_id_key" ON "AlumniDetails"("user_id");

-- CreateIndex
CREATE INDEX "AlumniDetails_full_name_idx" ON "AlumniDetails"("full_name");

-- CreateIndex
CREATE INDEX "AlumniDetails_email_address_idx" ON "AlumniDetails"("email_address");

-- CreateIndex
CREATE INDEX "AlumniDetails_passing_batch_idx" ON "AlumniDetails"("passing_batch");

-- CreateIndex
CREATE INDEX "Job_user_id_idx" ON "Job"("user_id");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_is_deleted_idx" ON "Job"("is_deleted");

-- CreateIndex
CREATE INDEX "Job_open_till_idx" ON "Job"("open_till");

-- CreateIndex
CREATE INDEX "Job_job_title_idx" ON "Job"("job_title");

-- CreateIndex
CREATE INDEX "JobApplied_user_id_idx" ON "JobApplied"("user_id");

-- CreateIndex
CREATE INDEX "JobApplied_job_id_idx" ON "JobApplied"("job_id");

-- CreateIndex
CREATE INDEX "JobApplied_applied_at_idx" ON "JobApplied"("applied_at");

-- AddForeignKey
ALTER TABLE "StudentDetails" ADD CONSTRAINT "StudentDetails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumniDetails" ADD CONSTRAINT "AlumniDetails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplied" ADD CONSTRAINT "JobApplied_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplied" ADD CONSTRAINT "JobApplied_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
