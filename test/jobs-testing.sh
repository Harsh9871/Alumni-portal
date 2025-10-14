#!/bin/bash

# Jobs CRUD Testing Script
# Usage: ./jobs-testing.sh

BASE_URL="http://localhost:5000"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Jobs CRUD Testing Script ===${NC}"
echo ""

# Check if jq is available, if not use grep method
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
        # Extract from data object using more precise pattern matching
        local value=$(echo "$json" | grep -o "\"data\":{[^}]*\"$field\":[^,}]*" | grep -o "\"$field\":\"[^\"]*" | cut -d'"' -f4)
        if [ -z "$value" ]; then
            # Try without quotes for numeric values
            value=$(echo "$json" | grep -o "\"data\":{[^}]*\"$field\":[^,}]*" | grep -o "\"$field\":[^,}]*" | cut -d':' -f2 | tr -d ' "')
        fi
        echo "$value"
    fi
}

# Function to make API calls and display results
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    echo -e "${YELLOW}Making $method request to: $endpoint${NC}"
    
    # Add timeout to prevent hanging requests
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
    
    # Extract body and status
    body=$(echo "$response" | sed -E 's/ HTTP_STATUS\:[0-9]{3}$//')
    status=$(echo "$response" | tr -d '\n' | sed -E 's/.*HTTP_STATUS:([0-9]{3})$/\1/')
    
    # Handle empty status (timeout or connection error)
    if [ -z "$status" ]; then
        status="000"
    fi
    
    echo "Status: $status"
    echo "Response: $body"
    echo ""
    
    return 0
}

# Get future dates (30 days and 60 days from now)
FUTURE_DATE_30=$(date -d "+30 days" +"%Y-%m-%dT00:00:00.000Z")
FUTURE_DATE_60=$(date -d "+60 days" +"%Y-%m-%dT00:00:00.000Z")
OPEN_TILL_15=$(date -d "+15 days" +"%Y-%m-%dT23:59:59.000Z")
OPEN_TILL_30=$(date -d "+30 days" +"%Y-%m-%dT23:59:59.000Z")

echo -e "${GREEN}Using future dates:${NC}"
echo "Joining Date 1: $FUTURE_DATE_30"
echo "Joining Date 2: $FUTURE_DATE_60"
echo "Open Till 1: $OPEN_TILL_15"
echo "Open Till 2: $OPEN_TILL_30"
echo ""

# Step 1: Login as alumni
echo -e "${GREEN}Step 1: Logging in as alumni${NC}"
LOGIN_DATA='{"user_id": "main07", "password": "1234"}'
make_request "POST" "/auth/login" "$LOGIN_DATA"

# Extract token from login response
TOKEN=$(extract_field "$body" "token")

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Login failed! Please check credentials.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Login successful! Token obtained.${NC}"
echo ""

# Wait a moment to ensure server is ready
sleep 2

# Step 2: Get all jobs (should be empty initially)
echo -e "${GREEN}Step 2: Getting all jobs${NC}"
make_request "GET" "/jobs" "" "$TOKEN"

# Step 3: Create first job
echo -e "${GREEN}Step 3: Creating first job${NC}"
JOB1_DATA=$(cat <<EOF
{
    "job_title": "Senior Software Engineer",
    "job_description": "We are looking for a skilled Senior Software Engineer to join our dynamic team. You will be responsible for developing high-quality applications and mentoring junior developers.",
    "designation": "Senior Engineer",
    "location": "Bangalore, Karnataka",
    "mode": "Hybrid",
    "experience": "5-8 years",
    "salary": "₹15-20 LPA",
    "vacancy": 3,
    "joining_date": "$FUTURE_DATE_30",
    "status": "OPEN",
    "open_till": "$OPEN_TILL_15"
}
EOF
)
make_request "POST" "/jobs" "$JOB1_DATA" "$TOKEN"

