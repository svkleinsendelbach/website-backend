# Firebase Api of SV Kleinsendelbach e.V.

This repository contains the firebase api of `SV Kleinsendelbach e.v.`. It's used to edit / get events and news, handle authentication, etc.

## Table of Contents

- [Firebase Api of SV Kleinsendelbach e.V.](#firebase-api-of-sv-kleinsendelbach-ev)
    - [Table of Contents](#table-of-contents)
    - [Bug report and feature request](#bug-report-and-feature-request)
    - [Usage](#usage)
    - [Development](#development)
        - [Create new function](#create-new-function)
        - [Publish changes](#publish-changes)
        - [Deploy changes](#deploy-changes)

## Bug report and feature request

- To report a bug of this api, create a new issue at [Github Issues](https://github.com/svkleinsendelbach/firebase-api/issues) and choose `Bug report`.
- To request a new feature for this api, also create a new issue at [Github Issues](https://github.com/svkleinsendelbach/firebase-api/issues) and choose `Feature request`.

## Usage

To use this api, read the [API Schema](https://svkleinsendelbach.github.io/firebase-api/api-schema.html).

## Development

This project is created with `Firebase Functions`. To develop this api, clone the repository and install all dependencies with `npm install`.
 
 ### Create new function

Create new functions or edit existing ones, also create tests for your functions and make sure all your tests passes.

### Publish changes

In this repository you can push your changes directly to the `main` branch. Alternatily create a new branch, push it to GitHub and create a pull request.

### Deploy changes

For deployment run `npm run deploy` in the `functions` directory.