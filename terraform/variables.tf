variable "app" {}
variable "service_name" {}

variable "aws-region" {
    default = "eu-west-1"
    description = "Ireland"
}
variable "personal_token" {
    default = "TOKEN_HERE"
    description = "github personal token"  
}

variable "github_url" {
    default = "https://github.com/perfsys/patients-claims-typescript-sample.git?ref=dev"
    description = "github url"
}
