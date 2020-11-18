#!/usr/bin/env bash

echo "Making $CI_COMMIT_SHA"

echo \{\"version\": \"$CI_COMMIT_SHA\"\} > packages/backend/crowdaq/version.json