#!/bin/bash

# Apply CRUD Testing Script
# Usage: ./apply-testing.sh

BASE_URL="http://localhost:5000"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Job Applications CRUD Testing Script ===${NC}"
echo ""

# Check if jq is available
if command -v jq &> /dev/null; then
    USE_JQ=true
else
    USE_JQ=false
    echo -e "${YELLOW}jq not found, using basic JSON parsing${NC}"
fi

# Function to extract JSON field
extract_field() {
    local json="$1"
    local field="$2"
    
    if [ "$USE_JQ" = true ]; then
        echo "$json" | jq -r ".$field // empty" 2>/dev/null
    else
        echo "$json" | grep -o "\"$field\":\"[^\"]*" | cut -d'"' -f4
    fi
}

# Function to extract JSON field from data object
extract_data_field() {
    local json="$1"
    local field="$2"
    
    if [ "$USE_JQ" = true ]; then
        echo "$json" | jq -r ".data.$field // empty" 2>/dev/null
    else
        local value=$(echo "$json" | grep -o "\"data\":{[^}]*\"$field\":\"[^\"]*" | grep -o "\"$field\":\"[^\"]*" | cut -d'"' -f4)
        echo "$value"
    fi
}

# Function to make API calls
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    echo -e "${YELLOW}Making $method request to: $endpoint${NC}"
    
    if [ -z "$token" ]; then
        response=$(curl -s --max-time 30 -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -w " HTTP_STATUS:%{http_code}")
    else
        response=$(curl -s --max-time 30 -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data" \
            -w " HTTP_STATUS:%{http_code}")
    fi
    
    body=$(echo "$response" | sed -E 's/ HTTP_STATUS\:[0-9]{3}$//')
    status=$(echo "$response" | tr -d '\n' | sed -E 's/.*HTTP_STATUS:([0-9]{3})$/\1/')
    
    if [ -z "$status" ]; then
        status="000"
    fi
    
    echo "Status: $status"
    echo "Response: $body"
    echo ""
}

# Get future dates for testing
FUTURE_DATE_30=$(date -d "+30 days" +"%Y-%m-%dT00:00:00.000Z")
OPEN_TILL_30=$(date -d "+30 days" +"%Y-%m-%dT23:59:59.000Z")

# Step 1: Login as student
echo -e "${GREEN}Step 1: Logging in as student${NC}"
LOGIN_DATA='{"user_id": "student1", "password": "student1234"}'
make_request "POST" "/auth/login" "$LOGIN_DATA"

STUDENT_TOKEN=$(extract_field "$body" "token")
STUDENT_ID=$(extract_field "$body" "id")

if [ -z "$STUDENT_TOKEN" ]; then
    echo -e "${RED}❌ Student login failed!${NC}"
    echo -e "${YELLOW}Please ensure student user exists with user_id: student and password: student1234${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Student login successful!${NC}"
echo ""

# Step 2: Login as alumni to create a test job
echo -e "${GREEN}Step 2: Logging in as alumni to create test job${NC}"
ALUMNI_LOGIN_DATA='{"user_id": "main07", "password": "1234"}'
make_request "POST" "/auth/login" "$ALUMNI_LOGIN_DATA"

ALUMNI_TOKEN=$(extract_field "$body" "token")
ALUMNI_ID=$(extract_field "$body" "id")

if [ -z "$ALUMNI_TOKEN" ]; then
    echo -e "${RED}❌ Alumni login failed!${NC}"
    echo -e "${YELLOW}Please ensure alumni user exists with user_id: main07 and password: 1234${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Alumni login successful!${NC}"
echo ""

sleep 2

# Step 3: Create a test job as alumni
echo -e "${GREEN}Step 3: Creating test job as alumni${NC}"
JOB_DATA=$(cat <<EOF
{
    "job_title": "Test Job for Student Applications",
    "job_description": "This is a test job for application testing purposes. Students can apply for this position.",
    "designation": "Junior Test Developer",
    "location": "Remote",
    "mode": "Remote",
    "experience": "0-2 years",
    "salary": "₹5-8 LPA",
    "vacancy": 3,
    "joining_date": "$FUTURE_DATE_30",
    "status": "OPEN",
    "open_till": "$OPEN_TILL_30"
}
EOF
)
make_request "POST" "/jobs" "$JOB_DATA" "$ALUMNI_TOKEN"

TEST_JOB_ID=$(extract_data_field "$body" "id")

if [ -n "$TEST_JOB_ID" ]; then
    echo -e "${GREEN}✅ Test job created: $TEST_JOB_ID${NC}"
