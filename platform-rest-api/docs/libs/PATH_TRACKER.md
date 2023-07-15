# PathTracker lib

This document describe the API of the `PathTracker` library.

Describe the exported elements, what they are and how to use them.

## Index

* [PathTracker](#PathTracker)

## PathTracker

### Description

A class for generate logs and write them in files and to the stdout. Also tracks how long an endpoint takes to run.
This class inherits of [Logger](LOGGER.md) and only overwrite the `computeLog` method, so this class is used as the Logger class.
