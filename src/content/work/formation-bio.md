---
title: Formation Bio
dateStart: 2025-01-27
dateEnd: "Present"
image:
  src: "@images/formation-bio-hero.jpg"
  alt: Formation Bio cover image
roles:
  - Senior Site Reliability Engineer
tags:
  - AWS
  - CI/CD
  - Docker
  - Git
  - GitHub
  - OpenTofu
  - Python
  - Shell
  - Snowflake
  - Spacelift
  - Terraform
---

## Overview

<a href="https://www.formation.bio/" rel="external" target="_blank">Formation Bio</a> is a biotech company with a mission "to deliver new treatments to patients faster and more efficiently." They accomplish this with an innovative business model and the help of AI. Pharmaceutical drug development is a difficult process with a high probability of failure. Rather than starting off attempting to do the entire end-to-end process, they've created an intermediary business model. They acquire drugs (or "assets" as they call them) that have already gone through some early development, creating a new subsidiary corporation for each asset (called a "hub and spoke" business model). They then use their in-house AI products to improve the efficiency of clinical trial logistics. Finally, once the the assets hit a value inflection point, they then sell or license the assets. This strategy of "flipping drugs" has already been successful - <a href="https://www.prnewswire.com/news-releases/libertas-bio-a-formation-bio-subsidiary-license-of-gusacitinib-a-dual-jaksyk-inhibitor-to-sanofi-302487403.html" rel="external" target="_blank">Formation Bio licensed their asset gusacitinib to Sanofi in June 2025</a>.

As a Senior Site Reliability Engineer (SRE) in the Platform Engineering organization, I am responsible for Formation Bio's cloud infrastructure and platform tools. This is an important role because of the company's strong focus on AI and data, all of which requires cloud infrastructure. I've worked on some interesting initiatives so far.

## OpenTofu

Back when I was at [Intellia Therapeutics](/work/intellia), I started using a strategy called "infrastructure-as-code" (IaC) to manage cloud infrastructure, with the help of a tool called HashiCorp Terraform. This IaC approach has had a major impact on infrastructure engineering, but the fact that Terraform was controlled by a for-profit corporation meant that it was subject to the changing needs and direction of the corporation. The effects of this corporate control were realized when <a href="https://www.hashicorp.com/blog/hashicorp-adopts-business-source-license" rel="external" target="_blank">HashiCorp relicensed Terraform</a> from the open source MPL (Mozilla Public License) to the non-open BSL (Business Source License). Software licenses help to determine how the software can be used, so the license change has <a href="https://opentofu.org/manifesto/" rel="external" target="_blank">consequences</a> for enterprises and open source software developers.

The open source community created <a href="https://opentofu.org/" rel="external" target="_blank">OpenTofu</a> as an open source alternative to HashiCorp Terraform. The community-driven nature of OpenTofu means that it can avoid the negative consequences of corporate control, and also that it can develop community-requested features that HashiCorp may not have prioritized for Terraform. OpenTofu has seen rapid development and enthusiastic community adoption.

I've been an early adopter of OpenTofu and have been very happy with it. At Formation Bio, I led the transition from Terraform to OpenTofu, making the key code changes and providing support to other users in the organization. It's been a smooth and productive transition and we think the future is bright for OpenTofu.

## Spacelift

The IaC approach of OpenTofu and related tools involves writing code configurations that declare the desired cloud infrastructure, and then running the code to apply those configurations. This of course means that the code has to run somewhere. The simplest way to run the code is from an individual developer's computer, but this doesn't scale very well when teams are collaborating on the code together. Formation Bio ran its Terraform configurations from developer laptops initially, but it was time-consuming and problematic. To run infrastructure code in the cloud, products have been developed that are collectively known as <a href="https://opentofu.org/docs/intro/tacos/" rel="external" target="_blank">"TACOs"</a> (Tofu Automation and Collaboration).

One such TACO is <a href="https://spacelift.io/" rel="external" target="_blank">Spacelift</a>. A cloud consultancy called <a href="https://masterpoint.io/" rel="external" target="_blank">Masterpoint</a> helped with some of the initial setup of Spacelift, then I took on primary responsibility for Spacelift administration after Masterpoint was done. Spacelift has been a valuable tool for Formation Bio, and after seeing how beneficial it was, Spacelift published a <a href="https://spacelift.io/customers/formation-bio" rel="external" target="_blank">customer success story</a> about us.

As a Spacelift administrator, I would also highlight the following key features I've used:

- <a href="https://docs.spacelift.io/concepts/worker-pools" rel="external" target="_blank">Private worker pools</a>
- <a href="https://docs.spacelift.io/concepts/policy/push-policy" rel="external" target="_blank">Rego push policies</a>
- <a href="https://docs.spacelift.io/vendors/terraform/workflow-tool" rel="external" target="_blank">Custom workflow tool</a> - we've adapted this to support Terraspace, an IaC orchestration tool
- OpenTofu support - Spacelift helped us make a smooth transition from HashCorp Terraform to OpenTofu

## Snowflake

Developing drugs with AI is a data-intensive process, not only because of data Formation Bio themselves generate, but also datasets they acquire and use. For this reason, Formation Bio has a Data Platform team that helps to wrangle all the data. The Data Platform team has selected a "data warehouse" product called <a href="https://www.snowflake.com/en/" rel="external" target="_blank">Snowflake</a> to help store the data. I've been "embedded" within the Data Platform team and helping to administrate Snowflake, including using the <a href="https://search.opentofu.org/provider/snowflakedb/snowflake/latest" rel="external" target="_blank">Snowflake OpenTofu provider</a> to configure networking between Snowflake and other cloud platforms and networks.

## AWS network architecture

The large public clouds like Amazon Web Services (AWS) make it easy to sign up and get started, but don't always make it easy to follow best practices. As a result, corporations often figure things out as they go, and over time, they may find themselves with "technical debt" that needs to be paid off.

Formation Bio has been unusually diligent about their cloud infrastructure, but nonetheless has recently seen a need to re-architect their AWS network, particularly the public networking aspects. I've taken a lead role in defining the network architecture and developing expertise in the many resources involved, including VPCs (Virtual Private Clouds), VPC security groups, VPC subnets, route tables, internet gateways (IGWs), NAT gateways, load balancers (ALB/NLB), and more.
