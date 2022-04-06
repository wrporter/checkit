#!/usr/bin/env bash

set -ex

REQUIRED_COVERAGE=${REQUIRED_COVERAGE:="30"}

echo "--- Running tests with coverage, expected threshold is: ${REQUIRED_COVERAGE}%"

#go test ./... -coverprofile cover.out -covermode atomic
#COVERAGE=$(go tool cover -func=cover.out | tail -n 1 | sed -Ee 's!^[^[:digit:]]+([[:digit:]]+(\.[[:digit:]]+)?)%$!\1!')
#echo "--- Test coverage result: ${COVERAGE}%"
#
#if (( $(echo "${REQUIRED_COVERAGE} > ${COVERAGE}" | bc -l) )); then
#  echo "--- Tests did not meet coverage threshold, exiting..."
#  exit 1
#fi

go test -v -json \
    -coverprofile=coverage.out ./... \
    | tee test.out \
    | go run .ci/show_test_output.go

go tool cover -func=coverage.out -o cover.out;

if [ "${REQUIRED_COVERAGE}" -gt 0 ]; then
    echo "--- Ensuring test coverage"

    COVERAGE_LINE=$(tail -1 cover.out)

    MEASURED_COVERAGE=$(echo "${COVERAGE_LINE}" | awk '{ gsub("%","",$3); print $3}')

    HAS_SUFFICIENT_COVERAGE=$(echo "${MEASURED_COVERAGE} ${REQUIRED_COVERAGE}" | awk '{print ($1 >= $2)}')

    if [ "${HAS_SUFFICIENT_COVERAGE}" -eq 1 ]; then
        echo "--- Found coverage (${MEASURED_COVERAGE}%) PASSED required threshold (${REQUIRED_COVERAGE}%)";
    else
        echo "--- Found coverage (${MEASURED_COVERAGE}%) FAILED required threshold (${REQUIRED_COVERAGE}%)";
        exit 1
    fi
else
    echo "--- Skipping test coverage because REQUIRED_COVERAGE is (${REQUIRED_COVERAGE})"
fi
