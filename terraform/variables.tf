variable "app" {}
variable "service_name" {}
variable "trello_api_key" {}
variable "trello_oauth_token" {}
variable "trello_member_id" {}

variable "aws-region" {
    default = "eu-west-1"
    description = "Ireland"
}
variable "github_personal_token" {
    default = "TOKEN_HERE"
    description = "github personal token"  
}

variable "github_url" {
    default = "https://github.com/perfsys/patients-claims-typescript-sample.git?ref=dev"
    description = "github url"
}
