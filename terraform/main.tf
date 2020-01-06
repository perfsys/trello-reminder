terraform {
  backend "s3" {
    bucket = "trello-reminder-dev-terraform"
    key = "terraform.tfstate"
    region = "eu-west-1"
  }
}
provider "aws" {
  region = var.aws-region
}

## github access token
resource "aws_codebuild_source_credential" "github_token" {
  auth_type = "PERSONAL_ACCESS_TOKEN"
  server_type = "GITHUB"
  token = var.github_personal_token
}
##

## create role for build
resource "aws_iam_role" "codebuild_iam_role" {
  name = "${var.service_name}_codebuild_iam_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}
##

## define policy for role
resource "aws_iam_role_policy" "codebuild_iam_role_policy" {
  role = aws_iam_role.codebuild_iam_role.name

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Resource": [
        "*"
      ],
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
POLICY
}
##

## create code build for backend
resource "aws_codebuild_project" "codebuild" {
  name          = var.service_name
  description   = var.service_name
  build_timeout = "5"
  service_role  = aws_iam_role.codebuild_iam_role.arn

  artifacts {
    type = "NO_ARTIFACTS"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/standard:3.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = "true"
    environment_variable {
      name  = "TRELLO_API_KEY"
      value = var.trello_api_key
    }
    environment_variable {
      name  = "TRELLO_OAUTH_TOKEN"
      value = var.trello_oauth_token
    }
    environment_variable {
      name  = "MEMBER_ID"
      value = var.trello_member_id
    }
  }
  logs_config {
    cloudwatch_logs {
      group_name = "log-group"
      stream_name = "log-stream"
    }
  }

  source {
    type            = "GITHUB"
    location        = var.github_url
    git_clone_depth = 1
    buildspec       = "buildspec.yml"

    auth {
        type = "OAUTH"
        resource = aws_codebuild_source_credential.github_token.arn
    }
  }
}

resource "aws_codebuild_webhook" "webhook_dev" {
  project_name = aws_codebuild_project.codebuild.name

  filter_group {
    filter {
      type = "EVENT"
      pattern = "PUSH"
    }

    filter {
      type = "HEAD_REF"
      pattern = "dev"
    }
  }
}
##