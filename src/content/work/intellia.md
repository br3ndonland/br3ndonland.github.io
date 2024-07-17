---
title: Intellia Therapeutics
dateStart: 2020-03-23
dateEnd: 2023-10-13
image:
  src: "@images/brendon-smith-at-work-intellia-trivia.jpg"
  alt: Brendon Smith with the winning team at Intellia trivia night
roles:
  - Software Engineer II
  - Software Engineer III
  - Senior Software Engineer
tags:
  - AWS
  - CI/CD
  - Docker
  - FastAPI
  - Git
  - GitHub
  - Gruntwork
  - Prefect
  - Python
  - Shell
  - Terraform
  - Vue.js
  - Web Development
---

## Overview

I spent three and a half years at <a href="https://www.intelliatx.com/" rel="external" target="_blank">Intellia Therapeutics</a>, a pharmaceutical company developing therapies for genetic diseases with CRISPR gene editing.

I joined Intellia as a Software Engineer. I started off by building integrations with lab equipment like liquid handlers and freezers. I used Docker containers and the Python FastAPI framework for back-end APIs (application programming interfaces), and Vue.js for front-end applications.

I quickly began contributing to the team more broadly with efforts in DevOps (supporting the cloud infrastructure needed to run software applications) and platform engineering (supporting the tools that software engineers use to develop software). These efforts included work in several different areas as detailed below.

As a result of these efforts, I was promoted to Software Engineer III after about a year and a half (they rolled out an engineering career ladder while I was there, and my initial role was reclassified as "Software Engineer II"), then to Senior Software Engineer a year after that. After I was promoted to Senior Software Engineer, my role enabled me to bridge software engineering, computational sciences, and IT to improve the company's cloud infrastructure.

## Software Engineer

### Application settings

As applications grow over time, variables and settings can become scattered throughout the code base and cloud infrastructure, making the application increasingly difficult to comprehend and configure. I collaborated with other team members to overhaul the settings in our back-end applications, and added documentation explaining how to use the settings in the application.

### CI/CD

