#!/bin/bash

# Fix all .ts imports in backend
find src/backend -name "*.ts" -type f -exec sed -i "s/from '\(.*\)\.ts'/from '\1'/g" {} \;
find src/backend -name "*.ts" -type f -exec sed -i 's/from "\(.*\)\.ts"/from "\1"/g' {} \;

echo "Fixed all .ts extensions in imports"