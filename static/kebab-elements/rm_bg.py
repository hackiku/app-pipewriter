import os
import re

# Define the pattern to match the background rectangle
# pattern = re.compile(r'<rect width="84" height="\d+" rx="8" fill="#F0F0F0"/>') # light mode
pattern = re.compile(r'<rect width="84" height="\d+" rx="8" fill="#010914"/>') # dark mode

# Iterate through all SVG files in the current directory
for filename in os.listdir('.'):
    if filename.endswith('.svg') and 'xxx' not in filename:
        with open(filename, 'r') as file:
            lines = file.readlines()

        # Remove the line that matches the pattern
        lines = [line for line in lines if not pattern.match(line.strip())]

        # Write the modified content back to the file
        with open(filename, 'w') as file:
            file.writelines(lines)

        print(f"Processed: {filename}")

print("All files processed.")