else
    echo -e "${YELLOW}⚠️ Failed to create test job, trying to use existing job...${NC}"
    # Try to get existing job
    make_request "GET" "/jobs" "" "$ALUMNI_TOKEN"
    # Extract first job ID from response
    if [ "$USE_JQ" = true ]; then
        TEST_JOB_ID=$(echo "$body" | jq -r '.data.jobs[0].id // empty' 2>/dev/null)
    else
        TEST_JOB_ID=$(echo "$body" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    fi
fi

if [ -z "$TEST_JOB_ID" ]; then
    echo -e "${RED}❌ No job available for testing${NC}"
    exit 1
fi

echo -e "${GREEN}Using Job ID: $TEST_JOB_ID${NC}"
echo ""

sleep 2

# Step 4: Student applies for the job
echo -e "${GREEN}Step 4: Student applying for job${NC}"
make_request "POST" "/apply/$TEST_JOB_ID" "{}" "$STUDENT_TOKEN"

APPLICATION_ID=$(extract_data_field "$body" "id")

if [ -n "$APPLICATION_ID" ]; then
    echo -e "${GREEN}✅ Application submitted successfully!${NC}"
    echo -e "${GREEN}Application ID: $APPLICATION_ID${NC}"
else
    echo -e "${YELLOW}⚠️ Application submission may have failed${NC}"
fi

sleep 1

# Step 5: Try to apply again (should fail with duplicate application)
echo -e "${GREEN}Step 5: Trying to apply again (should fail)${NC}"
make_request "POST" "/apply/$TEST_JOB_ID" "{}" "$STUDENT_TOKEN"

sleep 1

# Step 6: Alumni views applications for the job
echo -e "${GREEN}Step 6: Alumni viewing applications${NC}"
make_request "GET" "/apply/$TEST_JOB_ID" "" "$ALUMNI_TOKEN"

sleep 1

# Step 7: Student tries to view applications (should fail - permission denied)
echo -e "${GREEN}Step 7: Student trying to view applications (should fail)${NC}"
make_request "GET" "/apply/$TEST_JOB_ID" "" "$STUDENT_TOKEN"

sleep 1

# Step 8: Student deletes their application
echo -e "${GREEN}Step 8: Student deleting application${NC}"
make_request "DELETE" "/apply/$TEST_JOB_ID" "" "$STUDENT_TOKEN"

sleep 1

# Step 9: Try to delete again (should fail - application not found)
echo -e "${GREEN}Step 9: Trying to delete non-existent application${NC}"
make_request "DELETE" "/apply/$TEST_JOB_ID" "" "$STUDENT_TOKEN"

sleep 1

# Step 10: Apply again after deletion
echo -e "${GREEN}Step 10: Applying again after deletion${NC}"
make_request "POST" "/apply/$TEST_JOB_ID" "{}" "$STUDENT_TOKEN"

sleep 1

# Step 11: Test with invalid job ID
echo -e "${GREEN}Step 11: Testing with invalid job ID${NC}"
make_request "POST" "/apply/invalid-job-id-123" "{}" "$STUDENT_TOKEN"

sleep 1

# Step 12: Create a closed job and try to apply
echo -e "${GREEN}Step 12: Testing application to closed job${NC}"
CLOSED_JOB_DATA=$(cat <<EOF
{
    "job_title": "Closed Test Job - No Applications",
    "job_description": "This job is closed for applications. Students should not be able to apply.",
    "designation": "Closed Position",
    "location": "Office",
    "mode": "On-site",
    "experience": "3-5 years",
    "salary": "₹10-15 LPA",
    "vacancy": 1,
    "joining_date": "$FUTURE_DATE_30",
    "status": "CLOSED",
    "open_till": "$OPEN_TILL_30"
}
EOF
)
make_request "POST" "/jobs" "$CLOSED_JOB_DATA" "$ALUMNI_TOKEN"

CLOSED_JOB_ID=$(extract_data_field "$body" "id")

if [ -n "$CLOSED_JOB_ID" ]; then
    echo -e "${GREEN}✅ Closed job created: $CLOSED_JOB_ID${NC}"
    make_request "POST" "/apply/$CLOSED_JOB_ID" "{}" "$STUDENT_TOKEN"
else
    echo -e "${YELLOW}⚠️ Could not create closed job, skipping test${NC}"
fi

sleep 1

# Step 13: Final check - Alumni views applications again
echo -e "${GREEN}Step 13: Final check - Alumni viewing all applications${NC}"
make_request "GET" "/apply/$TEST_JOB_ID" "" "$ALUMNI_TOKEN"

echo -e "${GREEN}=== Testing Complete ===${NC}"
echo ""

# Calculate results
echo -e "${YELLOW}=== Detailed Test Results ===${NC}"

# Test 1: Student Login
if [ -n "$STUDENT_TOKEN" ]; then
    echo -e "✅ Student Login: SUCCESS"
else
    echo -e "❌ Student Login: FAILED"
fi

# Test 2: Alumni Login
if [ -n "$ALUMNI_TOKEN" ]; then
    echo -e "✅ Alumni Login: SUCCESS"
else
    echo -e "❌ Alumni Login: FAILED"
fi

# Test 3: Job Creation/Retrieval
if [ -n "$TEST_JOB_ID" ]; then
    echo -e "✅ Job Setup: SUCCESS"
else
    echo -e "❌ Job Setup: FAILED"
fi

# Test 4: Application Submission
echo -e "✅ Application Workflow: TESTED"
echo -e "✅ Duplicate Prevention: TESTED"
echo -e "✅ Permission Control: TESTED"
echo -e "✅ Error Handling: TESTED"

echo ""
echo -e "${GREEN}🎉 Application testing completed!${NC}"
echo ""
echo -e "${YELLOW}Credentials used:${NC}"
echo -e "Student: user_id=student, password=student1234"
echo -e "Alumni: user_id=main07, password=1234"
echo ""
echo -e "${GREEN}Check the responses above for detailed results.${NC}"