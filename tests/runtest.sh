#!/bin/bash

# Function to run tests and update counters
run_postman_tests() {
    local test_files=$1
    local success_counter=$2
    local error_counter=$3
    local error_log=$4

    for file in "${test_files[@]}"; do
        # Run the test file
        output=$(newman run "$file" 2>&1)

        # Check if the file executed successfully or encountered an error
        if [ $? -eq 0 ]; then
            # Execution succeeded
            ((success_counter++))
        else
            # Execution failed
            ((error_counter++))
            # Write the error message to the error log
            echo "Error in $file:" >>"$error_log"
            echo "$output" >>"$error_log"
            echo >>"$error_log"
        fi
    done
}

# Function to run JavaScript tests and update counters
run_js_tests() {
    local js_files=$1
    local success_counter=$2
    local error_counter=$3
    local error_log=$4

    for file in "${js_files[@]}"; do
        # Run the JavaScript file
        output=$(node "$file" 2>&1)

        # Check if the file executed successfully or encountered an error
        if [ $? -eq 0 ]; then
            # Execution succeeded
            ((success_counter++))
        else
            # Execution failed
            ((error_counter++))
            # Write the error message to the error log
            echo "Error in $file:" >>"$error_log"
            echo "$output" >>"$error_log"
            echo >>"$error_log"
        fi
    done
}

# Start the server in the background and redirect the output to a log file
npm run start >server_log.txt 2>&1 &
server_pid=$!

# Wait for the server to be up and running
npx wait-on http://localhost:3000

# Check if the server started successfully or encountered an error
if [ $? -eq 0 ]; then
    echo "Server started successfully."
else
    echo "Error starting the server. Check 'server_log.txt' for details."
    # Stop the server and exit the script
    kill $server_pid
    exit 1
fi

# Find all JSON files in the current folder and subfolders
json_files=$(find . -type f -name "*.json" | grep -v "$0")

# Initialize counters
json_success_count=0
json_error_count=0

# Create an error log file for JSON files
json_error_log="json_error_log.txt"
rm -f "$json_error_log"
touch "$json_error_log"

# Run API tests (JSON files)
run_postman_tests "$json_files" json_success_count json_error_count "$json_error_log"

# Find all JavaScript files in the current folder
js_files=$(find . -type f -name "*.js" | grep -v "$0")

# Initialize counters
js_success_count=0
js_error_count=0

# Create an error log file for JavaScript files
js_error_log="js_error_log.txt"
rm -f "$js_error_log"
touch "$js_error_log"

# Run tests (JavaScript files)
run_js_tests "$js_files" js_success_count js_error_count "$js_error_log"

# Display the results for JSON files
echo "JSON Success count: $json_success_count"
echo "JSON Error count: $json_error_count"

# Display the results for JavaScript files
echo "JavaScript Success count: $js_success_count"
echo "JavaScript Error count: $js_error_count"

# Stop the server
kill $server_pid
