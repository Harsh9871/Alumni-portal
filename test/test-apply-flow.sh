#!/bin/bash

echo "🛠️ Testing Job Application Flow with Admin Token for User Creation"
echo "====================================="

BASE_URL="http://localhost:5000"
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsImlhdCI6MTc1ODQ3NzQ1NywiZXhwIjoxNzU5MDgyMjU3fQ.S0A5BEFuPv0DgAJk_rt-OOqvivqxcm_iVpcuGUd_d4g"

# Step 1: Create alumni user with admin token
echo ""
echo "👤 Creating alumni user with admin token..."
ALUMNI_SIGNUP=$(curl -s -X POST "$BASE_URL/user/admin" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "main",
    "password": "1234",
    "role": "ALUMNI"
  }')

if echo "$ALUMNI_SIGNUP" | grep -q '"success":true'; then
  echo "✅ Alumni user created"
else
  echo "⚠️ Alumni user may already exist or admin token invalid, attempting login..."
fi

# Step 2: Get alumni token
echo ""
echo "🔐 Getting alumni JWT token..."
export JWT_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "main",
    "password": "1234"
  }' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$JWT_TOKEN" ]; then
  echo "❌ Failed to get alumni token"
  echo "$ALUMNI_SIGNUP" | jq .
  exit 1
fi
echo "✅ Alumni token: ${JWT_TOKEN:0:20}..."

# Step 3: Create or update alumni details
echo ""
echo "📝 Setting up alumni profile..."
ALUMNI_PROFILE=$(curl -s -X PUT "$BASE_URL/user" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Main Alumni User",
    "bio": "Experienced software engineer with 5+ years of industry experience.",
    "mobile_number": "+91-9876543210",
    "gender": "Male",
    "email_address": "main@alumni.com",
    "dob": "1990-05-15T00:00:00.000Z",
    "profile_picture_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    "passing_batch": 2020,
    "degree_certificate": "https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=B.Tech+Certificate"
  }')

if echo "$ALUMNI_PROFILE" | grep -q '"success":true'; then
  echo "✅ Alumni profile updated: $(echo "$ALUMNI_PROFILE" | jq -r '.message')"
else
  echo "❌ Failed to update alumni profile:"
  echo "$ALUMNI_PROFILE" | jq .
  exit 1
fi

