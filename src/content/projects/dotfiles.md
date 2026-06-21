---
title: dotfiles
dateStart: 2019-03-12
dateEnd: Present
description: Computer setup and settings. Apple Silicon ready.
image:
  src: "@images/brendon-smith-home-desk.jpg"
  alt: Photo of Brendon Smith's standing desk at home
URLrepo: https://github.com/br3ndonland/dotfiles
---

My dotfiles repo contains my computer setup and settings. "Dotfiles" are application configuration and settings files. They frequently begin with a dot, hence the name. Dotfiles are compatible with Linux and macOS.

I use this repo to set up and automate my development environment. _Why?_

- **Make developer environments automated and disposable**. <a href="https://12factor.net/disposability" rel="external" target="_blank">Disposability</a> is an important concept in <a href="https://opentofu.org/docs/intro/use-cases/" rel="external" target="_blank">infrastructure-as-code DevOps</a>, <a href="https://www.cloudflare.com/learning/serverless/what-is-serverless/" rel="external" target="_blank">serverless computing</a>, <a href="https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions" rel="external" target="_blank">CI/CD</a>, and more recently, <a href="https://docs.github.com/en/codespaces/overview" rel="external" target="_blank">in-browser development environments</a>. Why aren't developers applying automation and disposability to their own computers? With an automated disposable developer environment, setup of a new machine is fast and easy. This approach is also liberating - I can purchase a new computer (or wipe an existing one), run a single script, and be up and running again in no time.
- **Know when and why settings change**. I not only know what tools and settings I'm using, but when and why I chose the tools and settings. This has been particularly important for VSCode, because settings change (and <a href="https://github.com/microsoft/vscode/labels/bug" rel="external" target="_blank">break</a>) frequently, and it helps to record troubleshooting info in the Git log.
- **Learn new skills**. I learn skills, like shell scripting, that are useful and don't go out of date quickly. I wouldn't know shell as well if I didn't work on my developer environment. I learn these skills by tinkering a little bit at a time, in an unstructured way. It's time I might not otherwise be writing code.