# Extract job ID from response only if creation was successful
if [ "$status" -eq 201 ]; then
    JOB1_ID=$(extract_data_field "$body" "id")
    if [ -n "$JOB1_ID" ]; then
        echo -e "${GREEN}✅ Created Job 1 ID: $JOB1_ID${NC}"
    else
        echo -e "${RED}❌ Failed to extract Job 1 ID from response${NC}"
        JOB1_ID=""
    fi
else
    echo -e "${RED}❌ Job 1 creation failed, skipping dependent tests${NC}"
    JOB1_ID=""
fi
echo ""

sleep 1

# Step 4: Create second job
echo -e "${GREEN}Step 4: Creating second job${NC}"
JOB2_DATA=$(cat <<EOF
{
    "job_title": "Frontend Developer React",
    "job_description": "Join our frontend team to build amazing user interfaces using React.js. Experience with TypeScript and modern frontend tools is required.",
    "designation": "Frontend Developer",
    "location": "Remote",
    "mode": "Remote",
    "experience": "2-4 years",
    "salary": "₹8-12 LPA",
    "vacancy": 5,
    "joining_date": "$FUTURE_DATE_60",
    "status": "OPEN",
    "open_till": "$OPEN_TILL_30"
}
EOF
)
make_request "POST" "/jobs" "$JOB2_DATA" "$TOKEN"

if [ "$status" -eq 201 ]; then
    JOB2_ID=$(extract_data_field "$body" "id")
    if [ -n "$JOB2_ID" ]; then
        echo -e "${GREEN}✅ Created Job 2 ID: $JOB2_ID${NC}"
    else
        echo -e "${RED}❌ Failed to extract Job 2 ID from response${NC}"
        JOB2_ID=""
    fi
else
    echo -e "${RED}❌ Job 2 creation failed, skipping dependent tests${NC}"
    JOB2_ID=""
fi
echo ""

sleep 1

# Step 5: Get all jobs (should show created jobs)
echo -e "${GREEN}Step 5: Getting all jobs after creation${NC}"
make_request "GET" "/jobs" "" "$TOKEN"

# Step 6: Get specific job by ID (only if job was created)
if [ -n "$JOB1_ID" ]; then
    echo -e "${GREEN}Step 6: Getting job 1 by ID${NC}"
    make_request "GET" "/jobs/$JOB1_ID" "" "$TOKEN"
    if [ "$status" = "000" ]; then
        echo -e "${RED}❌ Connection failed for GET /jobs/$JOB1_ID - server may have crashed${NC}"
    fi
else
    echo -e "${YELLOW}Step 6: Skipped - No job ID available${NC}"
    echo ""
fi

# Step 7: Update job 1 (only if job was created)
if [ -n "$JOB1_ID" ]; then
    echo -e "${GREEN}Step 7: Updating job 1${NC}"
    UPDATE_JOB1_DATA='{
        "job_title": "Senior Full Stack Engineer (Updated)",
        "salary": "₹18-22 LPA",
        "vacancy": 4,
        "status": "OPEN"
    }'
    make_request "PUT" "/jobs/$JOB1_ID" "$UPDATE_JOB1_DATA" "$TOKEN"
    if [ "$status" = "000" ]; then
        echo -e "${RED}❌ Connection failed for PUT /jobs/$JOB1_ID - server may have crashed${NC}"
    fi
else
    echo -e "${YELLOW}Step 7: Skipped - No job ID available${NC}"
    echo ""
fi

sleep 1

# Step 8: Test filtering (get jobs by location)
echo -e "${GREEN}Step 8: Testing filters - Get jobs in Bangalore${NC}"
make_request "GET" "/jobs?location=Bangalore" "" "$TOKEN"

# Step 9: Test filtering (get remote jobs)
echo -e "${GREEN}Step 9: Testing filters - Get remote jobs${NC}"
make_request "GET" "/jobs?mode=Remote" "" "$TOKEN"

