#!/bin/bash

# Change directory to the target folder
cd tests

# Find all JavaScript files in the current folder
js_files=$(find . -type f -name "*.js")

# Initialize counters
success_count=0
error_count=0

# Create an error log file
error_log="error_log.txt"
rm -f "$error_log"

# Iterate over each JavaScript file and run it
for file in $js_files; do
    # Run the JavaScript file
    output=$(node "$file" 2>&1)

    # Check if the file executed successfully or encountered an error
    if [ $? -eq 0 ]; then
        # Execution succeeded
        ((success_count++))
    else
        # Execution failed
        ((error_count++))
        # Write the error message to the error log
        echo "Error in $file:" >> "$error_log"
        echo "$output" >> "$error_log"
        echo >> "$error_log"
    fi
done

# Display the results
echo "Success count: $success_count"
echo "Error count: $error_count"
