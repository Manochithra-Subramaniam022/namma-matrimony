-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "PhysicalCondition" AS ENUM ('SLIM', 'AVERAGE', 'FAT');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'AWAITING_DIVORCE');

-- CreateEnum
CREATE TYPE "FamilyStatus" AS ENUM ('MIDDLE', 'UPPER_MIDDLE', 'HIGH', 'VIP', 'LOW');

-- CreateEnum
CREATE TYPE "Habit" AS ENUM ('NONE', 'OCCASIONAL', 'REGULAR');

-- CreateEnum
CREATE TYPE "ParentLivingStatus" AS ENUM ('ALIVE', 'LATE');

-- CreateEnum
CREATE TYPE "WorkNature" AS ENUM ('JOB', 'BUSINESS', 'NOT_WORKING');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'MATCHED_REMOVED');

-- CreateEnum
CREATE TYPE "ProfileSentStatus" AS ENUM ('SENT', 'NOT_MATCHED');

-- CreateEnum
CREATE TYPE "PasswordResetStatus" AS ENUM ('PENDING', 'RESOLVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "mobile_no" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userIndex" INTEGER,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "userid" TEXT,
    "paymentScreenshot" TEXT,
    "whatsappProfileDeliveryNumber" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "livingCountry" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "religion" TEXT NOT NULL,
    "caste" TEXT NOT NULL,
    "subCaste" TEXT,
    "koottam" TEXT,
    "dob" TIMESTAMP(3) NOT NULL,
    "tob" TEXT,
    "lob" TEXT,
    "height" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "physicalCondition" "PhysicalCondition" NOT NULL,
    "skinColour" TEXT NOT NULL,
    "maritalStatus" "MaritalStatus" NOT NULL,
    "familyStatus" "FamilyStatus" NOT NULL,
    "foodHabits" "Habit" NOT NULL,
    "drinkingHabits" "Habit" NOT NULL,
    "smokingHabits" "Habit" NOT NULL,
    "rasi" TEXT,
    "nakshatra" TEXT,
    "poruthaNakshatram" TEXT[],
    "dosham" TEXT,
    "jathakamUrl" TEXT,
    "photoUrl" TEXT,
    "casteCertificateUrl" TEXT,
    "hideMobileNo" BOOLEAN NOT NULL DEFAULT true,
    "hideHouseAddress" BOOLEAN NOT NULL DEFAULT true,
    "hideHouseLocation" BOOLEAN NOT NULL DEFAULT true,
    "status" "ProfileStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "rejectedReason" TEXT,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "amsamGrid" JSONB,
    "dasaBalance" TEXT,
    "hidePhoto" BOOLEAN NOT NULL DEFAULT false,
    "houseAddress" TEXT,
    "rasiGrid" JSONB,
    "jathagamData" JSONB,
    "idProofUrl" TEXT,
    "displayId" TEXT,
    "houseLocation" TEXT,
    "profileCreatedBy" TEXT,
    "reviewerId" TEXT,
    "childrenAge" TEXT,
    "childrenGender" TEXT,
    "haveChildren" BOOLEAN,
    "numberOfChildren" INTEGER,
    "yearOfDivorce" TEXT,
    "yearOfMarriage" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "degreeName" TEXT NOT NULL,
    "institution" TEXT NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fatherName" TEXT,
    "fatherLivingStatus" "ParentLivingStatus",
    "fatherStatus" TEXT,
    "fatherMobile" TEXT,
    "motherName" TEXT,
    "motherLivingStatus" "ParentLivingStatus",
    "motherStatus" TEXT,
    "motherMobile" TEXT,
    "workNature" "WorkNature",
    "salary" TEXT,
    "organisation" TEXT,
    "designation" TEXT,
    "workingAddress" TEXT,
    "googleLocation" TEXT,
    "rentalIncome" TEXT,
    "houseType" TEXT,
    "houseSqFt" TEXT,
    "siteLand" TEXT,
    "thottam" TEXT,
    "vacantLand" TEXT,
    "totalAssetValue" TEXT,
    "assetComments" TEXT,
    "dowryDetails" TEXT,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sibling" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Sibling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expectations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expectedHeight" DOUBLE PRECISION,
    "colourPreference" TEXT,
    "maxAgeLimit" INTEGER,
    "dowryExpectation" TEXT,
    "preferredSectors" TEXT[],
    "preferredLocations" TEXT[],
    "expectedIncome" TEXT,
    "expectsRentalIncome" BOOLEAN,
    "expectsThottam" BOOLEAN,
    "vacantLand" TEXT,
    "preferredDistanceRadius" INTEGER,
    "city" TEXT,
    "preferredResidentArea" TEXT[],
    "residentAreaComments" TEXT,
    "preferredFamilyType" TEXT,
    "comments" TEXT,
    "referredBy" TEXT,
    "expectsVacantLand" BOOLEAN,
    "acceptsDivorced" BOOLEAN,

    CONSTRAINT "Expectations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactApproval" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileSentLog" (
    "id" SERIAL NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "status" "ProfileSentStatus" NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileSentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NakshatraCompatibility" (
    "id" TEXT NOT NULL,
    "maleNakshatra" TEXT NOT NULL,
    "femaleNakshatra" TEXT NOT NULL,
    "compatibilityScore" INTEGER NOT NULL,
    "compatibilityType" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NakshatraCompatibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default_settings',
    "minMaleAge" INTEGER NOT NULL DEFAULT 21,
    "minFemaleAge" INTEGER NOT NULL DEFAULT 18,
    "maxPhotoSizeMb" INTEGER NOT NULL DEFAULT 5,
    "maxDocSizeMb" INTEGER NOT NULL DEFAULT 10,
    "featuredProfilesLimit" INTEGER NOT NULL DEFAULT 12,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "adminName" TEXT,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasteLookup" (
    "id" SERIAL NOT NULL,
    "religion" TEXT NOT NULL,
    "caste" TEXT NOT NULL,
    "subcaste" TEXT NOT NULL,

    CONSTRAINT "CasteLookup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shortlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shortlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "PasswordResetStatus" NOT NULL DEFAULT 'PENDING',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpVerification" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroCarouselItem" (
    "id" TEXT NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'IMAGE',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroCarouselItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_no_key" ON "User"("mobile_no");

-- CreateIndex
CREATE UNIQUE INDEX "User_userid_key" ON "User"("userid");

-- CreateIndex
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_displayId_key" ON "Profile"("displayId");

-- CreateIndex
CREATE INDEX "Profile_status_isLive_idx" ON "Profile"("status", "isLive");

-- CreateIndex
CREATE UNIQUE INDEX "Family_userId_key" ON "Family"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Expectations_userId_key" ON "Expectations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactApproval_requesterId_recipientId_key" ON "ContactApproval"("requesterId", "recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileSentLog_targetUserId_recipientUserId_key" ON "ProfileSentLog"("targetUserId", "recipientUserId");

-- CreateIndex
CREATE INDEX "NakshatraCompatibility_maleNakshatra_idx" ON "NakshatraCompatibility"("maleNakshatra");

-- CreateIndex
CREATE INDEX "NakshatraCompatibility_femaleNakshatra_idx" ON "NakshatraCompatibility"("femaleNakshatra");

-- CreateIndex
CREATE UNIQUE INDEX "NakshatraCompatibility_maleNakshatra_femaleNakshatra_key" ON "NakshatraCompatibility"("maleNakshatra", "femaleNakshatra");

-- CreateIndex
CREATE INDEX "AdminAuditLog_adminId_createdAt_idx" ON "AdminAuditLog"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_action_idx" ON "AdminAuditLog"("action");

-- CreateIndex
CREATE INDEX "CasteLookup_religion_idx" ON "CasteLookup"("religion");

-- CreateIndex
CREATE INDEX "CasteLookup_religion_caste_idx" ON "CasteLookup"("religion", "caste");

-- CreateIndex
CREATE UNIQUE INDEX "Shortlist_userId_targetId_key" ON "Shortlist"("userId", "targetId");

-- CreateIndex
CREATE INDEX "PasswordResetRequest_status_idx" ON "PasswordResetRequest"("status");

-- CreateIndex
CREATE INDEX "PasswordResetRequest_isRead_idx" ON "PasswordResetRequest"("isRead");

-- CreateIndex
CREATE INDEX "OtpVerification_phone_idx" ON "OtpVerification"("phone");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Family" ADD CONSTRAINT "Family_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sibling" ADD CONSTRAINT "Sibling_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expectations" ADD CONSTRAINT "Expectations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactApproval" ADD CONSTRAINT "ContactApproval_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactApproval" ADD CONSTRAINT "ContactApproval_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileSentLog" ADD CONSTRAINT "ProfileSentLog_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileSentLog" ADD CONSTRAINT "ProfileSentLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shortlist" ADD CONSTRAINT "Shortlist_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shortlist" ADD CONSTRAINT "Shortlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetRequest" ADD CONSTRAINT "PasswordResetRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