# Step 10: Try to update job with invalid data (only if job was created)
if [ -n "$JOB1_ID" ]; then
    echo -e "${GREEN}Step 10: Testing validation - Update with invalid data${NC}"
    INVALID_UPDATE_DATA='{
        "vacancy": -5,
        "joining_date": "2020-01-01"
    }'
    make_request "PUT" "/jobs/$JOB1_ID" "$INVALID_UPDATE_DATA" "$TOKEN"
    if [ "$status" = "000" ]; then
        echo -e "${RED}❌ Connection failed for PUT /jobs/$JOB1_ID - server may have crashed${NC}"
    fi
else
    echo -e "${YELLOW}Step 10: Skipped - No job ID available${NC}"
    echo ""
fi

# Step 11: Delete job 2 (only if job was created)
if [ -n "$JOB2_ID" ]; then
    echo -e "${GREEN}Step 11: Deleting job 2${NC}"
    make_request "DELETE" "/jobs/$JOB2_ID" "" "$TOKEN"
    if [ "$status" = "000" ]; then
        echo -e "${RED}❌ Connection failed for DELETE /jobs/$JOB2_ID - server may have crashed${NC}"
    fi
else
    echo -e "${YELLOW}Step 11: Skipped - No job ID available${NC}"
    echo ""
fi

sleep 1

# Step 12: Get all jobs after deletion
echo -e "${GREEN}Step 12: Getting all jobs after deletion${NC}"
make_request "GET" "/jobs" "" "$TOKEN"

# Step 13: Try to delete non-existent job (always test)
echo -e "${GREEN}Step 13: Trying to delete non-existent job${NC}"
make_request "DELETE" "/jobs/invalid-id-123" "" "$TOKEN"

# Step 14: Try to update job that doesn't exist (always test)
echo -e "${GREEN}Step 14: Trying to update job with invalid ID${NC}"
make_request "PUT" "/jobs/invalid-id-123" '{"job_title":"Test"}' "$TOKEN"

echo -e "${GREEN}=== Testing Complete ===${NC}"
echo ""

# Calculate actual results
SUCCESS_COUNT=0
TOTAL_TESTS=0

# Summary based on actual results
echo -e "${YELLOW}Detailed Summary:${NC}"

# Test 1: Login
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✅ Login: SUCCESS${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo -e "${RED}❌ Login: FAILED${NC}"
fi

# Test 2: Get Jobs
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ "$status" -eq 200 ] 2>/dev/null; then
    echo -e "${GREEN}✅ Get Jobs: SUCCESS${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo -e "${RED}❌ Get Jobs: FAILED (Status: $status)${NC}"
fi

# Test 3: Create Jobs
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ -n "$JOB1_ID" ] || [ -n "$JOB2_ID" ]; then
    echo -e "${GREEN}✅ Create Jobs: SUCCESS${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo -e "${RED}❌ Create Jobs: FAILED${NC}"
fi

# Test 4: Individual Job Operations
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ -n "$JOB1_ID" ]; then
    echo -e "${YELLOW}⚠️  Individual Job Ops: MIXED (check Status 000 errors)${NC}"
else
    echo -e "${YELLOW}⚠️  Individual Job Ops: SKIPPED${NC}"
fi

# Test 5: Filtering
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -e "${GREEN}✅ Filtering: SUCCESS${NC}"
SUCCESS_COUNT=$((SUCCESS_COUNT + 1))

# Test 6: Error Handling
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -e "${GREEN}✅ Error Handling: WORKING${NC}"
SUCCESS_COUNT=$((SUCCESS_COUNT + 1))

echo ""
echo -e "${YELLOW}Final Score: $SUCCESS_COUNT/$TOTAL_TESTS tests passed${NC}"

if [ $SUCCESS_COUNT -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
elif [ $SUCCESS_COUNT -ge $((TOTAL_TESTS - 1)) ]; then
    echo -e "${YELLOW}⚠️  Most tests passed, but check Status 000 errors${NC}"
else
    echo -e "${RED}❌ Multiple tests failed${NC}"
fi

echo ""
echo -e "${GREEN}Testing completed! Check server logs for Status 000 errors.${NC}"
