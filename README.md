# Project Setup

This project requires Node.js and a GitHub access token to run.

## Prerequisites

- Node.js (v16 or later recommended)
- A GitHub account
- A GitHub Personal Access Token

## Installation & Usage

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   
## Install dependencies (if applicable):

npm install

## Create a .env file at the root of the project with the following content:

PORT=3000
USER=YourGitHubUserName
GITHUB_TOKEN=YourGitHubToken

⚠️ Important: Never commit your .env file or GitHub token to a public repository.

## Start the server:

node server.js

## Open your browser and navigate to:

http://localhost:3000