# Step 4: Verify alumni details
echo ""
echo "🔍 Verifying alumni details..."
ALUMNI_DETAILS=$(curl -s -X GET "$BASE_URL/user/me" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json")

if echo "$ALUMNI_DETAILS" | grep -q '"alumni":null' || ! echo "$ALUMNI_DETAILS" | grep -q '"alumni"'; then
  echo "❌ Alumni details not found in database, retrying profile creation..."
  ALUMNI_PROFILE_RETRY=$(curl -s -X PUT "$BASE_URL/user" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "full_name": "Main Alumni User",
      "bio": "Experienced software engineer with 5+ years of industry experience.",
      "mobile_number": "+91-9876543210",
      "gender": "Male",
      "email_address": "main@alumni.com",
      "dob": "1990-05-15T00:00:00.000Z",
      "profile_picture_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      "passing_batch": 2020,
      "degree_certificate": "https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=B.Tech+Certificate"
    }')
  if echo "$ALUMNI_PROFILE_RETRY" | grep -q '"success":true'; then
    echo "✅ Alumni profile retry successful"
  else
    echo "❌ Alumni profile retry failed:"
    echo "$ALUMNI_PROFILE_RETRY" | jq .
    exit 1
  fi
  # Re-verify after retry
  ALUMNI_DETAILS=$(curl -s -X GET "$BASE_URL/user/me" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json")
fi

if echo "$ALUMNI_DETAILS" | grep -q '"alumni":null' || ! echo "$ALUMNI_DETAILS" | grep -q '"alumni"'; then
  echo "❌ Alumni details still missing after retry:"
  echo "$ALUMNI_DETAILS" | jq '.data.alumni'
  exit 1
else
  echo "✅ Alumni details verified:"
  echo "$ALUMNI_DETAILS" | jq '.data.alumni | {full_name, email_address, passing_batch}'
fi

# Step 5: Create student user with admin token
echo ""
echo "👤 Creating student user with admin token..."
STUDENT_SIGNUP=$(curl -s -X POST "$BASE_URL/user/admin" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "student1",
    "password": "student1234",
    "role": "STUDENT"
  }')

if echo "$STUDENT_SIGNUP" | grep -q '"success":true'; then
  echo "✅ Student user created"
else
  echo "⚠️ Student user may already exist or admin token invalid, attempting login..."
fi

# Step 6: Get student token
echo ""
echo "🔐 Getting student JWT token..."
export STUDENT_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "student1",
    "password": "student1234"
  }' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$STUDENT_TOKEN" ]; then
  echo "❌ Failed to get student token"
  echo "$STUDENT_SIGNUP" | jq .
  exit 1
fi
echo "✅ Student token: ${STUDENT_TOKEN:0:20}..."

# Step 7: Create student details
echo ""
echo "📝 Setting up student profile..."
STUDENT_PROFILE=$(curl -s -X PUT "$BASE_URL/user" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Student One",
    "bio": "Computer Science student seeking internships",
    "mobile_number": "+91-9123456789",
    "gender": "Female",
    "email_address": "student1@university.com",
    "dob": "2002-03-10T00:00:00.000Z",
    "profile_picture_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    "github": "https://github.com/student1",
    "linked_in": "https://linkedin.com/in/student1",
    "about_us": "Passionate about web development and AI"
  }')

if echo "$STUDENT_PROFILE" | grep -q '"success":true'; then
  echo "✅ Student profile updated: $(echo "$STUDENT_PROFILE" | jq -r '.message')"
else
  echo "❌ Failed to update student profile:"
  echo "$STUDENT_PROFILE" | jq .
  exit 1
fi

# Step 8: Verify student details
echo ""
echo "🔍 Verifying student details..."
STUDENT_DETAILS=$(curl -s -X GET "$BASE_URL/user/me" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json")

if echo "$STUDENT_DETAILS" | grep -q '"student":null' || ! echo "$STUDENT_DETAILS" | grep -q '"student"'; then
  echo "❌ Student details not found, retrying profile creation..."
  STUDENT_PROFILE_RETRY=$(curl -s -X PUT "$BASE_URL/user" \
    -H "Authorization: Bearer $STUDENT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "full_name": "Student One",
      "bio": "Computer Science student seeking internships",
      "mobile_number": "+91-9123456789",
      "gender": "Female",
      "email_address": "student1@university.com",
      "dob": "2002-03-10T00:00:00.000Z",
      "profile_picture_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      "github": "https://github.com/student1",
      "linked_in": "https://linkedin.com/in/student1",
      "about_us": "Passionate about web development and AI"
    }')
  if echo "$STUDENT_PROFILE_RETRY" | grep -q '"success":true'; then
    echo "✅ Student profile retry successful"
  else
    echo "❌ Student profile retry failed:"
    echo "$STUDENT_PROFILE_RETRY" | jq .
    exit 1
  fi
  # Re-verify after retry
  STUDENT_DETAILS=$(curl -s -X GET "$BASE_URL/user/me" \
    -H "Authorization: Bearer $STUDENT_TOKEN" \
    -H "Content-Type: application/json")
fi

if echo "$STUDENT_DETAILS" | grep -q '"student":null' || ! echo "$STUDENT_DETAILS" | grep -q '"student"'; then
  echo "❌ Student details still missing after retry:"
  echo "$STUDENT_DETAILS" | jq '.data.student'
  exit 1
else
  echo "✅ Student details verified:"
  echo "$STUDENT_DETAILS" | jq '.data.student | {full_name, email_address}'
fi

# Step 9: Create a job with alumni account
echo ""
echo "➕ Creating test job..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/jobs" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "job_title": "Internship - Frontend Developer '$(date +%s)'",
    "job_description": "Join our team as a frontend intern to build amazing user interfaces.",
    "designation": "Frontend Intern",
    "location": "Remote",
    "mode": "WFH",
    "experience": "0-1 years",
    "salary": "₹20,000 - ₹30,000 per month",
    "vacancy": 2,
    "joining_date": "'$(date -d "+1 month" +%Y-%m-%d)'T00:00:00.000Z",
    "status": "OPEN",
    "open_till": "'$(date -d "+15 days" +%Y-%m-%d)'T23:59:59.000Z"
  }')

if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
  export JOB_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  echo "✅ Job created with ID: $JOB_ID"
else
  echo "❌ Failed to create job:"
  echo "$CREATE_RESPONSE" | jq .
  echo "🔍 Debugging: Checking alumni details again..."
  echo "$ALUMNI_DETAILS" | jq '.data | {user_id, role, alumni}'
  exit 1
fi

# Step 10: Apply for the job as student
echo ""
echo "📄 Applying for job as student..."
APPLY_RESPONSE=$(curl -s -X POST "$BASE_URL/apply/$JOB_ID" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json")

if echo "$APPLY_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Application submitted successfully!"
  echo "   Applicant: $(echo "$APPLY_RESPONSE" | jq -r '.data.user.student.full_name')"
  echo "   Job: $(echo "$APPLY_RESPONSE" | jq -r '.data.job.job_title')"
else
  echo "❌ Application failed:"
  echo "$APPLY_RESPONSE" | jq .
  exit 1
fi

# Step 11: View applications as alumni
echo ""
echo "🔍 Viewing applications as alumni..."
VIEW_RESPONSE=$(curl -s -X GET "$BASE_URL/apply/$JOB_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json")

if echo "$VIEW_RESPONSE" | grep -q '"success":true'; then
  APPLICANTS_COUNT=$(echo "$VIEW_RESPONSE" | jq -r '.data | length')
  echo "✅ Found $APPLICANTS_COUNT applicants"
  echo "$VIEW_RESPONSE" | jq '.data[] | {applicant: .user.student.full_name, applied_at}'
else
  echo "❌ Failed to view applications:"
  echo "$VIEW_RESPONSE" | jq .
fi

# Step 12: Delete application as student
echo ""
echo "🗑️ Deleting application as student..."
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/apply/$JOB_ID" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json")

if echo "$DELETE_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Application deleted successfully"
else
  echo "❌ Delete failed:"
  echo "$DELETE_RESPONSE" | jq .
fi

# Step 13: Verify application deletion
echo ""
echo "🔍 Verifying application deletion..."
VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/apply/$JOB_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json")

if echo "$VERIFY_RESPONSE" | grep -q '"success":true'; then
  APPLICANTS_COUNT=$(echo "$VERIFY_RESPONSE" | jq -r '.data | length')
  if [ "$APPLICANTS_COUNT" -eq 0 ]; then
    echo "✅ Application successfully deleted (no applicants found)"
  else
    echo "⚠️ Application still exists"
    echo "$VERIFY_RESPONSE" | jq '.data[] | {applicant: .user.student.full_name}'
  fi
else
  echo "❌ Failed to verify deletion:"
  echo "$VERIFY_RESPONSE" | jq .
fi

echo ""
echo "🎉 Application Flow Test Completed!"
echo "💾 Environment variables:"
echo "   JWT_TOKEN (alumni): ${JWT_TOKEN:0:20}..."
echo "   STUDENT_TOKEN: ${STUDENT_TOKEN:0:20}..."
echo "   JOB_ID: $JOB_ID"
echo "   ADMIN_TOKEN: ${ADMIN_TOKEN:0:20}..."