CI/CD (continuous integration/continuous delivery) is an approach for triggering cloud computing operations in response to changes in source code. I introduced GitHub Actions for CI/CD (see my "<a href="https://gist.github.com/br3ndonland/f9c753eb27381f97336aa21b8d932be6" rel="external" target="_blank">Getting the Gist of GitHub Actions</a>" tutorial), and drove adoption throughout the organization.

### Container image registries

It's common for engineers to build their source code into ready-to-run packages called "container images" and store those in the cloud. I led a migration of our container images from Docker Hub to ECR (AWS Elastic Container Registry).

### Container image disaster recovery

In addition to helping the team migrate their images to ECR, I implemented a disaster recovery plan for our container images. In terms of cloud computing, "disaster recovery" refers to a business plan for what to do if our default infrastructure is unavailable because of a natural disaster or other problem. We previously stored all our AWS cloud infrastructure in a single geographic region. If this region had a problem, we could potentially lose access to everything. To implement a disaster recovery strategy for our container images, I configured automatic replication from our default region to our disaster recovery region, and also configured another storage location integrated with GitHub, GHCR (GitHub Container Registry), as a fail-over registry.

### Database security

Our RDS (AWS Relational Database Service) MySQL databases contained proprietary genetic sequences and other valuable intellectual property, so it was important to keep that information secure. The company had been logging in to the databases using the same root user account and insecure password for years, and had also been storing the credentials insecurely. As a more secure alternative, I implemented token-based authentication using IAM (AWS Identity and Access Management), enabling users to log in with temporary credentials linked to their own unique AWS identities, rather than with the same long-term username and password. In addition to implementing the login system in multiple applications and programming languages, I provided documentation, workshops, and technical support to help users migrate to the new authentication system. During the project, I demonstrated inter-team communication skills, engineering competency, and the ability to learn a new subject area rapidly and effectively.

### Open source

In my free time, I did volunteer work on open source software projects. For example, I started an open source project called [inboard](/projects/inboard) that provides Docker container images for Python web servers. The project has gotten positive feedback from the open source community and the Docker images have been pulled over a million times. I also started a project called [fastenv](/projects/fastenv) that can help manage application settings.

## Senior Software Engineer

### AWS authentication

One cross-functional project I led as a Senior Software Engineer was rebuilding our AWS authentication system to use SSO (single sign-on) with Okta, our IdP (identity provider). This project eliminated many security issues and enabled us to use unified user identities for all AWS access. In addition to leading the implementation, I also drove adoption of this new system by providing documentation, workshops, and technical support. The new AWS authentication system dovetailed nicely with the token-based authentication system I had implemented previously. When users logged in to AWS with SSO, then used those credentials to log in to the databases, all their operations were linked back to their single user identity in our IdP.

### Software supply chain security

In addition to authentication security, I also led projects focused on software supply chain security. The source code that goes into an application is referred to as its "software supply chain." Before applications are deployed, they usually exist as plain-text source code files. These source code files may rely on other external source code packages called "dependencies." Even at this pre-deployment stage, there are many security considerations.

To detect and mitigate software supply chain security vulnerabilities, I first drove the upgrade process of our GitHub plan to GitHub Enterprise and added the GitHub Advanced Security product, coordinating with GitHub sales representatives and the IT and legal teams at the company to complete the upgrade. Next, I led efforts to implement the following scanning methods:

1. _Dependency scanning_. GitHub supports dependency scanning with a tool called Dependabot. I rolled out dependency scanning throughout our GitHub Enterprise, and then helped the rest of the organization use it by providing documentation, workshops and technical support. Dependency scanning not only helped mitigate vulnerabilities, but also helped improve dependency management overall. Dependabot can only scan GitHub repositories if they have dependency requirements files. Many of the projects did not have requirements files, but this effort prompted us to add them.
2. _Source code vulnerability scanning_. In addition to third-party dependencies, it is also important to scan the code written for each application to avoid vulnerable code patterns like <a href="https://en.wikipedia.org/wiki/Cross-site_scripting" rel="external" target="_blank">cross-site scripting</a> or <a href="https://en.wikipedia.org/wiki/SQL_injection" rel="external" target="_blank">SQL injection</a>. GitHub Advanced Security provides a tool called CodeQL for this purpose. Rolling out CodeQL was more involved than Dependabot. At the time, CodeQL had to be configured in every source code repository individually with GitHub Actions workflows, and the workflows need to be able to install dependencies and build the project. I implemented these workflows for multiple code languages including C++, Go, JavaScript, and Python.
3. _Source code secret scanning_. GitHub Advanced Security also includes a "secret scanning" feature with the ability to detect passwords and other sensitive credentials in source code. Customers can augment the default capabilities of secret scanning by specifying custom patterns. I implemented secret scanning for our GitHub organization, adding custom patterns to detect internal credentials, and helped remove the secrets that were detected. Secret scanning results motivated us to remove secrets from source code and improve credential management in the future.
4. _Container image scanning_. In addition to dependencies and source code, it is also important to consider security at the operating system (OS) level. For Docker container images, the operating system is mostly contained within the container image itself, so container image scanning can help with OS security. Debian Linux container images typically have 400-500 known vulnerabilities, with about 5% of those considered "high" or "critical" severity (as reported by the clair scanner used in AWS ECR at the time). To investigate ways to reduce the number of vulnerabilities, I built alternative container images for our software services using Alpine Linux. Alpine Linux reduced the number of vulnerabilities to zero.

### Infrastructure-as-code

When I joined the company, they had been configuring their cloud infrastructure with "ClickOps" (manually provisioning resources one by one by clicking around the AWS browser console website). ClickOps infrastructure is difficult to maintain and scale. <a href="https://en.wikipedia.org/wiki/Infrastructure_as_code" rel="external" target="_blank">Infrastructure-as-code</a> is an automation strategy that offers advantages over ClickOps. With this approach, a configuration language is used to declare the cloud resources to be configured (networks, servers, storage, identities, etc.) in plain-text source code files. The configurations are then "applied" to create, update, or delete the resources.

My manager and I selected a tool called Terraform for our infrastructure-as-code work <em>(note that I later switched from Terraform to <a href="https://opentofu.org/" rel="external" target="_blank">OpenTofu</a> after the <a href="https://www.hashicorp.com/blog/hashicorp-adopts-business-source-license" rel="external" target="_blank">HashiCorp rug pull</a>)</em>. I spent my free time learning Terraform so I could help with this effort. Initially, the company had contracted out some of the Terraform work to a consultancy called Mission Cloud, but after repeated engagements proved unsatisfactory, we opted for a different approach. Instead of having contractors write custom code, another approach is to use pre-fabricated code libraries from an organization like <a href="https://cloudposse.com/" rel="external" target="_blank">Cloud Posse</a> or <a href="https://www.gruntwork.io/" rel="external" target="_blank">Gruntwork</a>. We went with Gruntwork. Gruntwork provides a code library and automation tools for running the code. With this approach, best-practices infrastructure can be provisioned quickly, and only small amounts of custom code are occasionally needed. For example, I wrote a <a href="https://github.com/br3ndonland/terraform-aws-github-actions-oidc" rel="external" target="_blank">Terraform module to help GitHub Actions CI/CD workflows authenticate with AWS</a>.

### Data engineering

Data engineering is somewhat like a combination of data science and software engineering. Data engineers basically move data around in the cloud. To help us build data engineering workflows, I introduced a product called <a href="https://www.prefect.io/" rel="external" target="_blank">Prefect</a>. Prefect organizes work into "flows" (like simplified Python serverless functions), and flows can be configured with "tasks" (individual steps), schedules, and more. Flow runs can be deployed to the Prefect Cloud platform. I completed a <a href="https://www.credential.net/02b3d274-2d8d-44d7-b23d-dd7dd84393be" rel="external" target="_blank">Prefect certification</a> in order to develop expertise and support the rest of the organization.

We ran a self-hosted instance of Prefect Cloud. This gave us the opportunity to introduce a container orchestration tool called <a href="https://kubernetes.io/" rel="external" target="_blank">Kubernetes</a>. Kubernetes is widely used, but the company had not previously worked with it. The introduction of Kubernetes was a valuable contribution to the overall technical capabilities of our team.

### Service request intake

When building software for "stakeholders" (people using the software) in a company, it is important to gather requirements initially, and then after releasing the software, to enable stakeholders to submit feedback and requests for further work. Scientific stakeholders wanted a clearer method for communicating work to our team. To meet this need, several of us set up a service request workflow in which stakeholders can communicate requests in Microsoft Teams, and Microsoft Teams could then connect to GitHub. The updated service request workflow was well received by our scientific stakeholders.

### Management

When I started at Intellia, DevOps didn't really exist there as a concept. After seeing the added value from all the work I did, my manager (the Director of Software Engineering) helped me create a new full-time DevOps role, and we hired the first ever DevOps engineer at the company. I managed the DevOps engineer as well as a second engineer who was working on front-end application development. Both of my direct reports appreciated my management style, particularly my approach to documentation. I provided detailed meeting minutes with notes and links after each time we met.

## Life

My time at Intellia was framed by the COVID-19 coronavirus pandemic. I interviewed in-person and was planning on working on-site in the office. Then, a week before I started, COVID-19 shutdowns went into effect. I briefly went in to the office on my first day, picked up my laptop while staying six feet away from the other humans, and worked remotely thereafter. I was able to do my job effectively from home, but it was more difficult for others that needed to be on-site for their roles. Scientists had to work around the clock in shifts to stay under strict building occupancy limits.

Despite the challenges of COVID-19, this was an exciting time for CRISPR. Intellia and their clinical collaborators conducted and published the <a href="https://www.nejm.org/doi/10.1056/NEJMoa2107454" rel="external" target="_blank">first <em>in vivo</em> human clinical trial of a CRISPR therapeutic</a>. The trial was a smashing success and launched the company into a new clinical phase. A few months later, our scientific co-founder <a href="https://en.wikipedia.org/wiki/Jennifer_Doudna" rel="external" target="_blank">Jennifer Doudna</a> was the subject of a high-profile <a href="https://en.wikipedia.org/wiki/The_Code_Breaker" rel="external" target="_blank">biography</a> and won the <a href="https://news.berkeley.edu/2020/10/07/jennifer-doudna-wins-2020-nobel-prize-in-chemistry/" rel="external" target="_blank">2020 Nobel Prize in Chemistry</a> for CRISPR.

After the pandemic subsided, we occasionally found time to hang out and have fun. My movie knowledge helped me become a two-time trivia champion.
