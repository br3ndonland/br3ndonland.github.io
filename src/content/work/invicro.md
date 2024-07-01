---
title: Invicro
dateStart: 2019-03-11
dateEnd: 2019-12-13
image:
  src: "@images/brendon-smith-at-work-invicro.jpg"
  alt: Brendon Smith outside Invicro office
roles:
  - Software Engineer II
tags:
  - Docker
  - Git
  - GitLab
  - Perl
  - Shell
  - Vue.js
  - Web Development
---

## Overview

My first software engineering job was at <a href="https://invicro.com/" rel="external" target="_blank">Invicro</a>, a CRO (contract research organization) specializing in biomedical imaging. The scientific focus of the company was a motivating factor for me.

In terms of coding, I did a little bit of DevOps by creating an automated application install pipeline with Docker Compose and shell scripts. This helped engineers get their development environments up and running quickly.

I didn't do much other back-end work there. The back-end was written in Perl (with the Perl Catalyst framework), which is effectively obsolete, and I realized it wasn't going to be worth my time to learn an obsolete programming language. In retrospect, I think that was a good call.

I did enjoy doing front-end web development work though. At the time, we were refactoring our front-end from a nightmarish mess of jQuery files into Vue.js components.

## Vue.js

<a href="https://vuejs.org/" rel="external" target="_blank">Vue.js</a> calls itself "the progressive JavaScript framework." It's not just a tagline - I found Vue.js to be progressive, both in terms of learning and in terms of business.

### _Learning is progressive_

The progressive nature of Vue.js matches the progressive nature of learning.

- Vue.js is generally an approachable JavaScript framework. Its "components," reusable parts of a webpage, are structured into three sections (HTML for the template structure, JavaScript for interactivity, and CSS for styling). These three sections represent <a href="https://developer.mozilla.org/en-US/docs/Learn" rel="external" target="_blank">the three code languages that a browser runs</a> (HTML, CSS, JavaScript). So the layout of a Vue.js component matches the functionality of a web browser. Very intuitive.
- Learners can start small and simple and add complexity as they go. One example might be "<a href="https://en.wikipedia.org/wiki/Hydration_%28web_development%29" rel="external" target="_blank">hydration</a>" (adding interactivity to a webpage after it loads). With React (another competing JavaScript framework), terms like hydration are thrown around frequently without being clearly defined, making the learning process more difficult. With Vue.js, I didn't even need to be aware of the concept of hydration until much later when I was learning <a href="https://nuxt.com/" rel="external" target="_blank">Nuxt</a>.

### _Business development is progressive_

- When we learn about new technologies as coders, we frequently learn them with "greenfield" projects (new projects without many constraints). When working within a business however, changes are usually only made if they also make sense for the business. As we saw at Invicro, it's possible to gradually refactor a web application to Vue.js when the business calls for it. When we were replacing jQuery with Vue.js, we just had the Vue.js application added to a script tag in the `index.html`. We could replace one page or one feature at a time.
- The progressive nature of Vue.js also helps businesses in terms of onboarding and training new software engineers. Engineers can start small and learn as they go, and the company doesn't have to develop its own training materials. I found <a href="https://www.vuemastery.com/" rel="external" target="_blank">Vue Mastery</a> to be particularly helpful for learning. If you'd like a taste, you can see some of my <a href="https://github.com/br3ndonland/vue-mastery-notes" rel="external" target="_blank">Vue Mastery notes on GitHub</a>.
