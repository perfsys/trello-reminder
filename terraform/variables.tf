variable "app" {}
variable "service_name" {}
variable "trello_api_key" {}
variable "trello_oauth_token" {}
variable "trello_member_id" {}

variable "aws-region" {
    default = "eu-west-1"
    description = "Ireland"
}
variable "github_personal_token" {}

variable "github_url" {
    default = "https://github.com/perfsys/trello-reminder.git?ref=dev"
    description = "github url"
}
