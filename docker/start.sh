#!/bin/bash
npx playwright "$@"

status=$?

echo -e "\t==> Done!"

exit $status
